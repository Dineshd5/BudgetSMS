import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, TargetIcon, UserIcon } from '../components/Icons';

const MoreScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    const menuItems = [
        {
            id: 'goals',
            title: 'Goals & Monthly Budget',
            subtitle: 'Set and track your spending limits',
            icon: TargetIcon,
            color: '#FF6B6B',
            screen: 'Goals'
        },
        {
            id: 'profile',
            title: 'Profile & Settings',
            subtitle: 'App preferences, theme, and data',
            icon: UserIcon,
            color: '#4ECDC4',
            screen: 'Profile'
        }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Menu</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                <item.icon color={item.color} width={24} height={24} />
                            </View>
                            <View>
                                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{item.title}</Text>
                                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                            </View>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} width={20} height={20} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 12,
    },
});

export default MoreScreen;
