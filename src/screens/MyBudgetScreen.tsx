import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";

const MyBudgetScreen = () => {
    const { transactions } = useTransactions();

    const income = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expense;

    // Dummy data for chart for now, real data aggregation requires date logic
    const barData = [
        { value: 650, label: "Mon", frontColor: "#b2f2bb" },
        { value: 500, label: "Tue", frontColor: "#40c057" },
        { value: 750, label: "Wed", frontColor: "#2f9e44" },
        { value: 920, label: "Thu", frontColor: "#b2f2bb" },
        { value: 700, label: "Fri", frontColor: "#b2f2bb" },
        { value: 600, label: "Sat", frontColor: "#b2f2bb" },
        { value: 850, label: "Sun", frontColor: "#40c057" },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                    <Text style={styles.title}>My Budget</Text>
                    <Text style={styles.editIcon}>✎</Text>
                </View>

                {/* Date Selector */}
                <View style={styles.dateSelector}>
                    <Text style={styles.dateText}>Jan 2025 ⌄</Text>
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
                    <BarChart
                        data={barData}
                        barWidth={22}
                        noOfSections={3}
                        barBorderRadius={4}
                        frontColor="#b2f2bb"
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules
                        height={200}
                        width={300}
                        isAnimated
                    />
                </View>

                {/* Summary Rows */}
                <View style={styles.summaryContainer}>
                    <TouchableOpacity style={styles.summaryRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={[styles.dot, { backgroundColor: "#40c057" }]} />
                            <Text style={styles.summaryLabel}>Income</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.summaryAmount}>₹{income.toLocaleString()}</Text>
                            <Text style={styles.chevron}> ›</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.summaryRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={[styles.dot, { backgroundColor: "#fa5252" }]} />
                            <Text style={styles.summaryLabel}>Expense</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.summaryAmount}>₹{expense.toLocaleString()}</Text>
                            <Text style={styles.chevron}> ›</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.summaryRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={[styles.dot, { backgroundColor: "#333" }]} />
                            <Text style={styles.summaryLabel}>Left for Saving</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.summaryAmount}>₹{savings.toLocaleString()}</Text>
                            <Text style={styles.chevron}> ›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Insight Card */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>💡 Insight</Text>
                    <Text style={styles.insightText}>You have saved ₹{savings.toLocaleString()} so far.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
});

export default MyBudgetScreen;
