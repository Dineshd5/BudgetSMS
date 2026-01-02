import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(true);

export const db = SQLite.openDatabase(
    { name: "budget.db", location: "default" },
    () => console.log("DB opened"),
    error => console.log("DB error", error)
);

export async function initDB() {
    const database = await db;

    await database.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      type TEXT,
      mode TEXT,
      merchant TEXT,
      ref TEXT UNIQUE,
      timestamp TEXT
    );
  `);
}

export async function insertTransaction(tx: {
    amount: number;
    type: string;
    mode: string;
    merchant: string;
    ref: string;
    timestamp: string;
}) {
    const database = await db;

    await database.executeSql(
        `INSERT OR IGNORE INTO transactions
     (amount, type, mode, merchant, ref, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            tx.amount,
            tx.type,
            tx.mode,
            tx.merchant,
            tx.ref,
            tx.timestamp,
        ]
    );
}

export async function getAllTransactions() {
    const database = await db;

    const results = await database.executeSql(
        `SELECT * FROM transactions ORDER BY timestamp DESC`
    );

    const rows = results[0].rows;
    const transactions: any[] = [];

    for (let i = 0; i < rows.length; i++) {
        transactions.push(rows.item(i));
    }

    return transactions;
}
