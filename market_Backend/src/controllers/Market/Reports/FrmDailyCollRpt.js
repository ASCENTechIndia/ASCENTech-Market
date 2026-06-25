const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const FrmDailyCollRpt = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, FromDt, ToDt, ZoneId, PayModeId } = req.body;

    if (!ulbId || !FromDt || !ToDt) {
      console.error(
        "Validation Error: Missing required parameters in request body (ulbId, FromDt, ToDt)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: ulbId, FromDt, and ToDt are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input for ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) {
      console.error(
        `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) {
      console.error(
        `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }

    // Parse optional ZoneId (handle '-1' for all zones)
    let parsedZoneId = null;
    if (
      ZoneId !== undefined &&
      ZoneId !== null &&
      String(ZoneId) !== "-1" &&
      String(ZoneId).trim() !== ""
    ) {
      parsedZoneId = parseInt(ZoneId, 10);
      if (isNaN(parsedZoneId)) {
        console.error(
          `Validation Error: Invalid input for ZoneId: ${ZoneId}. Expected a number or '-1'.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format for ZoneId: ${ZoneId}. Expected a number or '-1'.`,
        });
      }
    } else if (String(ZoneId) === "-1") {
      parsedZoneId = -1; // Explicitly set to -1 for the SQL condition
    }

    // Parse optional PayModeId (handle '-1' for all payment modes)
    let parsedPayModeId = null;
    if (
      PayModeId !== undefined &&
      PayModeId !== null &&
      String(PayModeId) !== "-1" &&
      String(PayModeId).trim() !== ""
    ) {
      parsedPayModeId = parseInt(PayModeId, 10);
      if (isNaN(parsedPayModeId)) {
        console.error(
          `Validation Error: Invalid input for PayModeId: ${PayModeId}. Expected a number or '-1'.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format for PayModeId: ${PayModeId}. Expected a number or '-1'.`,
        });
      }
    } else if (String(PayModeId) === "-1") {
      parsedPayModeId = -1; // Explicitly set to -1 for the SQL condition
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT *
      FROM view_licensereg
      WHERE ulbid = :ulbId
      AND TRUNC(appli_recdate) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
      AND (-1 = :ZoneId OR zoneid = :ZoneId)
      AND (-1 = :PayModeId OR paymodeid = :PayModeId)
      ORDER BY appli_recdate DESC
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      ZoneId: { val: parsedZoneId, type: oracledb.NUMBER }, // Will be -1 or actual zone ID
      PayModeId: { val: parsedPayModeId, type: oracledb.NUMBER }, // Will be -1 or actual pay mode ID
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching License Register Report:", error);
    if (!res.headersSent) {
      const clientError = {
        message:
          error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message:
          "Internal Server Error during fetching License Register Report.",
        error: clientError,
      });
    }
  }
};

module.exports = FrmDailyCollRpt;
