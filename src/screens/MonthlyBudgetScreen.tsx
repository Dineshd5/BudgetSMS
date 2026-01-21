import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { ChevronLeft, ChevronRight, SettingsIcon, BulbIcon } from "../components/Icons";
import { useTransactions } from "../context/TransactionContext";
import { useTheme } from "../context/ThemeContext";

const MonthlyBudgetScreen = () => {
    const { getCategoryTotals, getMonthlyTotals, loading } = useTransactions();
    const { theme, isDark } = useTheme();

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
        return <View style={[styles.loader, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.text }}>Loading...</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Monthly Budget</Text>
                </View>

                {/* Date Selector */}
                <View style={styles.dateContainer}>
                    <View style={[styles.dateNavContainer, { backgroundColor: theme.colors.card }]}>
                        <TouchableOpacity onPress={() => changeMonth('prev')} style={{ paddingHorizontal: 10 }}>
                            <ChevronLeft color={theme.colors.primary} width={22} height={22} />
                        </TouchableOpacity>
                        <Text style={[styles.dateText, { color: theme.colors.text }]}>
                            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth('next')} style={{ paddingHorizontal: 10 }}>
                            <ChevronRight color={theme.colors.primary} width={22} height={22} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Donut Chart Section */}
                <View style={styles.chartSection}>
                    <TouchableOpacity style={styles.iconButton}>
                        <BulbIcon color={theme.colors.warning} width={28} height={28} />
                    </TouchableOpacity>

                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            innerRadius={60}
                            innerCircleColor={theme.colors.background}
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Total Spent</Text>
                                        <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.colors.text }}>₹{totalExpense.toLocaleString()}</Text>
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
                    {categoryData.length === 0 && <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>No expenses this month</Text>}

                    {categoryData.map((cat, index) => (
                        <View key={index} style={[styles.gridItem, { backgroundColor: theme.colors.card }]}>
                            <View style={styles.miniChart}>
                                <View style={[styles.miniRing, { borderColor: cat.color, borderTopColor: cat.color }]} />
                                <Text style={[styles.miniPercentage, { color: theme.colors.text }]}>{cat.percentage}</Text>
                            </View>
                            <Text style={[styles.categoryLabel, { color: theme.colors.textSecondary }]}>{cat.category}</Text>
                            <Text style={[styles.amountText, { color: theme.colors.text }]}>₹{cat.amount.toLocaleString()}</Text>
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
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 20,
    },
    // backIcon: { fontSize: 24, color: '#333' }, // Removed as replaced by SVG
    title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
    settingsIcon: { fontSize: 20, opacity: 0 }, // Hidden but keeps spacing
    dateContainer: { alignItems: "center", marginBottom: 30 },
    dateText: { fontSize: 18, fontWeight: "600", marginHorizontal: 15 },
    dateNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        width: "48%",
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
    miniPercentage: { fontSize: 12, fontWeight: "bold" },
    categoryLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    amountText: { fontSize: 16, fontWeight: 'bold' },

    noDataText: { width: '100%', textAlign: 'center', marginTop: 20 },
});

export default MonthlyBudgetScreen;
