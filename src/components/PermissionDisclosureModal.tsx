import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

interface PermissionDisclosureModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAccept: () => void;
}

const PermissionDisclosureModal = ({ visible, onDismiss, onAccept }: PermissionDisclosureModalProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🛡️</Text>
                    </View>

                    <Text style={styles.modalTitle}>SMS Permission Required</Text>

                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.modalText}>
                            To automatically track your expenses, BudgetSMS needs access to your SMS messages.
                        </Text>

                        <Text style={styles.subTitle}>Why we need this:</Text>
                        <Text style={styles.bulletPoint}>• To find transaction alerts from banks.</Text>
                        <Text style={styles.bulletPoint}>• To categorize your spending automatically.</Text>
                        <Text style={styles.bulletPoint}>• To build your monthly budget reports.</Text>

                        <View style={styles.privacyBox}>
                            <Text style={styles.privacyTitle}>🔒 Data Privacy Assurance</Text>
                            <Text style={styles.privacyText}>
                                • We ONLY process transaction messages locally on your device.
                            </Text>
                            <Text style={styles.privacyText}>
                                • Your personal SMS (OTPs, private chats) are IGNORED.
                            </Text>
                            <Text style={styles.privacyText}>
                                • Your data is stored locally and is NOT shared with anyone.
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
                            <Text style={styles.cancelButtonText}>No Thanks</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                            <Text style={styles.acceptButtonText}>Allow Access</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#e8f5e9',
        borderRadius: 50,
    },
    icon: {
        fontSize: 32,
    },
    modalTitle: {
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    scrollView: {
        width: '100%',
        marginBottom: 20,
    },
    modalText: {
        marginBottom: 16,
        textAlign: 'left',
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        marginLeft: 8,
    },
    privacyBox: {
        marginTop: 16,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2e7d32',
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 6,
    },
    privacyText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        marginLeft: 0,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#777',
        fontWeight: 'bold',
        fontSize: 15,
    },
    acceptButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        marginLeft: 10,
        backgroundColor: '#2e7d32',
        alignItems: 'center',
        elevation: 2,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default PermissionDisclosureModal;
