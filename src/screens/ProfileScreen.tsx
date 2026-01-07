import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../context/TransactionContext';

const ProfileScreen = () => {
    const { budget, updateBudget, clearTransactions, transactions } = useTransactions();

    const handleEditBudget = () => {
        Alert.prompt(
            "Update Budget",
            "Enter your new monthly budget:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: (val?: string) => {
                        const num = parseInt(val || '0', 10);
                        if (num > 0) {
                            updateBudget(num);
                        }
                    }
                }
            ],
            "plain-text",
            budget.toString()
        );
    };

    const handleResetData = () => {
        Alert.alert(
            "Reset All Data",
            "Are you sure you want to delete ALL transactions? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Everything",
                    style: "destructive",
                    onPress: async () => {
                        await clearTransactions();
                        Alert.alert("Success", "All data has been cleared.");
                    }
                }
            ]
        );
    };

    const handleExportData = async () => {
        try {
            // Generate CSV Header
            let csv = "Date,Amount,Type,Category,Merchant/Source,Reference\n";

            // Generate Rows
            transactions.forEach(t => {
                const date = new Date(t.date).toLocaleString().replace(/,/g, '');
                const cleanSource = (t.source || "").replace(/,/g, ' ');
                const cleanCategory = t.category.replace(/,/g, ' ');
                const ref = (t.id || "").replace(/,/g, ' '); // Using ID as ref fallback if needed

                csv += `${date},${t.amount},${t.type},${cleanCategory},${cleanSource},${ref}\n`;
            });

            // Share
            await Share.share({
                message: csv,
                title: "BudgetSMS_Export.csv",
            });
        } catch (error) {
            Alert.alert("Export Failed", "Could not export data.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header Profile */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <Text style={styles.name}>My Profile</Text>
                    <Text style={styles.subtitle}>BudgetSMS User</Text>
                </View>

                {/* Stats Card */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Monthly Budget</Text>
                    <Text style={styles.cardValue}>₹{budget.toLocaleString()}</Text>
                </View>

                {/* Settings List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.row} onPress={handleEditBudget}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>✏️</Text>
                            <Text style={styles.rowText}>Edit Monthly Budget</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={() => Alert.alert("About", "BudgetSMS v1.0.0")}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>ℹ️</Text>
                            <Text style={styles.rowText}>App Info</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={handleExportData}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>📤</Text>
                            <Text style={styles.rowText}>Export Data (CSV)</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <TouchableOpacity style={styles.dangerRow} onPress={handleResetData}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>🗑️</Text>
                            <Text style={styles.dangerText}>Reset All Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    content: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#e9ecef',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    avatarText: { fontSize: 40 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#777' },
    card: {
        backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 25,
        alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    cardLabel: { fontSize: 14, color: '#777', marginBottom: 5 },
    cardValue: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32' },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, marginLeft: 5 },
    row: {
        backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 15, fontSize: 18 },
    rowText: { fontSize: 16, color: '#333' },
    chevron: { fontSize: 20, color: '#ccc' },
    dangerRow: {
        backgroundColor: '#fff0f0', padding: 16, borderRadius: 12, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#ffc9c9'
    },
    dangerText: { fontSize: 16, color: '#e03131', fontWeight: '500' }
});

export default ProfileScreen;
