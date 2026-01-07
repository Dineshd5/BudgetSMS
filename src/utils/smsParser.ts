export interface ParsedTransaction {
    amount: number;
    type: 'credit' | 'debit';
    category: string;
    merchant: string; // Used for Person/UPI ID
    ref: string;
    date: string;
    balance?: number;
}

// Helper to clean amount string and parse float
// Helper to clean amount string and parse float
const parseAmount = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/,/g, ''));
};

export const extractAmount = (text: string): number | null => {
    // Matches: Rs. 1,234.50, INR 500, Rs 500, Amt 500, Amount 500, ₹500
    // Added 'Amt', 'Amount', and '₹' support
    const regex = /(?:Rs\.?|INR|Amt|Amount|₹)[:\-\s]*([\d,]+(?:\.\d{1,2})?)/i;
    const match = text.match(regex);
    return match ? parseAmount(match[1]) : null;
};

export const extractType = (text: string): 'credit' | 'debit' => {
    const t = text.toLowerCase();

    // 1. Handle "Debited" vs "Credited" collision (TMB style: "Your A/c debited... recipient credited")
    const debitedIdx = t.indexOf('debited');
    const creditedIdx = t.indexOf('credited');

    if (debitedIdx !== -1 && creditedIdx !== -1) {
        // Both present. The one appearing FIRST applies to the user's account.
        // "Your A/c is debited ... recipient is credited" -> Debit
        // "Your A/c is credited ... sender is debited" -> Credit
        if (debitedIdx < creditedIdx) return 'debit';
        return 'credit';
    }

    // 2. Explicit DEBIT keywords
    if (debitedIdx !== -1 || t.includes('withdrawn')) {
        return 'debit';
    }

    // 3. Explicit CREDIT keywords
    // Check for "recipient credited" (which is actually a debit for me) - Safety check if only part of msg is read
    if ((t.includes('credited') || t.includes('transfer')) && (t.includes('recipient') || t.includes('beneficiary'))) {
        return 'debit';
    }

    if (creditedIdx !== -1 || t.includes('received') || t.includes('deposited') || t.includes('refund') || t.includes('added')) {
        return 'credit';
    }

    // 4. Ambiguous "Sent"
    if (t.includes('sent')) {
        if (t.includes('sent to you') || t.includes('sent by')) {
            return 'credit';
        }
        return 'debit'; // "Sent to John"
    }

    // 5. Other Debit indicators
    if (t.includes('spent') || t.includes('paid') || t.includes('purchase') || t.includes('payment')) {
        return 'debit';
    }

    // Default to debit (Safety)
    return 'debit';
};

export const extractUpiId = (text: string): string | null => {
    // Generic UPI ID regex: username@bank
    const regex = /([a-zA-Z0-9.\-_]+@[a-zA-Z]+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
};

// Fallback to extract merchant name if no UPI ID
export const extractMerchant = (text: string, type: 'credit' | 'debit'): string => {
    const upi = extractUpiId(text);
    if (upi) return upi;

    // Look for phrases like "at [Merchant]" or "to [Person]"
    if (type === 'debit') {
        const atMatch = text.match(/\bat\s+([a-zA-Z0-9\s&]+)/i);
        if (atMatch) return atMatch[1].trim();
        const toMatch = text.match(/\bto\s+([a-zA-Z0-9\s&]+)/i);
        if (toMatch) return toMatch[1].trim();
    } else {
        const fromMatch = text.match(/\bfrom\s+([a-zA-Z0-9\s&]+)/i);
        if (fromMatch) return fromMatch[1].trim();
    }

    return "Unknown Entity";
};

export const extractReferenceId = (text: string): string | null => {
    // Matches specific patterns like "Ref: 123", "TxnId: 123"
    const regex = /(?:Ref|Reference|Txn|Id|No)[:\.\s-]*([a-zA-Z0-9]+)/i;
    const match = text.match(regex);
    return match ? match[1] : null;
};

export const assignCategory = (text: string, merchant: string): string => {
    const t = text.toLowerCase();
    const m = merchant.toLowerCase();

    // Merchant based
    if (m.includes('zomato') || m.includes('swiggy') || m.includes('eats')) return 'Food';
    if (m.includes('uber') || m.includes('ola') || m.includes('rapido')) return 'Travel';
    if (m.includes('amazon') || m.includes('flipkart') || m.includes('myntra') || m.includes('ajio')) return 'Shopping';

    // Keyword based
    if (t.includes('food') || t.includes('restaurant') || t.includes('dining')) return 'Food';
    if (t.includes('fuel') || t.includes('petrol') || t.includes('taxi')) return 'Travel';
    if (t.includes('recharge') || t.includes('bill') || t.includes('electricity') || t.includes('broadband')) return 'Utilities';
    if (t.includes('movie') || t.includes('netflix') || t.includes('cinema')) return 'Entertainment';
    if (t.includes('medical') || t.includes('hospital') || t.includes('pharmacy')) return 'Health';
    if (t.includes('grocery') || t.includes('mart') || t.includes('supermarket')) return 'Groceries';

    // Transfers
    if (m.includes('@') || t.includes('transfer')) return 'Transfers';

    return 'General';
};

export const extractDate = (text: string, fallbackTimestamp: number): string => {
    // Matches dates like:
    // 20-05-2023, 20/05/2023, 20-May-2023, 20 May 2023
    // "on 20..."

    // Regex 1: DD-MMM-YYYY or DD MMM YYYY (e.g., 12-Jan-2023, 12 Jan 23)
    const regex1 = /(\d{1,2})[-/\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s](\d{2,4})/i;
    const match1 = text.match(regex1);
    if (match1) {
        const day = parseInt(match1[1]);
        const monthStr = match1[2];
        let year = parseInt(match1[3]);
        if (year < 100) year += 2000; // Assume 21st century

        const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
        const date = new Date(year, monthIndex, day);
        // Validate date (simple check)
        if (!isNaN(date.getTime())) {
            // Include time from fallback if reasonable, or partial? 
            // Better to keep exact time of SMS for ordering, but override YMD.
            const original = new Date(fallbackTimestamp);
            date.setHours(original.getHours(), original.getMinutes(), original.getSeconds());
            return date.toISOString();
        }
    }

    // Regex 2: DD-MM-YYYY or DD/MM/YYYY (e.g., 12/05/2023)
    // Be careful of MM/DD/YYYY? Indian SMS mostly DD/MM.
    const regex2 = /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/;
    const match2 = text.match(regex2);
    if (match2) {
        const day = parseInt(match2[1]); // Fixed match1 -> match2
        const month = parseInt(match2[2]) - 1; // 0-based
        let year = parseInt(match2[3]);
        if (year < 100) year += 2000;

        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            const original = new Date(fallbackTimestamp);
            date.setHours(original.getHours(), original.getMinutes(), original.getSeconds());
            return date.toISOString();
        }
    }

    // If no date in text, use timestamp
    return new Date(fallbackTimestamp).toISOString();
};

export const parseSms = (body: string, timestamp: number): ParsedTransaction | null => {
    const amount = extractAmount(body);
    if (!amount) return null; // Not a transactional SMS

    const type = extractType(body);
    // Ignore internal parsing logic errors for now, rely on robust fallbacks

    const merchant = extractMerchant(body, type);
    const category = assignCategory(body, merchant);
    const ref = extractReferenceId(body) || `${timestamp}-${amount}`; // Fallback unique ID
    const date = extractDate(body, timestamp);

    return {
        amount,
        type,
        category,
        merchant,
        ref,
        date: date,
    };
};
