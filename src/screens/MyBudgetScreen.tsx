import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";
import { ChevronLeft, ChevronRight } from "../components/Icons";

import { useNavigation } from "@react-navigation/native";

const MyBudgetScreen = () => {
    const navigation = useNavigation();
    const { getMonthlyTotals, getDailyBreakdown, loading, transactions } = useTransactions();

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
        return <View style={styles.loader}><Text>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <ChevronLeft color="#333" width={24} height={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Budget</Text>
                    <Text style={styles.editIcon}>✎</Text>
                </View>

                {/* Date Selector */}
                <View style={styles.dateSelector}>
                    <View style={styles.dateNavContainer}>
                        <TouchableOpacity onPress={() => changeMonth('prev')} style={{ paddingHorizontal: 10 }}>
                            <ChevronLeft color="#000" width={22} height={22} />
                        </TouchableOpacity>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth('next')} style={{ paddingHorizontal: 10 }}>
                            <ChevronRight color="#000" width={22} height={22} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: "#40c057" }]} />
                            <Text style={styles.legendText}>Income</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: "#fa5252" }]} />
                            <Text style={styles.legendText}>Expense</Text>
                        </View>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={barData}
                            barWidth={8}
                            spacing={20} // Default spacing, overridden by data
                            initialSpacing={10}
                            noOfSections={4}
                            barBorderRadius={2}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                            renderTooltip={(item: any) => {
                                return (
                                    <View style={{ marginBottom: 20, marginLeft: -6, backgroundColor: '#333', padding: 4, borderRadius: 4 }}>
                                        <Text style={{ color: '#fff', fontSize: 10 }}>₹{item.realValue?.toLocaleString() ?? item.value}</Text>
                                    </View>
                                );
                            }}
                            width={Math.max(340, dailyData.length * 30)} // Dynamic width: 30px per day
                        />
                    </ScrollView>
                </View>

                {/* Summary Rows - Clickable */}
                <View style={styles.summaryContainer}>
                    <SummaryRow label="Income" amount={income} color="#40c057" onPress={() => openDetail('Income')} />
                    <SummaryRow label="Expense" amount={expense} color="#fa5252" onPress={() => openDetail('Expense')} />
                    <SummaryRow label="Left for Saving" amount={savings} color="#333" />
                </View>

                {/* Insight Card */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>💡 Insight</Text>
                    <Text style={styles.insightText}>
                        {savings > 0
                            ? `You have saved ₹${savings.toLocaleString()} this month!`
                            : "Your expenses exceeded your income this month."}
                    </Text>
                </View>
            </ScrollView>

            {/* Detail Modal */}
            {isDetailModalVisible && (
                <View style={styles.detailModalOverlay}>
                    <View style={styles.detailModalContent}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailTitle}>{detailType} Details</Text>
                            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        {detailTransactions.length === 0 ? (
                            <Text style={styles.noDataText}>No transactions found.</Text>
                        ) : (
                            <FlatList
                                data={detailTransactions}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.transactionRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.txSource}>{item.source || "Unknown"}</Text>
                                            <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={[styles.txAmount, { color: detailType === 'Income' ? '#40c057' : '#fa5252' }]}>
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

const SummaryRow = ({ label, amount, color, onPress }: { label: string, amount: number, color: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.summaryRow} onPress={onPress} disabled={!onPress}>
        <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.summaryAmount}>₹{amount.toLocaleString()}</Text>
            {onPress && <Text style={styles.chevron}> ›</Text>}
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
    title: { fontSize: 18, fontWeight: "600", color: '#000' },
    editIcon: { fontSize: 20, padding: 5, color: '#333' },
    dateSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    dateText: { fontSize: 22, fontWeight: "bold", color: "#000" },
    legendContainer: { flexDirection: "row" },
    legendItem: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    legendText: { fontSize: 12, color: "#777" },
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
    navArrow: { fontSize: 22, marginHorizontal: 10, color: '#000' },
    summaryLabel: { fontSize: 16, fontWeight: "500", marginLeft: 10, color: "#333" },
    summaryAmount: { fontSize: 16, fontWeight: "bold", color: "#000" },
    chevron: { fontSize: 18, color: "#ccc" },
    insightCard: {
        marginHorizontal: 20,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    insightTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
    insightText: { fontSize: 14, color: "#777" },
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
        backgroundColor: '#fff',
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
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#f1f3f5',
        padding: 5,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#339af0',
        fontWeight: 'bold',
    },
    noDataText: {
        textAlign: 'center',
        color: '#999',
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
        color: '#333',
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
        color: '#888',
    },
    txAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyBudgetScreen;
