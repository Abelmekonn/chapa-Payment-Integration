import * as jsrsasign from "jsrsasign"; // Use jsrsasign directly
import process from "process"; // Import process for environment variables

// Fields not participating in signature
const excludeFields = [
    "sign",
    "sign_type",
    "header",
    "refund_info",
    "openType",
    "raw_request",
    "biz_content",
];

/**
 * Signs a request object.
 * @param {Object} requestObject - The request object to sign.
 * @returns {string} - The generated signature.
 */
export function signRequestObject(requestObject) {
    if (!requestObject || typeof requestObject !== "object") {
        throw new Error("Invalid request object provided for signing.");
    }

    let fields = [];
    let fieldMap = {};

    // Iterate through request object fields
    for (let key in requestObject) {
        if (!excludeFields.includes(key)) {
            fields.push(key);
            fieldMap[key] = requestObject[key];
        }
    }


    // Include nested fields from "biz_content" in signature
    if (requestObject.biz_content) {
        const biz = requestObject.biz_content;
        for (let key in biz) {
            if (!excludeFields.includes(key)) {
                fields.push(key);
                fieldMap[key] = biz[key];
            }
        }
    }

    // Sort fields by ASCII
    fields.sort();

    console.log("fields" ,fields)

    // Build the signature string
    const signStrList = fields.map((key) => `${key}=${fieldMap[key]}`);
    const signOriginStr = signStrList.join("&");

    // Get the private key from the environment variable
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "<fallback_private_key>";
    return signString(signOriginStr, PRIVATE_KEY);
}

/**
 * Signs a string using SHA256 with RSA.
 * @param {string} text - The text to sign.
 * @param {string} PRIVATE_KEY - The private key in PEM format.
 * @returns {string|null} - The generated signature, or null if an error occurs.
 */
export const signString = (text, PRIVATE_KEY) => {
    try {
        if (!text) throw new Error("Text to sign is empty or invalid.");
        if (!PRIVATE_KEY) throw new Error("Private key is missing.");
        if (!PRIVATE_KEY.includes("BEGIN PRIVATE KEY")) {
            throw new Error("Invalid private key format.");
        }
        // Initialize signature object
        const sha256withrsa = new jsrsasign.KJUR.crypto.Signature({
            alg: "SHA256withRSAandMGF1",
        });

        // Initialize with private key
        sha256withrsa.init(PRIVATE_KEY);

        // Update the string to be signed
        sha256withrsa.updateString(text);

        // Generate signature and convert to Base64
        const sign = jsrsasign.hextob64(sha256withrsa.sign());

        console.log("obj" , sign)

        return sign;
    } catch (error) {
        console.error("Error signing string:", error.message);
        return null;
    }
};

/**
 * Creates a UNIX timestamp.
 * @returns {string} - The current timestamp.
 */
export function createTimeStamp() {
    return Math.round(new Date() / 1000).toString();
}

/**
 * Creates a 32-character random alphanumeric string.
 * @returns {string} - The generated nonce string.
 */
export function createNonceStr() {
    const chars =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let str = "";
    for (let i = 0; i < 32; i++) {
        const index = Math.floor(Math.random() * chars.length);
        str += chars[index];
    }
    return str;
}

// Optionally group all utilities under a single default export
const tools = {
    signRequestObject,
    signString,
    createTimeStamp,
    createNonceStr,
};

export default tools;
