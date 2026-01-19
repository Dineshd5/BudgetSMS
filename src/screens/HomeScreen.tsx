import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert, RefreshControl, TextInput, Platform, Dimensions } from "react-native";
import { useTransactions, Transaction } from "../context/TransactionContext";
import React, { useState, useEffect } from "react";
import AddTransactionModal from "../components/AddTransactionModal";
import PermissionDisclosureModal from "../components/PermissionDisclosureModal";
import { PieChart } from "react-native-gifted-charts";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { transactions, loading, removeTransaction, refreshTransactions, requestSmsPermission, isSmsPermissionGranted } = useTransactions();
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
            <View style={styles.loader}>
                <Text>Loading transactions...</Text>
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
        { value: income === 0 && expense === 0 ? 1 : income, color: '#4caf50', text: 'Income' },
        { value: expense, color: '#e53935', text: 'Expense' },
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
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Overview</Text>
                    <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                </View>

                {/* Permission Banner */}
                {!isSmsPermissionGranted && Platform.OS === 'android' && (
                    <TouchableOpacity
                        style={styles.permissionBanner}
                        onPress={() => setIsPermissionModalVisible(true)}
                    >
                        <View style={styles.bannerIcon}>
                            <Text style={{ fontSize: 24 }}>✨</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Enable Auto-Tracking</Text>
                            <Text style={styles.bannerSubtitle}>Sync from SMS automatically.</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Rich Dashboard Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            innerRadius={60}
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12, color: '#777' }}>Balance</Text>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: balance >= 0 ? '#2e7d32' : '#c62828' }}>
                                            ₹{balance.toLocaleString()}
                                        </Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <View style={[styles.dot, { backgroundColor: '#4caf50' }]} />
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={styles.statValue}>₹{income.toLocaleString()}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <View style={[styles.dot, { backgroundColor: '#e53935' }]} />
                            <Text style={styles.statLabel}>Expense</Text>
                            <Text style={styles.statValue}>₹{expense.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Pending Approvals Card */}
                {pendingTransactions.length > 0 && (
                    <View style={styles.pendingCard}>
                        <View>
                            <Text style={styles.pendingTitle}>Pending Approvals</Text>
                            <Text style={styles.pendingSubtitle}>{pendingTransactions.length} transactions need review</Text>
                        </View>
                        <TouchableOpacity style={styles.reviewBtn} onPress={() => setIsPendingModalVisible(true)}>
                            <Text style={styles.reviewBtnText}>Review</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.sectionTitle}>
                    Recent Transactions
                </Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                            <Text style={styles.clearBtnText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.list}>
                    {filteredTransactions.length === 0 && (
                        <Text style={styles.noTransactions}>No approved transactions found.</Text>
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
                                    { borderLeftColor: isDebit ? "#e53935" : "#2e7d32" }
                                ]}
                            >
                                <View style={styles.row}>
                                    <View>
                                        <Text style={[styles.amount, { color: isDebit ? "#e53935" : "#2e7d32" }]}>
                                            ₹{tx.amount.toLocaleString()}
                                        </Text>
                                        <Text style={styles.date}>{new Date(tx.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.type, { color: isDebit ? "#e53935" : "#2e7d32" }]}>
                                            {isDebit ? "DEBIT" : "CREDIT"}
                                        </Text>
                                        <Text style={styles.source}>{tx.source || "Unknown"}</Text>
                                        <Text style={styles.category}>{tx.category}</Text>
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
                style={styles.fab}
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
    container: { padding: 16, backgroundColor: "#f5f7fa", flex: 1 },
    headerContainer: { marginBottom: 20, marginTop: 10 },
    headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1a1a1a" },
    headerDate: { fontSize: 14, color: "#666", marginTop: 2 },

    // Chart Card
    chartCard: {
        backgroundColor: '#fff',
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
    chartContainer: {
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 13, color: '#888', marginTop: 4, fontWeight: '500' },
    statValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    divider: { height: 30, width: 1, backgroundColor: '#eee' },

    noTransactions: { color: "#777", textAlign: 'center', marginTop: 20 },

    // Transaction Card
    card: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    amount: { fontSize: 18, fontWeight: "bold" },
    date: { fontSize: 12, color: "#999", marginTop: 4 },
    type: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
    source: { marginTop: 4, fontWeight: '600', fontSize: 15, color: '#333' },
    category: { fontSize: 12, color: "#888", marginTop: 2 },

    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 25,
        bottom: 25,
        backgroundColor: '#2e7d32',
        borderRadius: 30,
        elevation: 10,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    fabText: { color: "#fff", fontSize: 32, marginTop: -4 },


    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, height: 50 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    clearBtn: { padding: 5 },
    clearBtnText: { fontSize: 16, color: '#999' },
    list: { paddingBottom: 20 },
    dashboardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    dashboardCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    dashboardLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    dashboardValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginLeft: 4,
    },

    // Permission Banner
    permissionBanner: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    bannerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },

    pendingCard: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 16,
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbdefb',
    },
    pendingTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565c0' },
    pendingSubtitle: { fontSize: 12, color: '#1976d2', marginTop: 2 },
    reviewBtn: { backgroundColor: '#1976d2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, elevation: 2 },
    reviewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#fff', margin: 20, borderRadius: 16, padding: 24, maxHeight: '80%', elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    pendingItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 0, borderRadius: 20, marginLeft: 12, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});

const PendingReviewModal = ({ visible, onClose, transactions }: { visible: boolean, onClose: () => void, transactions: Transaction[] }) => {
    const { approveTransaction, ignoreTransaction } = useTransactions();
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const handleAction = async (id: string, action: 'approve' | 'ignore') => {
        // Optimistic update: Immediately hide it
        setProcessingIds(prev => [...prev, id]);

        // Perform unexpected action in background
        if (action === 'approve') {
            await approveTransaction(id);
        } else {
            await ignoreTransaction(id);
        }
    };

    // Filter out processed items immediately
    const displayedTransactions = transactions.filter(t => !processingIds.includes(t.id));

    return (
        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, !visible && { display: 'none' }]}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Review Pending ({displayedTransactions.length})</Text>
                <ScrollView>
                    {displayedTransactions.map(tx => {
                        const isDebit = tx.type === 'debit';
                        return (
                            <View key={tx.id} style={styles.pendingItem}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                            color: isDebit ? '#e53935' : '#2e7d32'
                                        }}>
                                            {isDebit ? "- " : "+ "}₹{tx.amount.toLocaleString()}
                                        </Text>
                                        <Text style={{
                                            fontSize: 10,
                                            marginLeft: 8,
                                            backgroundColor: isDebit ? '#ef9a9a' : '#a5d6a7',
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            color: isDebit ? '#b71c1c' : '#1b5e20'
                                        }}>
                                            {isDebit ? 'DEBIT' : 'CREDIT'}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{tx.source}</Text>
                                    <Text style={{ fontSize: 10, color: '#999' }}>{new Date(tx.date).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ffebee' }]} onPress={() => handleAction(tx.id, 'ignore')}>
                                        <Text style={{ color: '#c62828', fontWeight: 'bold' }}>✕</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]} onPress={() => handleAction(tx.id, 'approve')}>
                                        <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    {displayedTransactions.length === 0 && <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>No pending items.</Text>}
                </ScrollView>
                <TouchableOpacity onPress={onClose} style={{ marginTop: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
