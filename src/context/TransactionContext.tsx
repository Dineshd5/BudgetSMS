import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import {
    initDB,
    insertTransaction,
    getAllTransactions,
} from "../db/database";

// Types (Moved from HomeScreen)
export type Transaction = {
    id?: number;
    amount: number;
    type: "debit" | "credit";
    mode: "UPI" | "CARD" | "CASH" | "UNKNOWN";
    merchant: string;
    ref: string;
    timestamp: string;
};

interface TransactionContextType {
    transactions: Transaction[];
    loading: boolean;
    refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Helpers (Moved from HomeScreen)
function extractAmount(text: string): number | null {
    const match = text.match(/rs\.?\s?([\d,]+)/i);
    if (!match) return null;
    return Number(match[1].replace(/,/g, ""));
}

function extractType(text: string): "debit" | "credit" {
    const t = text.toLowerCase();
    if (
        t.includes("credit") ||
        t.includes("credited") ||
        t.includes("received") ||
        t.includes("is credited")
    ) {
        return "credit";
    }
    return "debit";
}

function extractMode(text: string): Transaction["mode"] {
    const t = text.toLowerCase();
    if (t.includes("upi")) return "UPI";
    if (t.includes("card")) return "CARD";
    if (t.includes("cash")) return "CASH";
    return "UNKNOWN";
}

function extractMerchant(text: string): string {
    const atMatch = text.match(/at\s([a-zA-Z0-9\s]+)/i);
    if (atMatch) return atMatch[1].trim();

    const upiMatch = text.match(/linked to\s([a-zA-Z0-9\-_.@]+)/i);
    if (upiMatch) return upiMatch[1];

    return "Unknown";
}

function extractRef(text: string): string {
    const match = text.match(/ref\s*no\.?\s*([0-9]+)/i);
    return match ? match[1] : "";
}

const BLOCK_WORDS = [
    "recharge", "offer", "validity", "plan", "unlimited", "data",
    "cashback", "reward", "limit", "cooling", "emi", "trial",
    "free", "days", "benefits",
];

function isTransactionSMS(body: string): boolean {
    const text = body.toLowerCase();
    if (BLOCK_WORDS.some(w => text.includes(w))) return false;

    const isDebit = text.includes("debit") || text.includes("debited") || text.includes("spent");
    const isCredit = text.includes("credit") || text.includes("credited") || text.includes("received") || text.includes("is credited");

    if (!isDebit && !isCredit) return false;
    if (!/rs\.?\s?\d/.test(text)) return false;
    if (!text.includes(" upi ") && !text.includes(" ref ") && !text.includes(" ref no") && !text.includes(" on ")) {
        return false;
    }
    return true;
}

function parseTransaction(body: string): Transaction | null {
    const amount = extractAmount(body);
    if (!amount) return null;

    return {
        amount,
        type: extractType(body),
        mode: extractMode(body),
        merchant: extractMerchant(body),
        ref: extractRef(body),
        timestamp: new Date().toISOString(),
    };
}

async function requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return true; // Assume granted on other platforms or handle differently

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
            title: "SMS Access",
            message: "This app reads bank SMS to track your expenses automatically.",
            buttonPositive: "Allow",
            buttonNegative: "Deny",
        }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const readSmsAndSync = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (Platform.OS !== "android") {
                resolve();
                return;
            }

            const filter = { box: "inbox", maxCount: 300 };

            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.log("SMS read failed:", fail);
                    resolve(); // Don't crash app on SMS fail
                },
                async (_count: number, smsList: string) => {
                    try {
                        const smsArray = JSON.parse(smsList);
                        for (const sms of smsArray) {
                            if (!isTransactionSMS(sms.body)) continue;
                            const tx = parseTransaction(sms.body);
                            if (!tx) continue;
                            await insertTransaction(tx);
                        }
                        resolve();
                    } catch (err) {
                        console.error(err);
                        resolve();
                    }
                }
            );
        });
    };

    const loadData = async () => {
        setLoading(true);
        await initDB();
        const allowed = await requestSmsPermission();
        if (allowed) {
            await readSmsAndSync();
        }
        const dbTx = await getAllTransactions();
        setTransactions(dbTx);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <TransactionContext.Provider value={{ transactions, loading, refreshTransactions: loadData }}>
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
