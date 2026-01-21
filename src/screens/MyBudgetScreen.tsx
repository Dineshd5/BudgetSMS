import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, ChevronRight, EditIcon, BulbIcon } from "../components/Icons";
import { useNavigation } from "@react-navigation/native";

const MyBudgetScreen = () => {
    const navigation = useNavigation();
    const { getMonthlyTotals, getDailyBreakdown, loading, transactions } = useTransactions();
    const { theme, isDark } = useTheme();

    // State for selected month/year - defaulting to current
    const [selectedDate, setSelectedDate] = useState(new Date());
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const { income, expense, savings } = getMonthlyTotals(month, year);

    // Prepare Chart Data
    const dailyData = getDailyBreakdown(month, year);
    const barData: any[] = [];

    // Calculate max value to determine minimum visual height (2% of max)
    const maxVal = dailyData.reduce((max, day) => Math.max(max, day.income, day.expense), 0);
    const minHeight = maxVal > 0 ? maxVal * 0.02 : 0;

    dailyData.forEach(day => {
        // Bar 1: Income
        barData.push({
            value: day.income > 0 ? Math.max(day.income, minHeight) : 0,
            realValue: day.income, // Store actual value for tooltip
            frontColor: '#40c057',
            label: day.day.toString(),
            spacing: 2,
            labelTextStyle: { color: 'gray', fontSize: 10 },
        });
        // Bar 2: Expense
        barData.push({
            value: day.expense > 0 ? Math.max(day.expense, minHeight) : 0,
            realValue: day.expense, // Store actual value for tooltip
            frontColor: '#fa5252',
            spacing: 20, // Gap between days
        });
    });

    // Detail Modal State
    const [detailType, setDetailType] = useState<'Income' | 'Expense' | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    const openDetail = (type: 'Income' | 'Expense') => {
        setDetailType(type);
        setIsDetailModalVisible(true);
    };

    // Filter transactions for the modal
    const detailTransactions = React.useMemo(() => {
        if (!detailType) return [];
        const typeFilter = detailType === 'Income' ? 'credit' : 'debit';
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month &&
                d.getFullYear() === year &&
                t.type === typeFilter &&
                t.status === 'approved'; // ONLY SHOW APPROVED
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [detailType, month, year, transactions]);

    const changeMonth = (direction: 'next' | 'prev') => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    if (loading) {
        return <View style={[styles.loader, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.text }}>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <ChevronLeft color={theme.colors.text} width={24} height={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>My Budget</Text>
                    <EditIcon color={theme.colors.text} width={20} height={20} />
                </View>

                {/* Date Selector */}
                <View style={styles.dateSelector}>
                    <View style={styles.dateNavContainer}>
                        <TouchableOpacity onPress={() => changeMonth('prev')} style={{ paddingHorizontal: 10 }}>
                            <ChevronLeft color={theme.colors.text} width={22} height={22} />
                        </TouchableOpacity>
                        <Text style={[styles.dateText, { color: theme.colors.text }]}>
                            {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth('next')} style={{ paddingHorizontal: 10 }}>
                            <ChevronRight color={theme.colors.text} width={22} height={22} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: theme.colors.income }]} />
                            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Income</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: theme.colors.expense }]} />
                            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Expense</Text>
                        </View>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={barData}
                            barWidth={8}
                            spacing={20}
                            initialSpacing={10}
                            noOfSections={4}
                            barBorderRadius={2}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                            renderTooltip={(item: any) => {
                                return (
                                    <View style={{ marginBottom: 20, marginLeft: -6, backgroundColor: theme.colors.card, padding: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border }}>
                                        <Text style={{ color: theme.colors.text, fontSize: 10 }}>₹{item.realValue?.toLocaleString() ?? item.value}</Text>
                                    </View>
                                );
                            }}
                            width={Math.max(340, dailyData.length * 30)} // Dynamic width: 30px per day
                        />
                    </ScrollView>
                </View>

                {/* Summary Rows - Clickable */}
                <View style={styles.summaryContainer}>
                    <SummaryRow label="Income" amount={income} color={theme.colors.income} textColor={theme.colors.text} onPress={() => openDetail('Income')} />
                    <SummaryRow label="Expense" amount={expense} color={theme.colors.expense} textColor={theme.colors.text} onPress={() => openDetail('Expense')} />
                    <SummaryRow label="Left for Saving" amount={savings} color={theme.colors.textSecondary} textColor={theme.colors.text} />
                </View>

                {/* Insight Card */}
                <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <BulbIcon color={theme.colors.warning} width={18} height={18} style={{ marginRight: 8 }} />
                        <Text style={[styles.insightTitle, { color: theme.colors.text, marginBottom: 0 }]}>Insight</Text>
                    </View>
                    <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                        {savings > 0
                            ? `You have saved ₹${savings.toLocaleString()} this month!`
                            : "Your expenses exceeded your income this month."}
                    </Text>
                </View>
            </ScrollView>

            {/* Detail Modal */}
            {isDetailModalVisible && (
                <View style={[styles.detailModalOverlay, { backgroundColor: theme.colors.overlay }]}>
                    <View style={[styles.detailModalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.detailHeader}>
                            <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{detailType} Details</Text>
                            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} style={[styles.closeButton, { backgroundColor: isDark ? theme.colors.surface : '#f1f3f5' }]}>
                                <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        {detailTransactions.length === 0 ? (
                            <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>No transactions found.</Text>
                        ) : (
                            <FlatList
                                data={detailTransactions}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.transactionRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.txSource, { color: theme.colors.text }]}>{item.source || "Unknown"}</Text>
                                            <Text style={[styles.txDate, { color: theme.colors.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={[styles.txAmount, { color: detailType === 'Income' ? theme.colors.income : theme.colors.expense }]}>
                                            {detailType === 'Income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const SummaryRow = ({ label, amount, color, textColor, onPress }: { label: string, amount: number, color: string, textColor: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.summaryRow} onPress={onPress} disabled={!onPress}>
        <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.summaryLabel, { color: textColor }]}>{label}</Text>
        </View>
        <View style={styles.row}>
            <Text style={[styles.summaryAmount, { color: textColor }]}>{amount.toLocaleString()}</Text>
            {onPress && <ChevronRight color="#ccc" width={20} height={20} />}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backIcon: { fontSize: 24, padding: 5, color: '#333' },
    title: { fontSize: 18, fontWeight: "600" },
    editIcon: { fontSize: 20, padding: 5 },
    dateSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    dateText: { fontSize: 20, fontWeight: "bold" },
    legendContainer: { flexDirection: "row" },
    legendItem: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    legendText: { fontSize: 12 },
    chartContainer: {
        alignItems: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    summaryContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    row: { flexDirection: "row", alignItems: "center" },
    dateNavContainer: { flexDirection: 'row', alignItems: 'center' },
    summaryLabel: { fontSize: 16, fontWeight: "500", marginLeft: 10 },
    summaryAmount: { fontSize: 16, fontWeight: "bold" },
    chevron: { fontSize: 18, color: "#ccc" },
    insightCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    insightTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
    insightText: { fontSize: 14 },
    detailModalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    detailModalContent: {
        width: '90%',
        maxHeight: '70%',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
        borderRadius: 8,
    },
    closeButtonText: {
        fontWeight: 'bold',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    txSource: {
        fontSize: 16,
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyBudgetScreen;
