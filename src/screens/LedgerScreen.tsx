import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, EditIcon, LedgerIcon, EmptyBoxIcon, CloseIcon } from '../components/Icons';

const LedgerScreen = () => {
    const { getPersonLedger, loading, updateContactName, transactions } = useTransactions();
    const { theme, isDark } = useTheme();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingContact, setEditingContact] = useState<{ id: string; name: string } | null>(null);
    const [newName, setNewName] = useState("");

    // Detail Modal State
    const [selectedPerson, setSelectedPerson] = useState<{ id: string; name: string } | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

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
            <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.textSecondary }}>Loading Ledger...</Text>
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
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    setSelectedPerson(item);
                    setIsDetailModalVisible(true);
                }}
            >
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <LinearGradient colors={gradientColors} style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </LinearGradient>

                    <View style={styles.infoContainer}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
                        </View>

                        {item.name !== item.id && <Text style={[styles.subId, { color: theme.colors.textSecondary }]}>{item.id}</Text>}
                        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>Last: {new Date(item.lastDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>

                    <View style={styles.amountContainer}>
                        {item.totalReceived > 0 && (
                            <View style={styles.amountBadge}>
                                <Text style={[styles.amountLabel, { color: theme.colors.income }]}>IN</Text>
                                <Text style={[styles.amountValue, { color: theme.colors.income }]}>+₹{item.totalReceived.toLocaleString()}</Text>
                            </View>
                        )}
                        {item.totalSent > 0 && (
                            <View style={styles.amountBadge}>
                                <Text style={[styles.amountLabel, { color: theme.colors.expense }]}>OUT</Text>
                                <Text style={[styles.amountValue, { color: theme.colors.expense }]}>-₹{item.totalSent.toLocaleString()}</Text>
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
                        <EditIcon color={theme.colors.text} width={20} height={20} />
                    </Pressable>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Person Ledger</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track your transactions by contact</Text>
                </View>
            </View>

            {ledgerData.length === 0 ? (
                <View style={styles.emptyState}>
                    <EmptyBoxIcon color={theme.colors.textSecondary} width={64} height={64} />
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>No transaction history found.</Text>
                    <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>Transactions tagged with people will appear here.</Text>
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
                <View style={[styles.customModalOverlay, { backgroundColor: theme.colors.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit Alias</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <CloseIcon color={theme.colors.textSecondary} width={24} height={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Set a friendly name for <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{editingContact?.id}</Text></Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="e.g., John Doe"
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <TouchableOpacity onPress={handleSaveName} style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.saveText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Person Detail Modal */}
            <PersonDetailModal
                isVisible={isDetailModalVisible}
                person={selectedPerson}
                onClose={() => setIsDetailModalVisible(false)}
                transactions={transactions}
                theme={theme}
                isDark={isDark}
            />
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
        paddingBottom: 10,
        backgroundColor: '#f5f7fa', // Blend with background
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
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
        paddingTop: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
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
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
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
        top: -6,
        right: -6,
        padding: 5,
        zIndex: 10,
    },
    editIcon: {
        fontSize: 20,
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
    modalTitle: { fontSize: 22, fontWeight: '800' },
    closeModalText: { fontSize: 20, color: '#aaa', padding: 5 },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
    input: {
        borderWidth: 1.5,
        borderColor: '#f0f0f0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        fontSize: 17,
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

const PersonDetailModal = ({ isVisible, person, onClose, transactions, theme, isDark }: any) => {
    if (!person) return null;

    // Filter and sort transactions for this person (normalized by source)
    const history = transactions
        .filter((t: any) => (t.source === person.id) && t.status === 'approved')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <React.Fragment>
            {isVisible && (
                <View style={[styles.customModalOverlay, { backgroundColor: theme.colors.overlay, zIndex: 3000 }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, height: '80%', padding: 0 }]}>
                        {/* Header */}
                        <View style={[styles.modalHeader, { padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.colors.text, fontSize: 20 }]}>{person.name}</Text>
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{person.id}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                                <CloseIcon color={theme.colors.textSecondary} width={24} height={24} />
                            </TouchableOpacity>
                        </View>

                        {/* Summary Stats */}
                        <View style={{ flexDirection: 'row', padding: 15, justifyContent: 'space-around', backgroundColor: isDark ? theme.colors.surface : '#f8f9fa' }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' }}>TOTAL RECEIVED</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.income }}>+₹{person.totalReceived?.toLocaleString()}</Text>
                            </View>
                            <View style={{ height: '100%', width: 1, backgroundColor: theme.colors.border }} />
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' }}>TOTAL SENT</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.expense }}>-₹{person.totalSent?.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* List */}
                        <FlatList
                            data={history}
                            keyExtractor={(item) => item.id} // Ensure transaction ID is unique
                            contentContainerStyle={{ padding: 20 }}
                            renderItem={({ item }) => (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                                    <View>
                                        <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '500', marginBottom: 2 }}>
                                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{item.category || "General"}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: item.type === 'credit' ? theme.colors.income : theme.colors.expense }}>
                                            {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString()}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 }}>No records found</Text>
                            }
                        />
                    </View>
                </View>
            )}
        </React.Fragment>
    );
};

const isDark = false; // Just to satisfy linter if needed locally, but passed via props

export default LedgerScreen;
