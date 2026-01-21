import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MyBudgetScreen from "../screens/MyBudgetScreen";
import MonthlyBudgetScreen from "../screens/MonthlyBudgetScreen";
import BudgetInsightsScreen from "../screens/BudgetInsightsScreen";
import LedgerScreen from "../screens/LedgerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MoreScreen from "../screens/MoreScreen";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { HomeIcon, BarChartIcon, LedgerIcon, TrendingUpIcon, MoreHorizontalIcon } from "../components/Icons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    ...styles.tabBar,
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => <HomeIcon color={color} width={24} height={24} />
                }}
            />
            <Tab.Screen
                name="Budget"
                component={MyBudgetScreen}
                options={{
                    tabBarIcon: ({ color }) => <BarChartIcon color={color} width={24} height={24} />
                }}
            />
            <Tab.Screen
                name="Ledger"
                component={LedgerScreen}
                options={{
                    tabBarIcon: ({ color }) => <LedgerIcon color={color} width={24} height={24} />,
                    tabBarLabel: "Ledger",
                }}
            />
            <Tab.Screen
                name="Spending"
                component={BudgetInsightsScreen}
                options={{
                    tabBarIcon: ({ color }) => <TrendingUpIcon color={color} width={24} height={24} />
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreScreen}
                options={{
                    tabBarIcon: ({ color }) => <MoreHorizontalIcon color={color} width={24} height={24} />
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { theme } = useTheme();
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen
                            name="Goals"
                            component={MonthlyBudgetScreen}
                            options={{
                                headerShown: true,
                                title: "Goals & Monthly Budget",
                                headerStyle: { backgroundColor: theme.colors.card },
                                headerTintColor: theme.colors.text,
                                headerTitleStyle: { fontWeight: 'bold' }
                            }}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{
                                headerShown: true,
                                title: "Profile & Settings",
                                headerStyle: { backgroundColor: theme.colors.card },
                                headerTintColor: theme.colors.text,
                                headerTitleStyle: { fontWeight: 'bold' }
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabBar: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    tabLabel: {
        fontSize: 12,
    },
});

export default AppNavigator;
