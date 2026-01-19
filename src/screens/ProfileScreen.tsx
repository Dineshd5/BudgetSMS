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

                    <TouchableOpacity style={styles.row} onPress={() => {
                        // In a real app, use Linking.openURL with your hosted policy
                        Alert.alert("Privacy Policy", "This app processes all SMS data locally. No data is uploaded to any server. \n\nFull policy: https://pages.github.io/budget-sms/privacy");
                    }}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>🔒</Text>
                            <Text style={styles.rowText}>Privacy Policy</Text>
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
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    content: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    avatar: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#dfe6e9',
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
    },
    avatarText: { fontSize: 50 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#2d3436' },
    subtitle: { fontSize: 15, color: '#636e72', marginTop: 4 },

    card: {
        backgroundColor: '#fff', padding: 24, borderRadius: 20, marginBottom: 25,
        alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8
    },
    cardLabel: { fontSize: 14, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    cardValue: { fontSize: 36, fontWeight: 'bold', color: '#2e7d32' },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436', marginBottom: 15, marginLeft: 5 },

    row: {
        backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 16, fontSize: 20 },
    rowText: { fontSize: 16, fontWeight: '500', color: '#2d3436' },
    chevron: { fontSize: 20, color: '#b2bec3' },

    dangerRow: {
        backgroundColor: '#fff5f5', padding: 18, borderRadius: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#ffc9c9'
    },
    dangerText: { fontSize: 16, color: '#e03131', fontWeight: '600' }
});

export default ProfileScreen;
