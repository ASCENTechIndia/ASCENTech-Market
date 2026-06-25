const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getTradeRatesFromDate = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { tradeTypes, fromDate, ulbId } = req.body;

    if (!tradeTypes || !fromDate || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (tradeTypes, fromDate, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: tradeTypes, fromDate, and ulbId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    // Convert tradeTypes string to an array of numbers for the IN clause
    const parsedTradeTypes = tradeTypes.split(',').map(id => parseInt(id.trim(), 10));
    if (parsedTradeTypes.some(isNaN) || parsedTradeTypes.length === 0) {
      console.error(`Validation Error: Invalid tradeTypes: ${tradeTypes}. Expected comma-separated numbers.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for tradeTypes: ${tradeTypes}. Expected comma-separated numbers.`,
      });
    }


    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_rate_id AS tradeTypeId,
        SUM(NVL(num_rate_rate, 0)) AS tradeTypeRateSum
      FROM
        aomk_rate_mas
      WHERE
        num_rate_id IN (${parsedTradeTypes.map((_, i) => `:tradeType_${i}`).join(', ')}) -- Dynamic binds for IN clause
        AND (TRUNC(dat_rate_fromdate) >= TO_DATE(:fromDate, 'DD-MM-YYYY') OR dat_rate_todate IS NULL)
        AND num_rate_ulbid = :ulbId
      GROUP BY
        num_rate_id
      ORDER BY
        num_rate_id -- Optional: Order by ID for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ...parsedTradeTypes.reduce((acc, id, i) => ({ ...acc, [`tradeType_${i}`]: { val: id, type: oracledb.NUMBER } }), {}),
      fromDate: { val: fromDate, type: oracledb.STRING }, // Pass date as string, Oracle will convert with TO_DATE
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching aggregated trade rates:", error);
    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching aggregated trade rates.",
        error: clientError,
      });
    }
  }
};

module.exports = getTradeRatesFromDate;
