import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";

const MonthlyBudgetScreen = () => {
    const { transactions } = useTransactions();

    // Naive categorization based on merchant/mode for demo
    const categoryTotals: Record<string, number> = {};
    let totalExpense = 0;

    transactions.filter(t => t.type === 'debit').forEach(t => {
        const cat = t.mode; // Using Mode as category for now (UPI, CARD, etc)
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
        totalExpense += t.amount;
    });

    const pieData = Object.keys(categoryTotals).map((cat, index) => ({
        value: categoryTotals[cat],
        color: ['#fcc419', '#f03e3e', '#339af0', '#343a40', '#22b8cf'][index % 5],
        text: `${Math.round((categoryTotals[cat] / totalExpense) * 100)}%`
    }));

    // If no data, show placeholder
    if (pieData.length === 0) {
        pieData.push({ value: 100, color: '#e9ecef', text: '0%' });
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                    <Text style={styles.title}>Monthly Budget</Text>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </View>

                {/* Date Selector */}
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>January 2025 ⌄</Text>
                </View>

                {/* Donut Chart Section */}
                <View style={styles.chartSection}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Text style={{ fontSize: 20 }}>💡</Text>
                    </TouchableOpacity>

                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            innerRadius={60}
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ fontSize: 12, color: "#777" }}>Total Spent</Text>
                                        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>₹{totalExpense}</Text>
                                    </View>
                                );
                            }}
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton}>
                        <Text style={{ fontSize: 24, color: "#555" }}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Grid */}
                <View style={styles.gridContainer}>
                    {Object.keys(categoryTotals).map((cat, index) => {
                        const color = ['#fcc419', '#f03e3e', '#339af0', '#343a40', '#22b8cf'][index % 5];
                        const percent = Math.round((categoryTotals[cat] / totalExpense) * 100) + "%";

                        return (
                            <View key={index} style={styles.gridItem}>
                                <View style={styles.miniChart}>
                                    <View style={[styles.miniRing, { borderColor: color, borderTopColor: color }]} />
                                    <Text style={styles.miniPercentage}>{percent}</Text>
                                </View>
                                <Text style={styles.categoryLabel}>{cat}</Text>
                                <Text style={{ fontSize: 10, color: '#777' }}>₹{categoryTotals[cat]}</Text>
                            </View>
                        );
                    })}
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
    backIcon: { fontSize: 24, color: '#333' },
    title: { fontSize: 18, fontWeight: "600", color: '#000' },
    settingsIcon: { fontSize: 20 },
    dateContainer: { alignItems: "center", marginBottom: 30 },
    dateText: { fontSize: 16, fontWeight: "500", color: "#555" },
    chartSection: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    chartWrapper: { alignItems: "center", justifyContent: "center" },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    gridItem: {
        width: "30%",
        alignItems: "center",
        marginBottom: 25,
    },
    miniChart: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    miniRing: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 25,
        borderWidth: 4,
        opacity: 0.8,
    },
    miniPercentage: { fontSize: 12, fontWeight: "bold", color: "#000" },
    categoryLabel: { fontSize: 12, color: "#555" },
});

export default MonthlyBudgetScreen;
