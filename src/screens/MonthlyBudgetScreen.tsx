import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { useTransactions } from "../context/TransactionContext";

const MonthlyBudgetScreen = () => {
    const { getCategoryTotals, getMonthlyTotals, loading } = useTransactions();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const categoryData = getCategoryTotals(month, year);
    const { expense: totalExpense } = getMonthlyTotals(month, year);

    // Map context data to PieChart format
    const pieData = categoryData.map(c => ({
        value: c.amount,
        color: c.color,
        text: c.percentage,
    }));

    const changeMonth = (direction: 'next' | 'prev') => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    // If no data, show placeholder
    if (pieData.length === 0) {
        pieData.push({ value: 100, color: '#e9ecef', text: '0%' });
    }

    if (loading) {
        return <View style={styles.loader}><Text>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                    <Text style={styles.title}>Monthly Budget</Text>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </View>

                {/* Date Selector */}
                <View style={styles.dateContainer}>
                    <View style={styles.dateNavContainer}>
                        <TouchableOpacity onPress={() => changeMonth('prev')}>
                            <Text style={styles.navArrow}>{"<"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth('next')}>
                            <Text style={styles.navArrow}>{">"}</Text>
                        </TouchableOpacity>
                    </View>
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
                                        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>₹{totalExpense.toLocaleString()}</Text>
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
                    {categoryData.length === 0 && <Text style={styles.noDataText}>No expenses this month</Text>}

                    {categoryData.map((cat, index) => (
                        <View key={index} style={styles.gridItem}>
                            <View style={styles.miniChart}>
                                <View style={[styles.miniRing, { borderColor: cat.color, borderTopColor: cat.color }]} />
                                <Text style={styles.miniPercentage}>{cat.percentage}</Text>
                            </View>
                            <Text style={styles.categoryLabel}>{cat.category}</Text>
                            <Text style={styles.amountText}>₹{cat.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 20,
    },
    backIcon: { fontSize: 24, color: '#333' },
    title: { fontSize: 20, fontWeight: "700", color: '#1a1a1a' },
    settingsIcon: { fontSize: 20, opacity: 0 }, // Hidden but keeps spacing
    dateContainer: { alignItems: "center", marginBottom: 30 },
    dateText: { fontSize: 18, fontWeight: "600", color: "#333", marginHorizontal: 15 },
    dateNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    navArrow: { fontSize: 22, color: '#2e7d32', paddingHorizontal: 10 },

    chartSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    chartWrapper: { alignItems: "center", justifyContent: "center" },
    iconButton: { display: 'none' }, // Hiding extra buttons for cleaner look
    addButton: { display: 'none' },

    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    gridItem: {
        width: "48%", // 2 columns
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    miniChart: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    miniRing: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 25,
        borderWidth: 4,
        opacity: 0.8,
    },
    miniPercentage: { fontSize: 12, fontWeight: "bold", color: "#333" },
    categoryLabel: { fontSize: 14, fontWeight: '600', color: "#555", marginBottom: 4 },
    amountText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

    noDataText: { width: '100%', textAlign: 'center', color: '#999', marginTop: 20 },
});

export default MonthlyBudgetScreen;
