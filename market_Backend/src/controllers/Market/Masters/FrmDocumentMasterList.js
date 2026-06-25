const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmDocumentMasterList = async (req, res) => {
  let connection;
  try {
    const { orgId } = req.body; // Expecting orgId in the request body

    // Basic validation for orgId
    if (orgId === undefined || orgId === null || isNaN(orgId)) {
      return res
        .status(400)
        .json({
          error: "orgId is required and must be a number in the request body.",
        });
    }

    connection = await getConnection();

    const sqlQuery = `
            SELECT
                num_doc_id AS docId,
                var_doc_name AS docName,
                CASE var_doc_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                END AS docFlag
            FROM
                aomk_Doc_mas
            WHERE
                num_Doc_ULBID = :orgId_param
            ORDER BY
                num_doc_id DESC
        `;

    const result = await connection.execute(
      sqlQuery,
      { orgId_param: orgId }, // Bind the orgId parameter
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No documents found for Organization ID '${orgId}'.`,
        data: [],
      });
    }

    res.status(200).json({
      data: result.rows, // Return the array of document objects
    });
  } catch (err) {
    console.error("Error in getDocumentMasterByOrgId:", err);
    res
      .status(500)
      .json({
        error: "Failed to fetch document master data",
        details: err.message,
      });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection in getDocumentMasterByOrgId:",
          err
        );
      }
    }
  }
};

const BindDocumentDetails = async (req, res) => {
  let connection;
  try {
    const { documentId, orgId } = req.body;

    // Basic validation for inputs
    if (documentId === undefined || documentId === null || isNaN(documentId)) {
      return res
        .status(400)
        .json({ error: "documentId is required and must be a number." });
    }
    if (orgId === undefined || orgId === null || isNaN(orgId)) {
      return res
        .status(400)
        .json({ error: "orgId is required and must be a number." });
    }

    connection = await getConnection();

    const sqlQuery = `
            SELECT
                num_doc_id AS documentId,
                var_doc_name AS documentName,
                var_doc_flag AS documentFlag
            FROM
                aomk_Doc_mas
            WHERE
                num_Doc_ULBID = :orgId_param
                AND num_doc_id = :documentId_param
        `;

    const result = await connection.execute(
      sqlQuery,
      { documentId_param: documentId, orgId_param: orgId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: `No document data found for Document ID '${documentId}' in Organization ID '${orgId}'.`,
        });
    }

    res.status(200).json({
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in getSingleDocumentData:", err);
    res
      .status(500)
      .json({
        error: "Failed to fetch single document data",
        details: err.message,
      });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection in getSingleDocumentData:",
          err
        );
      }
    }
  }
};

const Aomk_Doc_Ins = async (req, res) => {
  let connection;

  try {
    const {
      In_Userid,
      In_Mode,
      In_DocId,
      In_Docname,
      In_Docflag,
      In_orgid,
      in_ipaddr,
      in_source,
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        Aomk_Doc_Ins(
          :In_Userid,
          :In_Mode,
          :In_DocId,
          :In_Docname,
          :In_Docflag,
          :In_orgid,
          :in_ipaddr,
          :in_source,
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_Userid: {
          val: In_Userid,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_Mode: { val: In_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_DocId: {
          val: In_DocId,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        In_Docname: {
          val: In_Docname,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_Docflag: {
          val: In_Docflag,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_orgid: {
          val: In_orgid,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        in_ipaddr: {
          val: in_ipaddr,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_source: {
          val: in_source,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
      }
    );

    res.json({
      success: true,
      errorcode: result.outBinds.Out_Errorcode,
      errormsg: result.outBinds.Out_Errormsg,
    });
  } catch (err) {
    console.error("Error in aomkDocIns:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
};

module.exports = { FrmDocumentMasterList, BindDocumentDetails, Aomk_Doc_Ins };
