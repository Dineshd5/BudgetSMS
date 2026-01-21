import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
    mode: ThemeMode;
    colors: {
        background: string;
        surface: string;
        card: string;
        text: string;
        textSecondary: string;
        border: string;
        primary: string;
        success: string;
        error: string;
        warning: string;
        income: string;
        expense: string;
        shadow: string;
        overlay: string;
    };
}

const lightTheme: Theme = {
    mode: 'light',
    colors: {
        background: '#f5f7fa',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#2d3436',
        textSecondary: '#636e72',
        border: '#e0e0e0',
        primary: '#2e7d32',
        success: '#4caf50',
        error: '#e53935',
        warning: '#ffc107',
        income: '#2e7d32',
        expense: '#e53935',
        shadow: '#000000',
        overlay: 'rgba(0,0,0,0.5)',
    },
};

const darkTheme: Theme = {
    mode: 'dark',
    colors: {
        background: '#121212',
        surface: '#1e1e1e',
        card: '#2a2a2a',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#3a3a3a',
        primary: '#66bb6a',
        success: '#81c784',
        error: '#ef5350',
        warning: '#ffb74d',
        income: '#66bb6a',
        expense: '#ef5350',
        shadow: '#000000',
        overlay: 'rgba(0,0,0,0.7)',
    },
};

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@budgetsms_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setThemeModeState(savedTheme);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const saveTheme = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        saveTheme(mode);
    };

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    const theme = themeMode === 'light' ? lightTheme : darkTheme;
    const isDark = themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
