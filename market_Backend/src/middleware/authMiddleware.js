const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const EncryptionKey = "AS23N7E2H4V717DEAS23N7E2H4V717DE";

// Encrypt password using TripleDES
const encryptPassword = (password) => {
    try {
        console.log("encryptPassword function is called with:", password); // Debugging
        const key = CryptoJS.enc.Utf8.parse(EncryptionKey);
        const encrypted = CryptoJS.TripleDES.encrypt(password, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure JWT_SECRET is set in .env file
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Export both functions properly
module.exports = { encryptPassword, authenticateJWT };
