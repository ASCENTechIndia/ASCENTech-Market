const express = require("express");
const CryptoJS = require("crypto-js");
const logger = require("./logger");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();

const API_SECRET = "your-secret-key";
const BASE_API_URL = "http://localhost:5000/";

function decryptPayload(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, API_SECRET);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

function encryptPayload(data) {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, API_SECRET).toString();
}

router.post("/:encodedEndpoint", async (req, res) => {
  const startTime = Date.now();
  try {
    const endpoint = Buffer.from(req.params.encodedEndpoint, "base64").toString(
      "utf-8"
    );
    const { payload } = req.body;
    const decryptedData = decryptPayload(payload);

    const response = await fetch(BASE_API_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decryptedData),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const text = await response.text();
      logger.error(`POST ${endpoint} failed: ${text}`);
      logger.info(`⏱️ POST ${endpoint} failed after ${duration}ms`);
      return res
        .status(500)
        .json({ error: `Backend API error: ${response.status}` });
    }

    const result = await response.json();

    // 🔍 Log full response for visibility
    logger.info(`🔍 Response from ${endpoint}: ${JSON.stringify(result)}`);

    // ✅ Detect and log business logic errors
    if (
      result.OUT_ERRORMSG &&
      result.OUT_ERRORMSG.toLowerCase().includes("invalid")
    ) {
      logger.error(
        `❌ Application-level error from ${endpoint}: ${result.OUT_ERRORMSG}`
      );
    }

    const encryptedResult = encryptPayload(result);
    logger.info(`✅ POST ${endpoint} completed in ${duration}ms`);
    res.json({ payload: encryptedResult });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error(`POST Proxy Error: ${err.message}`);
    logger.info(`⏱️ POST error after ${duration}ms`);
    res.status(500).json({ error: "Decryption or proxy error" });
  }
});

router.get("/:encodedEndpoint", async (req, res) => {
  const startTime = Date.now();
  try {
    const endpoint = Buffer.from(req.params.encodedEndpoint, "base64").toString(
      "utf-8"
    );
    const { payload } = req.query;

    if (!payload) {
      logger.warn(`GET ${endpoint} - Missing payload`);
      return res
        .status(400)
        .json({ error: "Missing encrypted payload in query" });
    }

    const decryptedParams = decryptPayload(payload);

    const queryString = new URLSearchParams(decryptedParams).toString();
    const response = await fetch(`${BASE_API_URL}${endpoint}?${queryString}`);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const text = await response.text();
      logger.error(`GET ${endpoint} failed: ${text}`);
      logger.info(`⏱️ GET ${endpoint} failed after ${duration}ms`);
      return res
        .status(500)
        .json({ error: `Backend API error: ${response.status}` });
    }
    const result = await response.json();
    logger.info(`🔍 Response from ${endpoint}: ${JSON.stringify(result)}`);

    // Check for application-level error inside a successful 200 response
    if (
      result.OUT_ERRORMSG &&
      result.OUT_ERRORMSG.toLowerCase().includes("invalid")
    ) {
      logger.error(
        `❌ Application-level error from ${endpoint}: ${result.OUT_ERRORMSG}`
      );
    }
    const encryptedResult = encryptPayload(result);
    logger.info(`✅ GET ${endpoint} completed in ${duration}ms`);
    res.json({ payload: encryptedResult });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error(`GET Proxy Error: ${err.message}`);
    logger.info(`⏱️ GET error after ${duration}ms`);
    res.status(500).json({ error: "Decryption or proxy error" });
  }
});

module.exports = router;
