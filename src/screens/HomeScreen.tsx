import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTransactions } from "../context/TransactionContext";

export default function HomeScreen() {
    const { transactions, loading } = useTransactions();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading transactions...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                Recent Transactions
            </Text>

            {transactions.length === 0 && (
                <Text style={{ color: "#777" }}>No transactions found</Text>
            )}

            {transactions.map(tx => {
                const isDebit = tx.type === "debit";

                return (
                    <View
                        key={tx.id}
                        style={{
                            marginBottom: 12,
                            padding: 14,
                            borderRadius: 10,
                            backgroundColor: "#fafafa",
                            borderLeftWidth: 5,
                            borderLeftColor: isDebit ? "#e53935" : "#2e7d32",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: isDebit ? "#e53935" : "#2e7d32",
                            }}
                        >
                            ₹{tx.amount}
                        </Text>

                        <Text
                            style={{
                                fontSize: 12,
                                color: isDebit ? "#e53935" : "#2e7d32",
                            }}
                        >
                            {isDebit ? "DEBIT" : "CREDIT"}
                        </Text>

                        <Text style={{ marginTop: 6 }}>{tx.merchant}</Text>
                        <Text style={{ fontSize: 12, color: "#777" }}>
                            via {tx.mode} (Ref: {tx.ref})
                        </Text>
                    </View>
                );
            })}
        </ScrollView>
    );
}
