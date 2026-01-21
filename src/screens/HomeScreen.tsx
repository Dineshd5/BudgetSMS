import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert, RefreshControl, TextInput, Platform, Dimensions } from "react-native";
import { useTransactions, Transaction } from "../context/TransactionContext";
import { useTheme } from "../context/ThemeContext";
import React, { useState, useEffect } from "react";
import AddTransactionModal from "../components/AddTransactionModal";
import PermissionDisclosureModal from "../components/PermissionDisclosureModal";
import { PieChart } from "react-native-gifted-charts";
import { SparklesIcon, CloseIcon, CheckIcon } from "../components/Icons";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { transactions, loading, removeTransaction, refreshTransactions, requestSmsPermission, isSmsPermissionGranted } = useTransactions();
    const { theme, isDark } = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
    const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshTransactions();
        setRefreshing(false);
    }, []);

    const handleLongPress = (tx: Transaction) => {
        Alert.alert(
            "Manage Transaction",
            "Choose an action",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("Confirm", "Delete this transaction?", [
                            { text: "No", style: "cancel" },
                            { text: "Yes", onPress: () => removeTransaction(tx.id) }
                        ]);
                    }
                },
                {
                    text: "Edit",
                    onPress: () => {
                        setSelectedTransaction(tx);
                        setIsModalVisible(true);
                    }
                }
            ]
        );
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
    };

    const handlePermissionAccept = async () => {
        setIsPermissionModalVisible(false);
        await requestSmsPermission();
    };

    if (loading) {
        return (
            <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>Loading transactions...</Text>
            </View>
        );
    }

    // Filter for approved items only for the main list
    const approvedTransactions = transactions.filter(t => t.status === 'approved');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');

    // Dashboard Calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthTx = approvedTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = currentMonthTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    const pieData = [
        { value: income === 0 && expense === 0 ? 1 : income, color: theme.colors.income, text: 'Income' },
        { value: expense, color: theme.colors.expense, text: 'Expense' },
    ];

    // Sort by date desc
    const sortedTransactions = [...approvedTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filteredTransactions = sortedTransactions.filter(t => {
        const q = searchQuery.toLowerCase();
        return (
            t.category.toLowerCase().includes(q) ||
            (t.source || "").toLowerCase().includes(q) ||
            t.amount.toString().includes(q)
        );
    });

    return (
        <>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Overview</Text>
                    <Text style={[styles.headerDate, { color: theme.colors.textSecondary }]}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                </View>

                {/* Permission Banner */}
                {!isSmsPermissionGranted && Platform.OS === 'android' && (
                    <TouchableOpacity
                        style={[styles.permissionBanner, { backgroundColor: isDark ? '#1a3a1f' : '#e8f5e9', borderColor: isDark ? '#2d5a31' : '#c8e6c9' }]}
                        onPress={() => setIsPermissionModalVisible(true)}
                    >
                        <View style={[styles.bannerIcon, { backgroundColor: theme.colors.surface }]}>
                            <SparklesIcon color={theme.colors.primary} width={24} height={24} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.bannerTitle, { color: theme.colors.primary }]}>Enable Auto-Tracking</Text>
                            <Text style={[styles.bannerSubtitle, { color: theme.colors.textSecondary }]}>Sync from SMS automatically.</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Rich Dashboard Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={60}
                            innerRadius={45}
                            innerCircleColor={theme.colors.card}
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Balance</Text>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: balance >= 0 ? theme.colors.income : theme.colors.expense }}>
                                            ₹{balance.toLocaleString()}
                                        </Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <View style={[styles.dot, { backgroundColor: theme.colors.income }]} />
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Income</Text>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>₹{income.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.statItem}>
                            <View style={[styles.dot, { backgroundColor: theme.colors.expense }]} />
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Expense</Text>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>₹{expense.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Pending Approvals Card */}
                {pendingTransactions.length > 0 && (
                    <View style={[styles.pendingCard, { backgroundColor: isDark ? '#1a2a3a' : '#e3f2fd', borderColor: isDark ? '#2a4a5a' : '#bbdefb' }]}>
                        <View>
                            <Text style={[styles.pendingTitle, { color: isDark ? '#6ab7ff' : '#1565c0' }]}>Pending Approvals</Text>
                            <Text style={[styles.pendingSubtitle, { color: isDark ? '#5a9dd8' : '#1976d2' }]}>{pendingTransactions.length} transactions need review</Text>
                        </View>
                        <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: isDark ? '#5a9dd8' : '#1976d2' }]} onPress={() => setIsPendingModalVisible(true)}>
                            <Text style={styles.reviewBtnText}>Review</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Recent Transactions
                </Text>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                            <CloseIcon color={theme.colors.textSecondary} width={16} height={16} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.list}>
                    {filteredTransactions.length === 0 && (
                        <Text style={[styles.noTransactions, { color: theme.colors.textSecondary }]}>No approved transactions found.</Text>
                    )}

                    {filteredTransactions.map(tx => {
                        const isDebit = tx.type === "debit";

                        return (
                            <TouchableOpacity
                                key={tx.id}
                                onLongPress={() => handleLongPress(tx)}
                                delayLongPress={500}
                                activeOpacity={0.8}
                                style={[
                                    styles.card,
                                    { backgroundColor: theme.colors.card, borderLeftColor: isDebit ? theme.colors.expense : theme.colors.income }
                                ]}
                            >
                                <View style={styles.row}>
                                    <View>
                                        <Text style={[styles.amount, { color: isDebit ? theme.colors.expense : theme.colors.income }]}>
                                            {isDebit ? "-" : "+"}₹{tx.amount.toLocaleString()}
                                        </Text>
                                        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{new Date(tx.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.type, { color: isDebit ? theme.colors.expense : theme.colors.income }]}>
                                            {isDebit ? "DEBIT" : "CREDIT"}
                                        </Text>
                                        <Text style={[styles.source, { color: theme.colors.text }]}>{tx.source || "Unknown"}</Text>
                                        <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{tx.category}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Pending Modal */}
            {isPendingModalVisible && (
                <PendingReviewModal
                    visible={isPendingModalVisible}
                    onClose={() => setIsPendingModalVisible(false)}
                    transactions={pendingTransactions}
                />
            )}

            {/* Permission Disclosure Modal */}
            <PermissionDisclosureModal
                visible={isPermissionModalVisible}
                onDismiss={() => setIsPermissionModalVisible(false)}
                onAccept={handlePermissionAccept}
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                onPress={() => {
                    setSelectedTransaction(null);
                    setIsModalVisible(true);
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <AddTransactionModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                initialTransaction={selectedTransaction}
            />
        </>
    );
}

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 16, flex: 1 },
    headerContainer: { marginBottom: 20, marginTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: "bold" },
    headerDate: { fontSize: 14, marginTop: 2 },

    // Chart Card
    chartCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
    },
    chartContainer: { marginBottom: 20 },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 13, marginTop: 4, fontWeight: '500' },
    statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    divider: { height: 30, width: 1 },

    noTransactions: { textAlign: 'center', marginTop: 20 },

    // Transaction Card
    card: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    amount: { fontSize: 18, fontWeight: "bold" },
    date: { fontSize: 12, marginTop: 4 },
    type: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
    source: { marginTop: 4, fontWeight: '600', fontSize: 14, width: 150, textAlign: "right" },
    category: { fontSize: 12, marginTop: 2 },

    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 25,
        bottom: 25,
        borderRadius: 30,
        elevation: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    fabText: { color: "#fff", fontSize: 32, marginTop: -4 },

    searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, height: 50 },
    searchInput: { flex: 1, fontSize: 16 },
    clearBtn: { padding: 5 },
    clearBtnText: { fontSize: 16 },
    list: { paddingBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 4 },

    // Permission Banner
    permissionBanner: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    bannerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bannerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    bannerSubtitle: { fontSize: 13, lineHeight: 18 },

    pendingCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    pendingTitle: { fontSize: 16, fontWeight: 'bold' },
    pendingSubtitle: { fontSize: 12, marginTop: 2 },
    reviewBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, elevation: 2 },
    reviewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center' },
    modalContent: { margin: 20, borderRadius: 16, padding: 24, maxHeight: '80%', elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    pendingItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 0, borderRadius: 20, marginLeft: 12, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});

const PendingReviewModal = ({ visible, onClose, transactions }: { visible: boolean, onClose: () => void, transactions: Transaction[] }) => {
    const { approveTransaction, ignoreTransaction } = useTransactions();
    const { theme, isDark } = useTheme();
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const handleAction = async (id: string, action: 'approve' | 'ignore') => {
        setProcessingIds(prev => [...prev, id]);
        if (action === 'approve') {
            await approveTransaction(id);
        } else {
            await ignoreTransaction(id);
        }
    };

    const displayedTransactions = transactions.filter(t => !processingIds.includes(t.id));

    return (
        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, { backgroundColor: theme.colors.overlay }, !visible && { display: 'none' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Review Pending ({displayedTransactions.length})</Text>
                <ScrollView>
                    {displayedTransactions.map(tx => {
                        const isDebit = tx.type === 'debit';
                        return (
                            <View key={tx.id} style={[styles.pendingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                            color: isDebit ? theme.colors.expense : theme.colors.income
                                        }}>
                                            {isDebit ? "- " : "+ "}₹{tx.amount.toLocaleString()}
                                        </Text>
                                        <Text style={{
                                            fontSize: 10,
                                            marginLeft: 8,
                                            backgroundColor: isDebit ? (isDark ? '#5a2121' : '#ef9a9a') : (isDark ? '#2d5a31' : '#a5d6a7'),
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            color: isDebit ? (isDark ? '#ff6b6b' : '#b71c1c') : (isDark ? '#81c784' : '#1b5e20')
                                        }}>
                                            {isDebit ? 'DEBIT' : 'CREDIT'}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>{tx.source}</Text>
                                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>{new Date(tx.date).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#5a2121' : '#ffebee' }]} onPress={() => handleAction(tx.id, 'ignore')}>
                                        <CloseIcon color={theme.colors.error} width={20} height={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#2d5a31' : '#e8f5e9' }]} onPress={() => handleAction(tx.id, 'approve')}>
                                        <CheckIcon color={theme.colors.success} width={20} height={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    {displayedTransactions.length === 0 && <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 20 }}>No pending items.</Text>}
                </ScrollView>
                <TouchableOpacity onPress={onClose} style={{ marginTop: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
