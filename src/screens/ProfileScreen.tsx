import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, UserIcon, InfoIcon, MoonIcon, SunIcon, LockIcon, ExportIcon, TrashIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { budget, updateBudget, clearTransactions, transactions } = useTransactions();
    const { user, signOut } = useAuth();
    const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);

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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header Profile */}
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: isDark ? '#3a3a3a' : '#dfe6e9' }]}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                        ) : (
                            <UserIcon color={theme.colors.text} width={40} height={40} />
                        )}
                    </View>
                    <Text style={[styles.name, { color: theme.colors.text }]}>{user?.displayName || "User"}</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{user?.email || "BudgetSMS User"}</Text>
                </View>

                {/* Stats Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Monthly Budget</Text>
                    <Text style={[styles.cardValue, { color: theme.colors.success }]}>₹{budget.toLocaleString()}</Text>
                </View>

                {/* Settings List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>

                    {/* <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.card }]} onPress={handleEditBudget}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.icon}>✏️</Text>
                            <Text style={[styles.rowText, { color: theme.colors.text }]}>Edit Monthly Budget</Text>
                        </View>
                        <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>›</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.card }]} onPress={() => Alert.alert("About", "BudgetSMS v1.0.0")}>
                        <View style={styles.rowLeft}>
                            <InfoIcon color={theme.colors.text} width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={[styles.rowText, { color: theme.colors.text }]}>App Info</Text>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} width={24} height={24} />
                    </TouchableOpacity>

                    <View style={[styles.row, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.rowLeft}>
                            {isDark ? <MoonIcon color={theme.colors.text} width={24} height={24} style={{ marginRight: 12 }} /> : <SunIcon color={theme.colors.text} width={24} height={24} style={{ marginRight: 12 }} />}
                            <Text style={[styles.rowText, { color: theme.colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#ddd', true: theme.colors.primary }}
                            thumbColor={isDark ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.card }]} onPress={() => {
                        // In a real app, use Linking.openURL with your hosted policy
                        Alert.alert("Privacy Policy", "This app processes all SMS data locally. No data is uploaded to any server. \n\nFull policy: https://pages.github.io/budget-sms/privacy");
                    }}>
                        <View style={styles.rowLeft}>
                            <LockIcon color={theme.colors.text} width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={[styles.rowText, { color: theme.colors.text }]}>Privacy Policy</Text>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} width={24} height={24} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.card }]} onPress={handleExportData}>
                        <View style={styles.rowLeft}>
                            <ExportIcon color={theme.colors.text} width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={[styles.rowText, { color: theme.colors.text }]}>Export Data (CSV)</Text>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} width={24} height={24} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, { backgroundColor: theme.colors.card, marginTop: 20 }]} onPress={signOut}>
                        <View style={styles.rowLeft}>
                            <Text style={[styles.rowText, { color: theme.colors.error }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Danger Zone</Text>
                    <TouchableOpacity style={[styles.dangerRow, { backgroundColor: isDark ? '#3d1a1a' : '#fff5f5', borderColor: isDark ? '#5a2121' : '#ffc9c9' }]} onPress={handleResetData}>
                        <View style={styles.rowLeft}>
                            <TrashIcon color={theme.colors.error} width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={[styles.dangerText, { color: theme.colors.error }]}>Reset All Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    avatar: {
        width: 70, height: 70, borderRadius: 35,
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
    },
    avatarText: { fontSize: 30 },
    name: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 13, marginTop: 2 },

    card: {
        padding: 16, borderRadius: 16, marginBottom: 20,
        alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8
    },
    cardLabel: { fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    cardValue: { fontSize: 24, fontWeight: 'bold' },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },

    row: {
        padding: 14, borderRadius: 12, marginBottom: 8,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 12, fontSize: 18 },
    rowText: { fontSize: 15, fontWeight: '500' },
    chevron: { fontSize: 18 },

    dangerRow: {
        padding: 14, borderRadius: 12, marginBottom: 8,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1
    },
    dangerText: { fontSize: 15, fontWeight: '600' }
});


