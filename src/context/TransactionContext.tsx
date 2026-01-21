import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    initDB,
    insertTransaction,
    getAllTransactions,
    deleteAllTransactions,
    deleteTransaction,
    updateTransaction as dbUpdateTransaction,
    saveContact,
    getAllContacts,
} from "../db/database";
import { parseSms } from "../utils/smsParser";

// --- Types ---
export type TransactionType = "credit" | "debit";

export type Transaction = {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string; // ISO string
    source?: string;
    status: 'pending' | 'approved' | 'ignored';
};

// --- Context Interface ---
interface TransactionContextType {
    transactions: Transaction[];
    loading: boolean;
    budget: number;
    updateBudget: (newBudget: number) => void;
    addTransaction: (tx: Omit<Transaction, "id" | "status">) => Promise<void>;
    editTransaction: (id: string, tx: Omit<Transaction, "id" | "status">) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    approveTransaction: (id: string) => Promise<void>;
    ignoreTransaction: (id: string) => Promise<void>;
    clearTransactions: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    updateContactName: (id: string, name: string) => Promise<void>;
    requestSmsPermission: () => Promise<void>;
    isSmsPermissionGranted: boolean;

    // Derived Data Getters
    getTransactionsByMonth: (month: number, year: number) => Transaction[];
    getWeeklySummary: (month: number, year: number) => { label: string; value: number; frontColor: string }[];
    getDailyBreakdown: (month: number, year: number) => { day: number; income: number; expense: number }[];
    getMonthlyTotals: (month: number, year: number) => { income: number; expense: number; savings: number };
    getCategoryTotals: (month: number, year: number) => { category: string; amount: number; percentage: string; color: string }[];
    getPersonLedger: () => { id: string; name: string; totalReceived: number; totalSent: number; lastDate: string }[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// --- Provider ---
export const TransactionProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [contacts, setContacts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [budget, setBudget] = useState(50000); // Default budget
    const [isSmsPermissionGranted, setIsSmsPermissionGranted] = useState(false);

    // Load persisted budget on mount
    useEffect(() => {
        const loadBudget = async () => {
            try {
                const savedBudget = await AsyncStorage.getItem('user_budget');
                if (savedBudget) {
                    setBudget(parseInt(savedBudget, 10));
                }
            } catch (e) {
                console.error("Failed to load budget", e);
            }
        };
        loadBudget();
    }, []);

    const checkPermissionStatus = useCallback(async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
            setIsSmsPermissionGranted(granted);
            return granted;
        }
        return false;
    }, []);

    const updateBudget = useCallback(async (newBudget: number) => {
        setBudget(newBudget);
        try {
            await AsyncStorage.setItem('user_budget', newBudget.toString());
        } catch (e) {
            console.error("Failed to save budget", e);
        }
    }, []);

    const refreshTransactionsInternal = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        await initDB();

        // Check permission status but DO NOT REQUEST IT
        const hasPermission = await checkPermissionStatus();

        if (hasPermission) {
            await readSmsAndSync();
        }

        const dbTx = await getAllTransactions();

        // Map DB shape to App shape
        const mapped: Transaction[] = dbTx.map((t: any) => ({
            id: t.id.toString(),
            amount: t.amount,
            type: t.type as TransactionType,
            category: t.category, // DB 'category' column
            date: t.date, // DB 'date' column
            source: t.source, // DB 'source' column
            status: t.status || 'pending',
        }));

        setTransactions(mapped);

        // Load contacts
        const loadedContacts = await getAllContacts();
        setContacts(loadedContacts);

        if (!silent) setLoading(false);
    }, [checkPermissionStatus]);

    const requestSmsPermission = useCallback(async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_SMS
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setIsSmsPermissionGranted(true);
                    await refreshTransactionsInternal(false);
                } else {
                    setIsSmsPermissionGranted(false);
                }
            } catch (err) {
                console.warn(err);
            }
        }
    }, [refreshTransactionsInternal]);

    // --- Actions ---
    const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "status">) => {
        await insertTransaction({
            amount: tx.amount,
            type: tx.type,
            mode: tx.category,
            merchant: tx.source || "Unknown",
            ref: `manual-${Date.now()}`,
            timestamp: tx.date,
            status: 'approved', // Manual adds are auto-approved
        });
        await refreshTransactionsInternal(true);
    }, [refreshTransactionsInternal]);

    const editTransaction = useCallback(async (id: string, tx: Omit<Transaction, "id" | "status">) => {
        await dbUpdateTransaction(id, {
            amount: tx.amount,
            type: tx.type,
            mode: tx.category,
            merchant: tx.source || "Unknown",
            timestamp: tx.date,
        }); // Preserves existing status
        await refreshTransactionsInternal(true);
    }, [refreshTransactionsInternal]);

    const removeTransaction = useCallback(async (id: string) => {
        await deleteTransaction(id);
        await refreshTransactionsInternal(true);
    }, [refreshTransactionsInternal]);

    const approveTransaction = useCallback(async (id: string) => {
        await dbUpdateTransaction(id, { status: 'approved' });
        await refreshTransactionsInternal(true);
    }, [refreshTransactionsInternal]);

    const ignoreTransaction = useCallback(async (id: string) => {
        // Option A: Delete it. Option B: Mark as ignored. 
        // User said "ignore span messages... i dont need to add which are not look logical".
        // Deleting keeps DB clean, but marking 'ignored' allows undo.
        // Let's delete for now to keep it clean as per "dont need to add".
        await deleteTransaction(id);
        await refreshTransactionsInternal(true);
    }, [refreshTransactionsInternal]);

    const clearTransactions = useCallback(async () => {
        await deleteAllTransactions();
        setTransactions([]);
    }, []);

    const updateContactName = useCallback(async (id: string, name: string) => {
        try {
            await saveContact(id, name);
            setContacts(prev => ({ ...prev, [id]: name }));
        } catch (error) {
            console.error("Failed to update contact name:", error);
        }
    }, []);

    const readSmsAndSync = async (): Promise<void> => {
        if (Platform.OS !== "android") return;

        // Increase limit to scan more history
        const filter = { box: "inbox", maxCount: 5000 };

        // Bank Keywords for robust filtering (lowercased)
        const BANK_KEYWORDS = {
            TMB: ["tmbank"],
            SBI: ["sbiinb", "sbiupi", "sbipsg"],
            HDFC: ["hdfcbk"],
            ICICI: ["icicib"],
            AXIS: ["axisbk"],
            UNION: ["ubinbk"],
            CANARA: ["canbnk"],
            KOTAK: ["kotakb"],
            IDBI: ["idbibk"],
            BOI: ["boiind"],
            PNB: ["pnbmbk", "pnbsms"],
            FED: ["fedbnk"],
        };

        return new Promise((resolve) => {
            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.log("SMS read failed:", fail);
                    resolve();
                },
                async (count: number, smsList: string) => {
                    try {
                        const smsArray = JSON.parse(smsList);
                        console.log(`Scan Complete: Retrieved ${smsArray.length} messages.`);

                        for (const sms of smsArray) {
                            // ROBUST HEADER FILTER
                            // Check against known bank keywords
                            const sender = sms.address.toLowerCase();
                            let detectedBank = null;

                            for (const [bank, keywords] of Object.entries(BANK_KEYWORDS)) {
                                if (keywords.some(k => sender.includes(k))) {
                                    detectedBank = bank;
                                    break;
                                }
                            }

                            if (!detectedBank) continue;

                            // SPAM FILTER
                            const spamKeywords = /otp|code|auth|login|verification|won|prize|lottery|expire|cyber|loan|block|casino|rummy/i;
                            if (spamKeywords.test(sms.body)) continue;

                            const parsed = parseSms(sms.body, sms.date);
                            if (!parsed) continue;

                            // Insert into DB with pending status
                            // Use sms._id as the unique Key to prevent collisions
                            await insertTransaction({
                                amount: parsed.amount,
                                type: parsed.type,
                                mode: parsed.category,
                                merchant: parsed.merchant || detectedBank, // Fallback to bank name if merchant unknown
                                ref: sms._id.toString(),
                                timestamp: parsed.date,
                                status: 'pending',
                            });
                        }
                        resolve();
                    } catch (err) {
                        console.error(err);
                        resolve();
                    }
                }
            );
        });
    }

    useEffect(() => {
        refreshTransactionsInternal();
    }, [refreshTransactionsInternal]);


    // --- Derived State (Memoized) ---

    // IMPORTANT: Derived filtering now only returns APPROVED transactions (for budgets/ledger)
    // The main 'transactions' state contains ALL (pending + approved) for the UI to list.

    const getTransactionsByMonth = useCallback((month: number, year: number) => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year && t.status === 'approved';
        });
    }, [transactions]);

    const getMonthlyTotals = useCallback((month: number, year: number) => {
        const monthlyTx = getTransactionsByMonth(month, year);
        const income = monthlyTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthlyTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, savings: income - expense };
    }, [getTransactionsByMonth]);

    const getDailyBreakdown = useCallback((month: number, year: number) => {
        const monthlyTx = getTransactionsByMonth(month, year);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const result: { day: number; income: number; expense: number }[] = [];

        for (let i = 1; i <= daysInMonth; i++) {
            result.push({ day: i, income: 0, expense: 0 });
        }

        monthlyTx.forEach(t => {
            const d = new Date(t.date);
            const day = d.getDate();
            if (t.type === 'credit') {
                result[day - 1].income += t.amount;
            } else {
                result[day - 1].expense += t.amount;
            }
        });

        return result;
    }, [getTransactionsByMonth]);

    const getWeeklySummary = useCallback((month: number, year: number) => {
        // Keeping for backward compatibility or switching to daily
        // This was the old "Sun-Mon" logic which is confusing. 
        // We will likely stop using this in MyBudgetScreen.
        const monthlyTx = getTransactionsByMonth(month, year);
        const result = [
            { label: "Sun", value: 0, frontColor: "#b2f2bb" },
            { label: "Mon", value: 0, frontColor: "#b2f2bb" },
            { label: "Tue", value: 0, frontColor: "#b2f2bb" },
            { label: "Wed", value: 0, frontColor: "#b2f2bb" },
            { label: "Thu", value: 0, frontColor: "#b2f2bb" },
            { label: "Fri", value: 0, frontColor: "#b2f2bb" },
            { label: "Sat", value: 0, frontColor: "#b2f2bb" },
        ];

        monthlyTx.filter(t => t.type === 'debit').forEach(t => {
            const d = new Date(t.date);
            const day = d.getDay();
            result[day].value += t.amount;
            if (result[day].value > 1000) result[day].frontColor = "#40c057";
        });

        return result;
    }, [getTransactionsByMonth]);

    const getCategoryTotals = useCallback((month: number, year: number) => {
        const monthlyTx = getTransactionsByMonth(month, year);
        const totals: Record<string, number> = {};
        let totalExp = 0;

        monthlyTx.filter(t => t.type === 'debit').forEach(t => {
            const cat = t.category || "General";
            totals[cat] = (totals[cat] || 0) + t.amount;
            totalExp += t.amount;
        });

        const colors = ['#fcc419', '#f03e3e', '#339af0', '#343a40', '#22b8cf', '#e9ecef'];

        return Object.keys(totals).map((cat, i) => ({
            category: cat,
            amount: totals[cat],
            percentage: totalExp === 0 ? "0%" : Math.round((totals[cat] / totalExp) * 100) + "%",
            color: colors[i % colors.length]
        })).sort((a, b) => b.amount - a.amount);
    }, [getTransactionsByMonth]);

    const getPersonLedger = useCallback(() => {
        const ledger: Record<string, { id: string; name: string; totalReceived: number; totalSent: number; lastDate: string; lastTs: number }> = {};

        transactions.forEach(t => {
            if (t.status !== 'approved') return; // Only show approved in ledger

            const rawId = t.source || "Unknown";
            // Check if we have a contact name or use the raw ID
            // We use rawId as the key to group by unique UPI IDs

            if (!ledger[rawId]) {
                const displayName = contacts[rawId] || rawId; // Use contact name if available
                ledger[rawId] = { id: rawId, name: displayName, totalReceived: 0, totalSent: 0, lastDate: t.date, lastTs: new Date(t.date).getTime() };
            }
            if (t.type === 'credit') ledger[rawId].totalReceived += t.amount;
            else ledger[rawId].totalSent += t.amount;

            const ts = new Date(t.date).getTime();
            if (ts > ledger[rawId].lastTs) {
                ledger[rawId].lastTs = ts;
                ledger[rawId].lastDate = t.date;
            }
        });

        return Object.values(ledger).sort((a, b) => b.lastTs - a.lastTs);
    }, [transactions, contacts]);

    const value = useMemo(() => ({
        transactions,
        loading,
        budget,
        updateBudget,
        addTransaction,
        editTransaction,
        removeTransaction,
        approveTransaction,
        ignoreTransaction,
        clearTransactions,
        refreshTransactions: refreshTransactionsInternal,
        updateContactName,
        getTransactionsByMonth,
        getWeeklySummary,
        getDailyBreakdown,
        getMonthlyTotals,
        getCategoryTotals,
        getPersonLedger,
        requestSmsPermission,
        isSmsPermissionGranted
    }), [transactions, loading, budget, updateBudget, addTransaction, editTransaction, removeTransaction, approveTransaction, ignoreTransaction, clearTransactions, refreshTransactionsInternal, updateContactName, getTransactionsByMonth, getWeeklySummary, getDailyBreakdown, getMonthlyTotals, getCategoryTotals, getPersonLedger, requestSmsPermission, isSmsPermissionGranted]);

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error("useTransactions must be used within a TransactionProvider");
    }
    return context;
};
