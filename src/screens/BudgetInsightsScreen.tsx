import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";
import { useState } from "react";

const BudgetInsightsScreen = () => {
    const { getMonthlyTotals, getCategoryTotals, loading, budget, updateBudget } = useTransactions();

    // State for dates
    const [selectedDate, setSelectedDate] = useState(new Date());
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    // State for budget editing
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudgetStr, setNewBudgetStr] = useState(budget.toString());

    const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Added separate state for visibility to ensure no conflict

    const { expense, income, savings } = getMonthlyTotals(month, year);
    const categoryData = getCategoryTotals(month, year);
    const unspent = budget - expense;

    // Prepare Pie Chart Data
    const pieData = categoryData.map((item) => {
        return {
            value: item.amount,
            color: item.color,
            text: `${item.percentage}%`,
            category: item.category
        };
    }).sort((a, b) => b.value - a.value);

    const changeMonth = (direction: 'next' | 'prev') => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    const handleSaveBudget = () => {
        const val = parseInt(newBudgetStr, 10);
        if (isNaN(val) || val <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid budget amount");
            return;
        }
        updateBudget(val);
        setIsEditingBudget(false);
    };

    if (loading) {
        return <View style={styles.loader}><Text>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Budget Insights</Text>
                    <View style={styles.dateSelector}>
                        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.navBtn}>
                            <Text style={styles.navArrow}>{"<"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.dateText}>
                            📅 {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.navBtn}>
                            <Text style={styles.navArrow}>{">"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Overview Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>💡 Monthly Overview</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setNewBudgetStr(budget.toString());
                                setIsEditModalVisible(true);
                            }}
                            style={styles.editBtnContainer}
                        >
                            <Text style={styles.editBtn}>✏️ Edit Budget</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.budgetLabel}>Budget Goal: <Text style={styles.budgetValue}>₹{budget.toLocaleString()}</Text></Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={[styles.statValue, { color: '#2e7d32' }]}>₹{income.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.statItem, styles.statBorder]}>
                            <Text style={styles.statLabel}>Expense</Text>
                            <Text style={[styles.statValue, { color: '#e53935' }]}>₹{expense.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Diff</Text>
                            <Text style={[styles.statValue, { color: savings >= 0 ? '#1565c0' : '#c62828' }]}>
                                {savings >= 0 ? '+' : ''}₹{savings.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.highlightBox, { marginTop: 15, backgroundColor: unspent >= 0 ? '#f4fce3' : '#fff5f5' }]}>
                        <Text style={styles.calendarIcon}>{unspent >= 0 ? '💰' : '⚠️'}</Text>
                        <View>
                            <Text style={[styles.highlightAmount, { color: unspent >= 0 ? '#2f9e44' : '#e03131' }]}>
                                ₹{Math.abs(unspent).toLocaleString()}
                            </Text>
                            <Text style={styles.highlightLabel}>
                                {unspent >= 0 ? 'Remaining from Budget' : 'Over Budget'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Expense Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>✉️ Expense Breakdown</Text>
                    </View>

                    <Text style={styles.expenseAmount}>₹{expense.toLocaleString()}</Text>

                    {expense > 0 ? (
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <PieChart
                                data={pieData}
                                donut
                                showGradient
                                sectionAutoFocus
                                radius={90}
                                innerRadius={60}
                                innerCircleColor={'#fff'}
                                centerLabelComponent={() => {
                                    return (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 22, color: 'black', fontWeight: 'bold' }}>
                                                {Math.round((expense / budget) * 100)}%
                                            </Text>
                                            <Text style={{ fontSize: 14, color: 'gray' }}>Spent</Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    ) : (
                        <Text style={{ textAlign: 'center', marginVertical: 20, color: '#777' }}>No expenses this month</Text>
                    )}

                    {/* Legend / Category List */}
                    <View style={styles.legendContainer}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendText}>{item.category}</Text>
                                </View>
                                <Text style={styles.legendAmount}>₹{item.value.toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Budget Edit Modal */}
                <Modal visible={isEditModalVisible} transparent animationType="fade" onRequestClose={() => setIsEditModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Set Monthly Budget</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={newBudgetStr}
                                onChangeText={setNewBudgetStr}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveBudget} style={styles.saveBtn}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollViewContent: { padding: 20, paddingBottom: 100 },
    header: { alignItems: "center", marginBottom: 30 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#000" },
    dateSelector: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    dateText: { fontSize: 14, color: "#555" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", marginBottom: 15, justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    budgetLabel: { fontSize: 14, color: "#666", marginBottom: 15, textAlign: 'center' },
    budgetValue: { fontWeight: 'bold', color: '#333' },

    editBtnContainer: { padding: 5, backgroundColor: '#e3f2fd', borderRadius: 8 },
    editBtn: { color: '#1976d2', fontSize: 12, fontWeight: '600' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f3f5' },
    statItem: { flex: 1, alignItems: 'center' },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f3f5' },
    statLabel: { fontSize: 12, color: '#868e96', marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: 'bold' },

    highlightBox: {
        backgroundColor: "#f4fce3",
        borderRadius: 12,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center'
    },
    calendarIcon: { fontSize: 24, marginRight: 15 },
    highlightAmount: { fontSize: 20, fontWeight: "bold", color: "#2f9e44" },
    highlightLabel: { fontSize: 12, color: "#555" },

    expenseAmount: { fontSize: 32, fontWeight: "bold", color: "#000", marginBottom: 5 },

    trendRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    trendValue: { color: "#40c057", fontWeight: "bold", marginRight: 5 },
    trendLabel: { color: "#777" },

    barContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 20
    },
    barWrapper: { alignItems: 'center' },
    barLabel: { marginBottom: 5, color: '#777', fontSize: 12 },
    bar: { width: 60, borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelBtn: { padding: 10, marginRight: 10 },
    cancelText: { color: '#555' },
    saveBtn: { backgroundColor: '#2e7d32', padding: 10, borderRadius: 5 },
    saveText: { color: '#fff', fontWeight: 'bold' },

    navBtn: { paddingHorizontal: 15, paddingVertical: 5 },
    navArrow: { fontSize: 18, fontWeight: 'bold', color: '#555' },

    legendContainer: { marginTop: 10 },
    legendItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    legendText: { fontSize: 14, color: '#333' },
    legendAmount: { fontSize: 14, fontWeight: 'bold', color: '#555' }
});

export default BudgetInsightsScreen;
