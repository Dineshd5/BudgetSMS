import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import {
  initDB,
  insertTransaction,
  getAllTransactions,
} from "./src/db/database";

import { PermissionsAndroid } from "react-native";

async function requestSmsPermission(): Promise<boolean> {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    {
      title: "SMS Access",
      message:
        "This app reads bank SMS to track your expenses automatically.",
      buttonPositive: "Allow",
      buttonNegative: "Deny",
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}


/* ======================
   Types
====================== */
type Transaction = {
  id?: number;
  amount: number;
  type: "debit" | "credit";
  mode: "UPI" | "CARD" | "CASH" | "UNKNOWN";
  merchant: string;
  ref: string;
  timestamp: string;
};

/* ======================
   Helpers
====================== */

function extractAmount(text: string): number | null {
  const match = text.match(/rs\.?\s?([\d,]+)/i);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

function extractType(text: string): "debit" | "credit" {
  const t = text.toLowerCase();

  if (
    t.includes("credit") ||
    t.includes("credited") ||
    t.includes("received") ||
    t.includes("is credited")
  ) {
    return "credit";
  }

  return "debit";
}


function extractMode(text: string): Transaction["mode"] {
  const t = text.toLowerCase();
  if (t.includes("upi")) return "UPI";
  if (t.includes("card")) return "CARD";
  if (t.includes("cash")) return "CASH";
  return "UNKNOWN";
}

function extractMerchant(text: string): string {
  // Case 1: "at Amazon"
  const atMatch = text.match(/at\s([a-zA-Z0-9\s]+)/i);
  if (atMatch) return atMatch[1].trim();

  // Case 2: "linked to paytm-xxxx@ptys"
  const upiMatch = text.match(/linked to\s([a-zA-Z0-9\-_.@]+)/i);
  if (upiMatch) return upiMatch[1];

  return "Unknown";
}


function extractRef(text: string): string {
  const match = text.match(/ref\s*no\.?\s*([0-9]+)/i);
  return match ? match[1] : "";
}

const BLOCK_WORDS = [
  "recharge",
  "offer",
  "validity",
  "plan",
  "unlimited",
  "data",
  "cashback",
  "reward",
  "limit",
  "cooling",
  "emi",
  "trial",
  "free",
  "days",
  "benefits",
];

function isTransactionSMS(body: string): boolean {
  const text = body.toLowerCase();

  if (BLOCK_WORDS.some(w => text.includes(w))) return false;

  const isDebit =
    text.includes("debit") ||
    text.includes("debited") ||
    text.includes("spent");

  const isCredit =
    text.includes("credit") ||
    text.includes("credited") ||
    text.includes("received") ||
    text.includes("is credited");

  if (!isDebit && !isCredit) return false;

  if (!/rs\.?\s?\d/.test(text)) return false;

  if (
    !text.includes(" upi ") &&
    !text.includes(" ref ") &&
    !text.includes(" ref no") &&
    !text.includes(" on ")
  ) {
    return false;
  }

  return true;
}


function parseTransaction(body: string): Transaction | null {
  const amount = extractAmount(body);
  if (!amount) return null;

  return {
    amount,
    type: extractType(body),
    mode: extractMode(body),
    merchant: extractMerchant(body),
    ref: extractRef(body),
    timestamp: new Date().toISOString(),
  };
}

/* ======================
   App
====================== */
export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function init() {
      await initDB();

      const allowed = await requestSmsPermission();
      if (!allowed) return;

      await readSmsAndSync();
      const dbTx = await getAllTransactions();
      setTransactions(dbTx);
    }
    init();
  }, []);

  console.log(
    transactions.map(t => `${t.type} ₹${t.amount}`)
  );


  function readSmsAndSync(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Platform.OS !== "android") {
        resolve();
        return;
      }

      const filter = { box: "inbox", maxCount: 300 };

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: string) => {
          console.log("SMS read failed:", fail);
          reject(fail);
        },
        async (_count: number, smsList: string) => {
          try {
            const smsArray = JSON.parse(smsList);

            for (const sms of smsArray) {
              if (!isTransactionSMS(sms.body)) continue;

              const tx = parseTransaction(sms.body);
              if (!tx) continue;

              await insertTransaction(tx);
            }

            resolve();
          } catch (err) {
            reject(err);
          }
        }
      );
    });
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
              via {tx.mode}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
