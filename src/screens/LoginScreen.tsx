import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/Icons';

const LoginScreen = () => {
    const { theme } = useTheme();
    const { signInWithGoogle, loading } = useAuth();
    const [isSigningIn, setIsSigningIn] = React.useState(false);

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.title, { color: theme.colors.text }]}>BudgetSMS</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Track your expenses automatically from SMS
                </Text>

                <View style={styles.spacer} />

                <TouchableOpacity
                    style={[styles.googleButton, { backgroundColor: theme.colors.card }]}
                    onPress={handleGoogleLogin}
                    disabled={isSigningIn}
                >
                    {isSigningIn ? (
                        <ActivityIndicator color={theme.colors.text} />
                    ) : (
                        <>
                            <GoogleIcon width={24} height={24} />
                            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                                Sign in with Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 48,
    },
    spacer: {
        height: 48,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        maxWidth: 300,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
});

export default LoginScreen;
