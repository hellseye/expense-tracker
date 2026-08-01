import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "ledger_secure_aes256_master_key_default")
  .digest(); // 32-byte secret key

/**
 * Encrypts a plain text string into AES-256-GCM ciphertext format (iv:authTag:encrypted)
 */
export function encryptText(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM ciphertext format (iv:authTag:encrypted) back to original plain text
 */
export function decryptText(encryptedText: string | null | undefined): string {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText || "";
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) return encryptedText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // If decryption fails (e.g. text was saved unencrypted prior to enabling encryption), return original
    return encryptedText;
  }
}
