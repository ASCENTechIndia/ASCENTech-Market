import CryptoJS from "crypto-js";

const EncryptionKey = "AS23N7E2H4V717DEAS23N7E2H4V717DE";

export const encryptPassword = (password) => {
  try {
    console.log("encryptPassword function is called with:", password); // Debugging
    const key = CryptoJS.enc.Utf8.parse(EncryptionKey);
    const encrypted = CryptoJS.TripleDES.encrypt(password, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

console.log("Encryption module loaded"); // Debugging
