import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// --- Google Sign-In Config ---
GoogleSignin.configure({
    webClientId: '155902765-e1ef8mr2dj9slgffhuhfhgd7086pi0qp.apps.googleusercontent.com', // Updated to match client_type: 3 in google-services.json
});

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authInstance = getAuth();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState(true);

    // Handle user state changes
    function onAuthStateSubscriber(user: FirebaseAuthTypes.User | null) {
        setUser(user);
        if (loading) setLoading(false);
    }

    useEffect(() => {
        const subscriber = onAuthStateChanged(authInstance, onAuthStateSubscriber);
        return subscriber; // unsubscribe on unmount
    }, []);

    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken;
            if (!idToken) throw new Error('No ID token found');

            const googleCredential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(authInstance, googleCredential);
        } catch (error) {
            console.error("Google Sign-In Error", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await GoogleSignin.signOut();
            await firebaseSignOut(authInstance);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
