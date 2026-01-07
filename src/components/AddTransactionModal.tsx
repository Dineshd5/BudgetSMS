import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useTransactions, Transaction } from '../context/TransactionContext';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    initialTransaction?: Transaction | null;
}

const CATEGORIES = [
    "Food", "Travel", "Shopping", "Utilities", "Health", "Entertainment", "Education", "Salary", "Business", "Other"
];

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, initialTransaction }) => {
    const { addTransaction, editTransaction } = useTransactions();
    const [loading, setLoading] = useState(false);

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'credit' | 'debit'>('debit');
    const [category, setCategory] = useState('Food');
    const [note, setNote] = useState('');

    React.useEffect(() => {
        if (visible) {
            if (initialTransaction) {
                setAmount(initialTransaction.amount.toString());
                setType(initialTransaction.type);
                setCategory(initialTransaction.category);
                setNote(initialTransaction.source || '');
            } else {
                resetForm();
            }
        }
    }, [visible, initialTransaction]);

    const handleSave = async () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid positive number.");
            return;
        }

        if (!category) {
            Alert.alert("Missing Category", "Please select a category.");
            return;
        }

        setLoading(true);
        try {
            const txData = {
                amount: value,
                type: type, // 'credit' or 'debit'
                category: category,
                source: note.trim() || "Manual Entry",
                date: initialTransaction ? initialTransaction.date : new Date().toISOString()
            };

            if (initialTransaction) {
                await editTransaction(initialTransaction.id, txData);
            } else {
                await addTransaction(txData);
            }

            resetForm();
            onClose();
        } catch (error) {
            console.error("Failed to add transaction:", error);
            Alert.alert("Error", "Could not save transaction.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAmount('');
        setType('debit');
        setCategory('Food');
        setNote('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{initialTransaction ? "Edit Transaction" : "Add Transaction"}</Text>

                    {/* Type Selector */}
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'debit' && styles.typeBtnActive, { borderColor: '#fa5252' }]}
                            onPress={() => setType('debit')}
                        >
                            <Text style={[styles.typeText, type === 'debit' && styles.typeTextActive, { color: type === 'debit' ? '#fff' : '#fa5252' }]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'credit' && styles.typeBtnActive, { borderColor: '#40c057' }]}
                            onPress={() => setType('credit')}
                        >
                            <Text style={[styles.typeText, type === 'credit' && styles.typeTextActive, { color: type === 'credit' ? '#fff' : '#40c057' }]}>Income</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    {/* Category Selector */}
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.catChip, category === cat && styles.catChipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Note Input */}
                    <Text style={styles.label}>Note (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Lunch at Cafe"
                        value={note}
                        onChangeText={setNote}
                    />

                    {/* Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
    },
    typeBtnActive: {
        backgroundColor: '#333', // Will be overridden by inline styles
        borderWidth: 0,
    },
    typeText: {
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#fff',
    },
    label: {
        fontSize: 14,
        color: '#777',
        marginBottom: 8,
        fontWeight: '500'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        color: '#000'
    },
    categoryContainer: {
        marginBottom: 20,
        height: 50,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f3f5',
        marginRight: 10,
        height: 40,
        justifyContent: 'center'
    },
    catChipActive: {
        backgroundColor: '#2e7d32',
    },
    catText: {
        color: '#333',
    },
    catTextActive: {
        color: '#fff',
        fontWeight: 'bold'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelText: {
        color: '#777',
        fontWeight: 'bold'
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#2e7d32',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 10,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default AddTransactionModal;
