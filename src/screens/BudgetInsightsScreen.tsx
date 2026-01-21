import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon, BulbIcon, EditIcon, MoneyIcon, AlertIcon, WalletIcon } from "../components/Icons";

const BudgetInsightsScreen = () => {
    const { getMonthlyTotals, getCategoryTotals, loading, budget, updateBudget } = useTransactions();
    const { theme, isDark } = useTheme();

    // State for dates
    const [selectedDate, setSelectedDate] = useState(new Date());
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    // State for budget editing
    const [newBudgetStr, setNewBudgetStr] = useState(budget.toString());
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Removed separate state, combined above

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
        setIsEditModalVisible(false);
    };

    if (loading) {
        return <View style={[styles.loader, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.text }}>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Budget Insights</Text>
                    <View style={[styles.dateSelector, { backgroundColor: theme.colors.card }]}>
                        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.navBtn}>
                            <ChevronLeft color={theme.colors.textSecondary} width={24} height={24} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CalendarIcon color={theme.colors.text} width={18} height={18} style={{ marginRight: 8 }} />
                            <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.navBtn}>
                            <ChevronRight color={theme.colors.textSecondary} width={24} height={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Overview Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <BulbIcon color={theme.colors.warning} width={24} height={24} style={{ marginRight: 10 }} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Monthly Overview</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setNewBudgetStr(budget.toString());
                                setIsEditModalVisible(true);
                            }}
                            style={styles.editBtnContainer}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <EditIcon color="#0077b6" width={14} height={14} style={{ marginRight: 4 }} />
                                <Text style={styles.editBtn}>Edit Budget</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.budgetLabel, { color: theme.colors.textSecondary }]}>Budget Goal: <Text style={[styles.budgetValue, { color: theme.colors.text }]}>₹{budget.toLocaleString()}</Text></Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Income</Text>
                            <Text style={[styles.statValue, { color: theme.colors.income }]}>₹{income.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.statItem, styles.statBorder]}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Expense</Text>
                            <Text style={[styles.statValue, { color: theme.colors.expense }]}>₹{expense.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Diff</Text>
                            <Text style={[styles.statValue, { color: savings >= 0 ? theme.colors.income : theme.colors.expense }]}>
                                {savings >= 0 ? '+' : ''}₹{savings.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.highlightBox, { marginTop: 15, backgroundColor: isDark ? (unspent >= 0 ? '#1a3a1f' : '#3a1a1f') : (unspent >= 0 ? '#f4fce3' : '#fff5f5') }]}>
                        {unspent >= 0 ?
                            <MoneyIcon color={isDark ? '#81c784' : '#2f9e44'} width={30} height={30} style={{ marginRight: 15 }} /> :
                            <AlertIcon color={isDark ? '#ef5350' : '#e03131'} width={30} height={30} style={{ marginRight: 15 }} />
                        }
                        <View>
                            <Text style={[styles.highlightAmount, { color: unspent >= 0 ? (isDark ? '#81c784' : '#2f9e44') : (isDark ? '#ef5350' : '#e03131') }]}>
                                ₹{Math.abs(unspent).toLocaleString()}
                            </Text>
                            <Text style={[styles.highlightLabel, { color: theme.colors.textSecondary }]}>
                                {unspent >= 0 ? 'Remaining from Budget' : 'Over Budget'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Expense Summary Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <WalletIcon color={theme.colors.primary} width={24} height={24} style={{ marginRight: 10 }} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Expense Breakdown</Text>
                        </View>
                    </View>

                    <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>₹{expense.toLocaleString()}</Text>

                    {expense > 0 ? (
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <PieChart
                                data={pieData}
                                donut
                                showGradient
                                sectionAutoFocus
                                radius={90}
                                innerRadius={60}
                                innerCircleColor={theme.colors.card}
                                centerLabelComponent={() => {
                                    return (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 22, color: theme.colors.text, fontWeight: 'bold' }}>
                                                {Math.round((expense / budget) * 100)}%
                                            </Text>
                                            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Spent</Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    ) : (
                        <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.textSecondary }}>No expenses this month</Text>
                    )}

                    {/* Legend / Category List */}
                    <View style={styles.legendContainer}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendText, { color: theme.colors.text }]}>{item.category}</Text>
                                </View>
                                <Text style={[styles.legendAmount, { color: theme.colors.text }]}>₹{item.value.toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Budget Edit Modal */}
                <Modal visible={isEditModalVisible} transparent animationType="fade" onRequestClose={() => setIsEditModalVisible(false)}>
                    <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Set Monthly Budget</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
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
    header: { alignItems: "center", marginBottom: 25 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#1a1a1a" },
    dateSelector: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateText: { fontSize: 15, fontWeight: '600', color: "#333", marginHorizontal: 10 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: { flexDirection: "row", marginBottom: 20, justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
    budgetLabel: { fontSize: 14, color: "#888", marginBottom: 15, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
    budgetValue: { fontWeight: 'bold', fontSize: 16 },

    editBtnContainer: { padding: 8, backgroundColor: '#f0f9ff', borderRadius: 12, marginLeft: 10 },
    editBtn: { color: '#0077b6', fontSize: 12, fontWeight: '700' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
    statItem: { flex: 1, alignItems: 'center' },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f5f5f5' },
    statLabel: { fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '500' },
    statValue: { fontSize: 17, fontWeight: 'bold' },

    highlightBox: {
        backgroundColor: "#f4fce3",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        marginTop: 15
    },
    calendarIcon: { fontSize: 24, marginRight: 15 },
    highlightAmount: { fontSize: 22, fontWeight: "bold", color: "#2f9e44" },
    highlightLabel: { fontSize: 13, color: "#555", marginTop: 2 },

    expenseAmount: { fontSize: 30, fontWeight: "bold", color: "#1a1a1a", marginBottom: 8, textAlign: 'center' },

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
    modalContent: { width: '85%', padding: 24, borderRadius: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { flex: 1, padding: 14, marginRight: 10, backgroundColor: '#f0f0f0', borderRadius: 12, alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: 'bold' },
    saveBtn: { flex: 1, backgroundColor: '#2e7d32', padding: 14, borderRadius: 12, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold' },

    navBtn: { paddingHorizontal: 15, paddingVertical: 5 },

    legendContainer: { marginTop: 20, paddingHorizontal: 10 },
    legendItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    legendText: { fontSize: 15, color: '#444', fontWeight: '500' },
    legendAmount: { fontSize: 15, fontWeight: 'bold' }
});

export default BudgetInsightsScreen;
