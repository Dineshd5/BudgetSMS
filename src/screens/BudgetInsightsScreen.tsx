import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "../context/TransactionContext";

const BudgetInsightsScreen = () => {
    const { transactions } = useTransactions();

    const expense = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const budget = 50000; // Static budget for now
    const unspent = budget - expense;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Budget Insights</Text>
                    <View style={styles.dateSelector}>
                        <Text style={styles.dateText}>📅 January 2025 ⌄</Text>
                    </View>
                </View>

                {/* Overview Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>💡 Overview</Text>
                    </View>
                    <Text style={styles.subText}>Monthly Overview</Text>

                    <View style={styles.highlightBox}>
                        <Text style={styles.calendarIcon}>📅</Text>
                        <View>
                            <Text style={styles.highlightAmount}>₹{unspent < 0 ? 0 : unspent.toLocaleString()}</Text>
                            <Text style={styles.highlightLabel}>Total Unspend left</Text>
                        </View>
                    </View>
                </View>

                {/* Expense Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>✉️ Expense Summary</Text>
                    </View>

                    <Text style={styles.expenseAmount}>₹{expense.toLocaleString()}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                        <Text style={{ color: "#40c057", fontWeight: "bold", marginRight: 5 }}>↗ +0%</Text>
                        <Text style={{ color: "#777" }}>vs last month</Text>
                    </View>

                    {/* Simple Bar Visualization */}
                    <View style={styles.barContainer}>
                        <View style={styles.barWrapper}>
                            <Text style={styles.barLabel}>Unspent</Text>
                            <View style={[styles.bar, { height: 40, backgroundColor: "#ccc" }]} />
                        </View>
                        <View style={styles.barWrapper}>
                            <Text style={styles.barLabel}>Expense</Text>
                            <View style={[styles.bar, { height: 80, backgroundColor: "#b2f2bb" }]} />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { alignItems: "center", marginBottom: 30 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#000" },
    dateSelector: { backgroundColor: "#fff", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
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
    cardHeader: { flexDirection: "row", marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
    subText: { fontSize: 14, color: "#777", marginBottom: 20 },

    highlightBox: {
        backgroundColor: "#f4fce3",
        borderRadius: 15,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    calendarIcon: { fontSize: 24, marginRight: 15 },
    highlightAmount: { fontSize: 20, fontWeight: "bold", color: "#2f9e44" },
    highlightLabel: { fontSize: 12, color: "#555" },

    expenseAmount: { fontSize: 32, fontWeight: "bold", color: "#000", marginBottom: 5 },

    barContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 20
    },
    barWrapper: { alignItems: 'center' },
    barLabel: { marginBottom: 5, color: '#777', fontSize: 12 },
    bar: { width: 60, borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
});

export default BudgetInsightsScreen;
