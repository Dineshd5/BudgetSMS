import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MyBudgetScreen from "../screens/MyBudgetScreen";
import MonthlyBudgetScreen from "../screens/MonthlyBudgetScreen";
import BudgetInsightsScreen from "../screens/BudgetInsightsScreen";

const Tab = createBottomTabNavigator();

// Placeholder for other screens if needed
const PlaceholderScreen = ({ title }: { title: string }) => (
    <View style={styles.container}>
        <Text>{title}</Text>
    </View>
);

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: "#2e7d32",
                    tabBarInactiveTintColor: "#999",
                    tabBarLabelStyle: styles.tabLabel,
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🏠</Text>
                    }}
                />
                <Tab.Screen
                    name="Budget"
                    component={MyBudgetScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>📊</Text>
                    }}
                />
                <Tab.Screen
                    name="Goals"
                    component={MonthlyBudgetScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🎯</Text>
                    }}
                />
                <Tab.Screen
                    name="Spending"
                    component={BudgetInsightsScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>💸</Text>
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={() => <PlaceholderScreen title="Profile" />}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>👤</Text>
                    }}
                />
            </Tab.Navigator>
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
    },
    tabLabel: {
        fontSize: 12,
    },
    icon: {
        fontSize: 20,
    }
});

export default AppNavigator;
