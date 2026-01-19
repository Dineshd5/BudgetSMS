import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../context/TransactionContext';

const LedgerScreen = () => {
    const { getPersonLedger, loading, updateContactName } = useTransactions();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingContact, setEditingContact] = useState<{ id: string; name: string } | null>(null);
    const [newName, setNewName] = useState("");

    // Fetch ledger data
    const ledgerData = useMemo(() => getPersonLedger(), [getPersonLedger]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <Text>Loading Ledger...</Text>
            </View>
        );
    }

    const handleEditPress = (item: { id: string; name: string }) => {
        setEditingContact(item);
        setNewName(item.name === item.id ? "" : item.name);
        setIsEditModalVisible(true);
    };

    const handleSaveName = async () => {
        if (editingContact && newName.trim()) {
            try {
                await updateContactName(editingContact.id, newName.trim());
                setIsEditModalVisible(false);
                setEditingContact(null);
            } catch (err) {
                console.error("Save failed in UI:", err);
            }
        }
    };

    const renderItem = ({ item }: { item: { id: string; name: string; totalReceived: number; totalSent: number; lastDate: string } }) => {
        const initials = (item.name || item.id).substring(0, 2).toUpperCase();

        return (
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Pressable
                            onPress={() => handleEditPress(item)}
                            style={({ pressed }) => [
                                styles.editButton,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                            hitSlop={15}
                        >
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.editIcon}>✏️</Text>
                        </Pressable>
                    </View>
                    {item.name !== item.id && <Text style={styles.subId}>{item.id}</Text>}
                    <Text style={styles.date}>Last: {new Date(item.lastDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountContainer}>
                    {item.totalReceived > 0 && (
                        <Text style={styles.income}>+₹{item.totalReceived.toLocaleString()}</Text>
                    )}
                    {item.totalSent > 0 && (
                        <Text style={styles.expense}>-₹{item.totalSent.toLocaleString()}</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Person Ledger</Text>
                <Text style={styles.subtitle}>Track payments by people</Text>
            </View>

            {ledgerData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No transaction history found.</Text>
                </View>
            ) : (
                <FlatList
                    data={ledgerData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Edit Name Custom Modal (Absolute View) */}
            {isEditModalVisible && (
                <View style={styles.customModalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Contact Name</Text>
                        <Text style={styles.modalSubtitle}>For: {editingContact?.id}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter Name (e.g., Milk Man)"
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginRight: 8,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    editIcon: {
        fontSize: 14,
        color: '#999',
        marginLeft: 4,
    },
    subId: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    date: {
        fontSize: 11,
        color: '#ccc',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    income: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 2,
    },
    expense: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#e53935',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    customModalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        elevation: 1000,
    },
    modalContent: { backgroundColor: '#fff', width: '85%', padding: 24, borderRadius: 16, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 16, color: '#333', backgroundColor: '#f9f9f9' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelBtn: { padding: 12, marginRight: 10 },
    cancelText: { color: '#666', fontWeight: 'bold' },
    saveBtn: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    saveText: { color: '#fff', fontWeight: 'bold' },
});

export default LedgerScreen;
