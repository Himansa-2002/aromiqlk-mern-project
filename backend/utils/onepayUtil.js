import crypto from "crypto";

/**
 * Generates the OnePay transaction hash.
 * Hash format: SHA256(app_id + currency + amount + HASH_SALT)
 */
export const generateOnePayHash = (appId, currency, amount, hashSalt) => {
    // OnePay amount normally requires 2 decimal places as a string (e.g., "100.00")
    const formattedAmount = Number(amount).toFixed(2);
    const data = `${appId}${currency}${formattedAmount}${hashSalt}`;
    return crypto.createHash("sha256").update(data).digest("hex");
};
