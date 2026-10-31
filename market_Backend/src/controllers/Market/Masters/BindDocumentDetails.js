const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const BindDocumentDetails = async (req, res) => {
    let connection;
    try {
        const { documentId, orgId } = req.body;

        // Basic validation for inputs
        if (documentId === undefined || documentId === null || isNaN(documentId)) {
            return res.status(400).json({ error: 'documentId is required and must be a number.' });
        }
        if (orgId === undefined || orgId === null || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number.' });
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
            return res.status(404).json({ message: `No document data found for Document ID '${documentId}' in Organization ID '${orgId}'.` });
        }

        res.status(200).json({
            data: result.rows[0] 
        });

    } catch (err) {
        console.error('Error in getSingleDocumentData:', err);
        res.status(500).json({ error: 'Failed to fetch single document data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getSingleDocumentData:', err);
            }
        }
    }
};

module.exports = BindDocumentDetails