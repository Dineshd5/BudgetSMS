import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(true);

let dbInstance: SQLite.SQLiteDatabase | null = null;

// Helper to get the database instance
const getDB = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await SQLite.openDatabase(
        { name: "budget.db", location: "default" }
    );
    return dbInstance;
};

export async function initDB() {
    try {
        const database = await getDB();

        // Create table if not exists - Added status column
        await database.executeSql(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                date TEXT,
                amount REAL,
                type TEXT,
                source TEXT,
                category TEXT,
                status TEXT DEFAULT 'pending'
            );
        `);

        await database.executeSql(`
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                name TEXT,
                upiId TEXT
            );
        `);

        // Check if status column exists
        const tableInfo = await database.executeSql(`PRAGMA table_info(transactions);`);
        let statusColumnExists = false;
        for (let i = 0; i < tableInfo[0].rows.length; i++) {
            if (tableInfo[0].rows.item(i).name === 'status') {
                statusColumnExists = true;
                break;
            }
        }

        if (!statusColumnExists) {
            try {
                await database.executeSql(`ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'pending';`);
                console.log("Migration: Added status column");
            } catch (e) {
                console.error("Migration failed:", e);
            }
        }

        // Force all undefined status to pending (for existing data migration)
        await database.executeSql(`UPDATE transactions SET status = 'pending' WHERE status IS NULL OR status = '';`);

        console.log("Database initialized");
    } catch (e) {
        console.error("Database initialization failed:", e);
    }
}

export async function insertTransaction(tx: {
    amount: number;
    type: string;
    mode: string;
    merchant: string;
    ref: string;
    timestamp: string;
    status?: string;
}) {
    console.log("DB: Inserting transaction", tx.ref, tx.amount, tx.timestamp);
    const database = await getDB();

    await database.executeSql(
        `INSERT OR IGNORE INTO transactions
        (id, amount, type, category, source, date, status)
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
            tx.ref,
            tx.amount,
            tx.type,
            tx.mode,
            tx.merchant,
            tx.timestamp,
            tx.status || 'pending',
        ]
    );
}

export async function getAllTransactions() {
    console.log("DB: getAllTransactions called");
    const database = await getDB();

    const results = await database.executeSql(
        `SELECT * FROM transactions ORDER BY date DESC`
    );

    const rows = results[0].rows;
    const transactions: any[] = [];
    console.log(`DB: Found ${rows.length} transactions`);

    for (let i = 0; i < rows.length; i++) {
        const item = rows.item(i);
        console.log("DB ROW:", JSON.stringify(item));
        transactions.push(item);
    }

    return transactions;
}

export async function deleteAllTransactions() {
    console.log("DB: deleteAllTransactions executing...");
    const database = await getDB();
    await database.executeSql(`DELETE FROM transactions`);
    console.log("DB: deleteAllTransactions DONE");
}

export async function deleteTransaction(id: number | string) {
    const database = await getDB();
    await database.executeSql(`DELETE FROM transactions WHERE id = ?`, [id]);
}

export const updateTransaction = async (id: number | string, tx: {
    amount?: number;
    type?: string;
    mode?: string;
    merchant?: string;
    timestamp?: string;
    status?: string;
}) => {
    const database = await getDB();
    // Dynamically build query
    const fields = [];
    const values = [];

    if (tx.amount !== undefined) { fields.push('amount = ?'); values.push(tx.amount); }
    if (tx.type !== undefined) { fields.push('type = ?'); values.push(tx.type); }
    if (tx.mode !== undefined) { fields.push('category = ?'); values.push(tx.mode); }
    if (tx.merchant !== undefined) { fields.push('source = ?'); values.push(tx.merchant); }
    if (tx.timestamp !== undefined) { fields.push('date = ?'); values.push(tx.timestamp); }
    if (tx.status !== undefined) { fields.push('status = ?'); values.push(tx.status); }

    if (fields.length === 0) return;

    values.push(id);
    const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
    await database.executeSql(query, values);
};

// --- Contacts ---
export const saveContact = async (id: string, name: string) => {
    const database = await getDB();
    await database.executeSql(`INSERT OR REPLACE INTO contacts(id, name) VALUES(?, ?)`, [id, name]);
};

export const getAllContacts = async () => {
    const database = await getDB();
    const results = await database.executeSql(`SELECT * FROM contacts`);
    const contacts: Record<string, string> = {};

    results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
            const item = result.rows.item(i);
            contacts[item.id] = item.name;
        }
    });

    return contacts;
};
