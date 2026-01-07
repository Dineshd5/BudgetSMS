import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert, RefreshControl, TextInput } from "react-native";
import { useTransactions, Transaction } from "../context/TransactionContext";
import React, { useState } from "react";
import AddTransactionModal from "../components/AddTransactionModal";

export default function HomeScreen() {
    const { transactions, loading, removeTransaction, refreshTransactions } = useTransactions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
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
            >
                <Text style={styles.headerTitle}>
                    My Dashboard
                </Text>

                {/* Dashboard Summary */}
                <View style={styles.dashboardContainer}>
                    <View style={[styles.dashboardCard, { backgroundColor: '#e8f5e9' }]}>
                        <Text style={styles.dashboardLabel}>Income</Text>
                        <Text style={[styles.dashboardValue, { color: '#2e7d32' }]}>
                            ₹{approvedTransactions.filter(t => t.type === 'credit' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </Text>
                    </View>
                    <View style={[styles.dashboardCard, { backgroundColor: '#ffebee' }]}>
                        <Text style={styles.dashboardLabel}>Expense</Text>
                        <Text style={[styles.dashboardValue, { color: '#c62828' }]}>
                            ₹{approvedTransactions.filter(t => t.type === 'debit' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </Text>
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
    container: { padding: 16, backgroundColor: "#fff" },
    headerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, marginTop: 16, color: "#333" },
    noTransactions: { color: "#777" },
    card: {
        marginBottom: 12,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#fafafa",
        borderLeftWidth: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    amount: { fontSize: 20, fontWeight: "bold" },
    date: { fontSize: 12, color: "#777" },
    type: { fontSize: 12 },
    source: { marginTop: 6, fontWeight: '500' },
    category: { fontSize: 12, color: "#777" },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#2e7d32',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: { color: "#fff", fontSize: 30, marginTop: -2 },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, paddingHorizontal: 15, height: 45, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    clearBtn: { padding: 5 },
    clearBtnText: { fontSize: 16, color: '#999' },
    list: {},
    dashboardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dashboardCard: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dashboardLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    dashboardValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginLeft: 5,
    },
    pendingCard: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbdefb',
    },
    pendingTitle: { fontSize: 16, fontWeight: 'bold', color: '#0d47a1' },
    pendingSubtitle: { fontSize: 12, color: '#1976d2' },
    reviewBtn: { backgroundColor: '#1976d2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    reviewBtnText: { color: '#fff', fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
    pendingItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 10, borderRadius: 20, marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
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
