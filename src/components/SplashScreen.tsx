import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            })
        ]).start();

        const timer = setTimeout(() => {
            onFinish();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Text style={styles.logo}>💰</Text>
                <Text style={styles.title}>BudgetSMS</Text>
                <Text style={styles.subtitle}>Smart Automatic Expense Tracking</Text>
            </Animated.View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Secure & Local</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 80,
        textAlign: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2e7d32',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        marginTop: 10,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    footerText: {
        color: '#ccc',
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
