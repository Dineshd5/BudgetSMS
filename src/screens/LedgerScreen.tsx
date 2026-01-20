import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTransactions } from '../context/TransactionContext';
import { ChevronRight } from '../components/Icons';

const LedgerScreen = () => {
    const { getPersonLedger, loading, updateContactName } = useTransactions();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingContact, setEditingContact] = useState<{ id: string; name: string } | null>(null);
    const [newName, setNewName] = useState("");

    // Fetch ledger data
    const ledgerData = useMemo(() => getPersonLedger(), [getPersonLedger]);

    const getAvatarGradient = (name: string) => {
        const charCode = name.charCodeAt(0) || 0;
        const gradients = [
            ['#4facfe', '#00f2fe'], // Blue
            ['#43e97b', '#38f9d7'], // Green
            ['#fa709a', '#fee140'], // Pink/Yellow
            ['#667eea', '#764ba2'], // Purple
            ['#ff9a9e', '#fecfef'], // Light Pink
            ['#f093fb', '#f5576c'], // Pink/Red
        ];
        return gradients[charCode % gradients.length];
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <Text style={{ color: '#888' }}>Loading Ledger...</Text>
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
        const gradientColors = getAvatarGradient(item.name || item.id);

        return (
            <View style={styles.card}>
                <LinearGradient colors={gradientColors} style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>

                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    </View>

                    {item.name !== item.id && <Text style={styles.subId}>{item.id}</Text>}
                    <Text style={styles.date}>Last: {new Date(item.lastDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>

                <View style={styles.amountContainer}>
                    {item.totalReceived > 0 && (
                        <View style={styles.amountBadge}>
                            <Text style={[styles.amountLabel, { color: '#2e7d32' }]}>IN</Text>
                            <Text style={[styles.amountValue, { color: '#2e7d32' }]}>+₹{item.totalReceived.toLocaleString()}</Text>
                        </View>
                    )}
                    {item.totalSent > 0 && (
                        <View style={styles.amountBadge}>
                            <Text style={[styles.amountLabel, { color: '#c62828' }]}>OUT</Text>
                            <Text style={[styles.amountValue, { color: '#c62828' }]}>-₹{item.totalSent.toLocaleString()}</Text>
                        </View>
                    )}
                </View>

                <Pressable
                    onPress={() => handleEditPress(item)}
                    style={({ pressed }) => [
                        styles.editButtonAbsolute,
                        { opacity: pressed ? 0.6 : 1 }
                    ]}
                    hitSlop={15}
                >
                    <Text style={styles.editIcon}>✎</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Person Ledger</Text>
                    <Text style={styles.subtitle}>Track your transactions by contact</Text>
                </View>
                <View style={styles.headerIconContainer}>
                    <Text style={{ fontSize: 24 }}>📒</Text>
                </View>
            </View>

            {ledgerData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📭</Text>
                    <Text style={styles.emptyText}>No transaction history found.</Text>
                    <Text style={styles.emptySubText}>Transactions tagged with people will appear here.</Text>
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

            {/* Edit Name Custom Modal */}
            {isEditModalVisible && (
                <View style={styles.customModalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Alias</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Text style={styles.closeModalText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Set a friendly name for <Text style={{ fontWeight: 'bold' }}>{editingContact?.id}</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholder="e.g., John Doe"
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                            placeholderTextColor="#aaa"
                        />

                        <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                            <Text style={styles.saveText}>Save Changes</Text>
                        </TouchableOpacity>
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
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#f5f7fa', // Blend with background
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800', // Extra bold
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    headerIconContainer: {
        width: 45, height: 45,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#6c757d',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    infoContainer: {
        flex: 1,
        marginRight: 4,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2d3436',
    },
    editButtonAbsolute: {
        position: 'absolute',
        top: -10,
        right: 10,
        padding: 5,
        zIndex: 10,
    },
    editIcon: {
        fontSize: 16,
        color: '#000000ff',
    },
    subId: {
        fontSize: 12,
        color: '#636e72',
        marginBottom: 4,
    },
    date: {
        fontSize: 11,
        color: '#b2bec3',
        fontWeight: '500',
    },
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    amountBadge: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: 2
    },
    amountLabel: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
        opacity: 0.7
    },
    amountValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 20,
        opacity: 0.8
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    customModalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '85%',
        padding: 24,
        borderRadius: 24,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#333' },
    closeModalText: { fontSize: 20, color: '#aaa', padding: 5 },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
    input: {
        borderWidth: 1.5,
        borderColor: '#f0f0f0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        fontSize: 17,
        color: '#333',
        backgroundColor: '#fcfcfc',
        fontWeight: '500'
    },
    saveBtn: {
        backgroundColor: '#1a1a1a', // Black for premium feel
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default LedgerScreen;
