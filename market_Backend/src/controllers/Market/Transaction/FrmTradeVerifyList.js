const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database'); 
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const getWardConfigUserList = async (req, res) => {
    let connection;
    try {
        const { OrgId } = req.body; 

        if (!OrgId) {
            return res.status(400).json({
                error: 'OrgId is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT DISTINCT
                t1.var_user_username AS username,
                t1.num_user_userid AS userid
            FROM
                aomk_warduser_config t2
            INNER JOIN
                admins.aoma_user_def t1 ON t1.num_user_userid = t2.num_warduser_userid
                                          AND t1.num_user_ulbid = t2.num_warduser_ulbid
            WHERE
                t2.num_warduser_ulbid = :OrgId
            GROUP BY
                t1.var_user_username,
                t1.num_user_userid
            ORDER BY
                t1.var_user_username
        `;

        const binds = {
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getWardConfigUserList:', error);
        res.status(500).json({
            error: 'Failed to retrieve user list with ward configurations.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getWardConfigUserList:', err);
            }
        }
    }
};





const getTradeServiceAppStatus = async (req, res) => {
    let connection;
    try {
        const { OrgId } = req.body; 

        if (!OrgId) {
            return res.status(400).json({
                error: 'OrgId is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS id,
                num_trade_appid AS appid,
                var_trade_licenseno AS licenseno,
                var_trade_appno AS appno,
                var_trade_appfname || ' ' || var_trade_appmname || ' ' || var_trade_applname AS appliname,
                num_trade_mobile AS mobile,
                var_trade_email AS email,
                var_trade_address AS address,
                var_trade_servicename AS service,
                CASE
                    WHEN var_trade_servicename = 'CP' THEN 'Correction in Partners Name'
                    WHEN var_trade_servicename = 'ARPS' THEN 'Add / Remove Partners'
                    WHEN var_trade_servicename = 'TRNC' THEN 'Trade License Name Change'
                    WHEN var_trade_servicename = 'TSC' THEN 'Trade License Secondary Copy'
                    WHEN var_trade_servicename = 'TRBC' THEN 'Trade License Business Change'
                    WHEN var_trade_servicename = 'TLC' THEN 'Trade License Cancel'
                    WHEN var_trade_servicename = 'TTRF' THEN 'Trade License Transfer'
                    WHEN var_trade_servicename = 'ADRC' THEN 'Change in Address'
                    WHEN var_trade_servicename = 'RB' THEN 'Remove Business'
                END AS servicename
            FROM
                aomk_tradeservice_mas
            WHERE
                var_trade_appstatus IN ('V', 'S', 'ADH')
                AND num_trade_ulbid = :OrgId
            ORDER BY
                var_trade_appno DESC
        `;

        const binds = {
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeServiceVSADHList:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade service list.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeServiceVSADHList:', err);
            }
        }
    }
};




const getTradeServiceADVList = async (req, res) => {
    let connection;
    try {
        // Destructure parameter from the request body
        const { OrgId } = req.body; 

        // Basic validation for the required field
        if (!OrgId) {
            return res.status(400).json({
                error: 'OrgId is required in the request body.'
            });
        }

        connection = await getConnection();

        // The SQL query with a proper bind variable
        const sqlQuery = `
            SELECT
                num_trade_id AS id,
                num_trade_appid AS appid,
                var_trade_licenseno AS licenseno,
                var_trade_appno AS appno,
                var_trade_appfname || ' ' || var_trade_appmname || ' ' || var_trade_applname AS appliname,
                num_trade_mobile AS mobile,
                var_trade_email AS email,
                var_trade_address AS address,
                var_trade_servicename AS service,
                CASE
                    WHEN var_trade_servicename = 'CP' THEN 'Correction in Partners Name'
                    WHEN var_trade_servicename = 'ARPS' THEN 'Add / Remove Partners'
                    WHEN var_trade_servicename = 'TRNC' THEN 'Trade License Name Change'
                    WHEN var_trade_servicename = 'TSC' THEN 'Trade License Secondary Copy'
                    WHEN var_trade_servicename = 'TRBC' THEN 'Trade License Business Change'
                    WHEN var_trade_servicename = 'TLC' THEN 'Trade License Cancel'
                    WHEN var_trade_servicename = 'TTRF' THEN 'Trade License Transfer'
                    WHEN var_trade_servicename = 'ADRC' THEN 'Change in Address'
                    WHEN var_trade_servicename = 'RB' THEN 'Remove Business'
                END AS servicename
            FROM
                aomk_tradeservice_mas
            WHERE
                var_trade_appstatus = 'ADV'
                AND num_trade_ulbid = :OrgId
            ORDER BY
                var_trade_appno DESC
        `;

        // Bind variable for the query
        const binds = {
            OrgId: OrgId
        };

        // Execute the query
        const result = await connection.execute(sqlQuery, binds);

        // Send the query results as JSON response
        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeServiceADVList:', error);
        // Send an error response
        res.status(500).json({
            error: 'Failed to retrieve trade service list.',
            details: error.message
        });
    } finally {
        // Ensure the connection is always closed
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeServiceADVList:', err);
            }
        }
    }
};





const getTradeServiceTLCRBList = async (req, res) => {
    let connection;
    try {
        const { OrgId, UserId } = req.body; 

        if (!OrgId || !UserId) {
            return res.status(400).json({
                error: 'OrgId and UserId are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS id,
                num_trade_appid AS appid,
                var_trade_licenseno AS licenseno,
                var_trade_appno AS appno,
                var_trade_appfname || ' ' || var_trade_appmname || ' ' || var_trade_applname AS appliname,
                num_trade_mobile AS mobile,
                var_trade_email AS email,
                var_trade_address AS address,
                var_trade_servicename AS service,
                CASE
                    WHEN var_trade_servicename = 'CP' THEN 'Correction in Partners Name'
                    WHEN var_trade_servicename = 'ARPS' THEN 'Add / Remove Partners'
                    WHEN var_trade_servicename = 'TRNC' THEN 'Trade License Name Change'
                    WHEN var_trade_servicename = 'TSC' THEN 'Trade License Secondary Copy'
                    WHEN var_trade_servicename = 'TRBC' THEN 'Increase in Trade'
                    WHEN var_trade_servicename = 'TLC' THEN 'Trade License Cancel'
                    WHEN var_trade_servicename = 'TTRF' THEN 'Trade License Transfer'
                    WHEN var_trade_servicename = 'ADRC' THEN 'Change in Address'
                    WHEN var_trade_servicename = 'RB' THEN 'Decrease in Trade'
                END AS servicename
            FROM
                aomk_tradeservice_mas
            WHERE
                var_trade_appstatus = 'V'
                AND num_trade_ulbid = :OrgId
                AND var_trade_servicename IN ('TLC', 'RB')
                AND var_trade_siuser = :UserId
            ORDER BY
                var_trade_appno DESC
        `;

        const binds = {
            OrgId: OrgId,
            UserId: UserId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeServiceTLC_RBList:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade service list.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeServiceTLC_RBList:', err);
            }
        }
    }
};





const getTradeServiceList = async (req, res) => {
    let connection;
    try {
        const { OrgId } = req.body; 

        if (!OrgId) {
            return res.status(400).json({
                error: 'OrgId is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS id,
                num_trade_appid AS appid,
                var_trade_licenseno AS licenseno,
                var_trade_appno AS appno,
                var_trade_appfname || ' ' || var_trade_appmname || ' ' || var_trade_applname AS appliname,
                num_trade_mobile AS mobile,
                var_trade_email AS email,
                var_trade_address AS address,
                var_trade_servicename AS service,
                CASE
                    WHEN var_trade_servicename = 'CP' THEN 'Correction in Partners Name'
                    WHEN var_trade_servicename = 'ARPS' THEN 'Add / Remove Partners'
                    WHEN var_trade_servicename = 'TRNC' THEN 'Trade License Name Change'
                    WHEN var_trade_servicename = 'TSC' THEN 'Trade License Secondary Copy'
                    WHEN var_trade_servicename = 'TRBC' THEN 'Increase in Trade'
                    WHEN var_trade_servicename = 'TLC' THEN 'Trade License Cancel'
                    WHEN var_trade_servicename = 'TTRF' THEN 'Trade License Transfer'
                    WHEN var_trade_servicename = 'ADRC' THEN 'Change in Address'
                    WHEN var_trade_servicename = 'RB' THEN 'Decrease in Trade'
                END AS servicename
            FROM
                aomk_tradeservice_mas
            WHERE
                var_trade_appstatus IS NULL
                AND num_trade_ulbid = :OrgId
                AND var_trade_appno IN (
                    SELECT
                        var_pgtrans_applino
                    FROM
                        aomk_pgtrans_mas
                    WHERE
                        num_pgtrans_ulbid = aomk_tradeservice_mas.num_trade_ulbid
                        AND var_pgtrans_applino = aomk_tradeservice_mas.var_trade_appno
                )
            ORDER BY
                var_trade_appno DESC
        `;

        const binds = {
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeServiceList:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade service list.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeServiceList:', err);
            }
        }
    }
};



const getTradeServiceDetailsByAppNo = async (req, res) => {
    let connection;
    try {
        // Destructure parameters from the request body
        const { AppNo, OrgId } = req.body; 

        // Basic validation for the required fields
        if (!AppNo || !OrgId) {
            return res.status(400).json({
                error: 'AppNo and OrgId are required in the request body.'
            });
        }

        connection = await getConnection();

        // The SQL query with proper bind variables
        const sqlQuery = `
            SELECT
                var_trade_appno AS appno,
                var_trade_licenseno AS licenseno,
                var_trade_appfname || ' ' || var_trade_appmname || ' ' || var_trade_applname AS appliname,
                num_trade_mobile AS mobile,
                var_trade_email AS email,
                num_trade_aadhar AS aadhar,
                var_trade_propno AS propno,
                var_trade_address AS address,
                var_trade_remark AS remark,
                var_trade_newbusiname AS newbusiname,
                var_trade_newownfname AS newownfname,
                var_trade_newownmname AS newownmname,
                var_trade_newownlname AS newownlname,
                var_trade_newcofname AS newcofname,
                var_trade_newcomname AS newcomname,
                var_trade_newcolname AS newcolname,
                var_trade_appstatus AS appstatus,
                var_trade_adhremark AS adhremark,
                var_trade_sdremark AS sdremark,
                num_trade_wardid AS wardid,
                num_trade_zoneid AS zoneid
            FROM
                aomk_tradeservice_mas
            WHERE
                var_trade_appno = :AppNo
                AND num_trade_ulbid = :OrgId
        `;

        // Bind variables for the query
        const binds = {
            AppNo: AppNo,
            OrgId: OrgId
        };

        // Execute the query
        const result = await connection.execute(sqlQuery, binds);

        // This query should return at most one row.
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({
                error: 'Application not found.'
            });
        }

    } catch (error) {
        console.error('API Error in getTradeServiceDetails:', error);
        // Send an error response
        res.status(500).json({
            error: 'Failed to retrieve trade service details.',
            details: error.message
        });
    } finally {
        // Ensure the connection is always closed
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeServiceDetails:', err);
            }
        }
    }
};


const getSdItems = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        // The SQL query with a hardcoded IN clause.
        const sqlQuery = `
            SELECT
                num_sditems_id AS itemid,
                var_sditems_name AS item
            FROM
                aomk_sditems_mas
            WHERE
                num_sditems_id IN ('1', '2', '5')
        `;

        // Execute the query without any bind variables
        const result = await connection.execute(sqlQuery);

        // Send the query results as JSON response
        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getSdItems:', error);
        // Send an error response
        res.status(500).json({
            error: 'Failed to retrieve SD items.',
            details: error.message
        });
    } finally {
        // Ensure the connection is always closed
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getSdItems:', err);
            }
        }
    }
};




const FILE_UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "generated_files");

const getSdItemsWithBlobs = async (req, res) => {
    let connection;

    try {
        // Ensure directory exists asynchronously.
        // fs.promises.mkdir with recursive: true is idempotent, so no need for existsSync.
        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        // Extract parameters from body
        const { appliId, orgId } = req.body;

        // Validate parameters
        if (!appliId || !orgId) {
            return res.status(400).json({
                success: false,
                message: "appliId and orgId are required.",
            });
        }

        // Parse and validate
        const parsedAppliId = parseInt(appliId, 10);
        const parsedOrgId = parseInt(orgId, 10);
        if (isNaN(parsedAppliId) || isNaN(parsedOrgId)) {
            return res.status(400).json({
                success: false,
                message: "appliId and orgId must be numbers.",
            });
        }

        connection = await getConnection();

        const sql = `
            SELECT
                sditems.num_sditems_id AS id,
                sditems.num_sditems_appliid AS appliid,
                sditems.num_sditems_ulbid AS ulbid,
                sditems.num_sditems_itemsid AS itemsid,
                sditem.var_sditems_name AS items,
                sditems.var_sditems_remark AS remark,
                sditems.blob_sditems_siterpt AS siterpt,
                sditems.blob_sditems_photo AS photo
            FROM
                aomk_sditems_det sditems
            INNER JOIN
                aomk_sditems_mas sditem ON sditem.num_sditems_id = sditems.num_sditems_itemsid
            WHERE
                sditems.num_sditems_appliid = :appliId
                AND sditems.num_sditems_ulbid = :orgId
                AND sditems.num_sditems_itemsid IN (3, 4, 5)
        `;

        const binds = {
            appliId: parsedAppliId,
            orgId: parsedOrgId,
        };

        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
                SITERPT: { type: oracledb.BUFFER }, // Ensure BLOBs are fetched as Buffers
                PHOTO: { type: oracledb.BUFFER },
            },
        });

        // Use Promise.all with async map to ensure all file writes complete
        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row }; // Create a copy to avoid modifying original row

            let siterptUrl = null;
            let photoUrl = null;

            // Handle siterpt BLOB
            if (newRow.SITERPT instanceof Buffer && newRow.SITERPT.length > 0) {
                const siterptFilename = `${uuidv4()}_siterpt.pdf`; // Use uuidv4()
                const siterptPath = path.join(FILE_UPLOAD_DIR, siterptFilename);
                try {
                    await fs.writeFile(siterptPath, newRow.SITERPT); // Use await fs.writeFile
                    siterptUrl = `/generated_files/${siterptFilename}`;
                } catch (err) {
                    console.error("Failed to write siterpt file:", err);
                }
            }

            // Handle photo BLOB
            if (newRow.PHOTO instanceof Buffer && newRow.PHOTO.length > 0) {
                const photoFilename = `${uuidv4()}_photo.jpg`; // Use uuidv4()
                const photoPath = path.join(FILE_UPLOAD_DIR, photoFilename);
                try {
                    await fs.writeFile(photoPath, newRow.PHOTO); // Use await fs.writeFile
                    photoUrl = `/generated_files/${photoFilename}`;
                } catch (err) {
                    console.error("Failed to write photo file:", err);
                }
            }

            return {
                id: newRow.ID,
                appliId: newRow.APPLIID, // Corrected casing
                ulbId: newRow.ULBID,
                itemsId: newRow.ITEMSID,
                items: newRow.ITEMS,
                remark: newRow.REMARK,
                siterptUrl,
                photoUrl,
                // Explicitly set raw BLOBs to undefined to remove them from the response
                siterpt: undefined, 
                photo: undefined,
            };
        }));

        res.status(200).json({
            success: true,
            message: "Site inspection items fetched successfully.",
            data: processedRows,
        });
    } catch (error) {
        console.error("Error fetching sd items:", error);
        if (connection) {
            try {
                // For a SELECT statement, rollback is usually not necessary.
                // It's primarily for DML (INSERT, UPDATE, DELETE).
                // If this is part of a larger transaction, keep it.
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }
        // Robust error response to prevent circular errors
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Internal server error while fetching site inspection items.",
                details: "An unexpected internal server error occurred.", // Generic message for client
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in getSdItemsWithBlobs:", err);
            }
        }
    }
};





const getMarketLicenseDetailsByLicenseNoAndOrg = async (req, res) => {
    let connection;
    try {
        const { licenseNo, OrgId } = req.body;

        // Basic validation for required fields
        if (!licenseNo || !OrgId) {
            return res.status(400).json({
                error: 'License Number (licenseNo) and Organization ID (OrgId) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                am.num_appli_id AS appli_id,
                am.var_appli_placeownername AS placeownername,
                mlm.dat_mktlice_validfrom AS valid_from,
                mlm.dat_mktlice_validtilldt AS valid_till_dt,
                am.var_appli_address AS address,
                rm.num_rate_tradetypename AS tradetype, 
                tcm.num_tradecategory_id AS tradecategory_id,
                tcm.var_tradecategory_name AS tradecategory,
                am.num_appli_arreasamt AS arrears_amount,
                CASE
                    WHEN am.var_appli_type = 'N' THEN 'New'
                    WHEN am.var_appli_type = 'R' THEN 'Renewal'
                END AS license_type,
                am.var_appli_shopname AS shop_name
            FROM
                market.aomk_mktlice_mas mlm
            INNER JOIN
                market.aomk_appli_mas am ON am.num_appli_id = mlm.num_mktlice_appliid
                                         AND am.num_appli_ulbid = mlm.num_mktlice_ulbid
            INNER JOIN
                market.aomk_applitradetyp_det attd ON attd.num_applitradetype_appliid = mlm.num_mktlice_appliid
                                                    AND attd.num_applitradetyp_ulbid = mlm.num_mktlice_ulbid
            INNER JOIN
                market.aomk_rate_mas rm ON attd.num_applitradetype_trdtypid = rm.num_rate_id
            INNER JOIN
                market.aomk_applitrade_det atd ON atd.num_applitrade_appliid = mlm.num_mktlice_appliid
                                                AND atd.num_applitrade_ulbid = mlm.num_mktlice_ulbid
            INNER JOIN
                market.aomk_TradeCategory_mas tcm ON tcm.num_tradecategory_id = atd.num_applitrade_tradeid
            WHERE
                mlm.var_mktlice_licenceno = :licenseNo
                AND mlm.num_mktlice_ulbid = :OrgId
            ORDER BY
                am.num_appli_id DESC
        `;

        const binds = {
            licenseNo: licenseNo,
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No market license details found for the provided license number and organization ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getMarketLicenseDetailsByLicenseNo:', error);
        res.status(500).json({
            error: 'Failed to retrieve market license details.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getMarketLicenseDetailsByLicenseNo:', err);
            }
        }
    }
};





const getApplicationDirectors = async (req, res) => {
    let connection;
    try {
        const { AppliId, OrgId } = req.body;

        // Basic validation for required fields
        if (!AppliId || !OrgId) {
            return res.status(400).json({
                error: 'Application ID (AppliId) and Organization ID (OrgId) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                addet.var_applidirector_name AS director_name
            FROM
                market.aomk_applidirector_det addet
            INNER JOIN
                market.aomk_applitype_mas atmas ON atmas.num_applitype_id = addet.num_applidirector_applitype
                                                 AND addet.num_applidirector_ulbid = atmas.num_applitype_ulbid
            WHERE
                addet.num_applidirector_appliid = :AppliId
                AND addet.num_applidirector_ulbid = :OrgId
        `;

        const binds = {
            AppliId: AppliId,
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No directors found for the provided application and organization ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getApplicationDirectors:', error);
        res.status(500).json({
            error: 'Failed to retrieve application directors.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getApplicationDirectors:', err);
            }
        }
    }
};



const getTradeNameDetails = async (req, res) => {
    let connection;
    try {
        const { AppId } = req.body;

        // Basic validation for the required field
        if (!AppId) {
            return res.status(400).json({
                error: 'Application ID (AppId) is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_tradename_id AS id,
                num_tradename_appid AS appid,
                num_tradename_ulbid AS ulbid,
                var_tradename_oldname AS old_name,
                num_tradename_aadhar AS aadhar,
                var_tradename_newname AS new_name,
                num_tradename_directorid AS director_id,
                var_tradename_newcoownname AS new_co_owner_name
            FROM
                aomk_applitradename_det
            WHERE
                num_tradename_appid = :AppId
        `;

        const binds = {
            AppId: AppId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No trade name details found for the provided application ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeNameDetails:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade name details.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeNameDetails:', err);
            }
        }
    }
};






// Directory to save the BLOB photos
const PHOTO_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_photos');

const getTradeNamePhotoDetails = async (req, res) => {
    let connection;
    try {
        console.log('Executing getTradeNamePhotoDetails with CORRECTED code.');
        const { AppId } = req.body;

        // Basic validation for the required field
        if (!AppId) {
            return res.status(400).json({
                error: 'Application ID (AppId) is required in the request body.'
            });
        }

        // Ensure the upload directory exists before writing files
        await fs.mkdir(PHOTO_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                atd.num_tradename_id AS id,
                atd.num_tradename_appid AS appid,
                atd.num_tradename_ulbid AS ulbid,
                atd.var_tradename_oldname AS old_name,
                atd.num_tradename_aadhar AS aadhar,
                atd.var_tradename_newname AS new_name,
                atd.num_tradename_directorid AS director_id,
                atd.var_tradename_newcoownname AS new_co_owner_name,
                atd.num_tradename_newaadhar AS new_aadhar,
                atd.var_tradename_newgender AS new_gender,
                atd.blob_tradename_photo AS photo_blob,
                atd.var_tradename_newaddress AS new_address,
                atd.var_tradename_newemail AS new_email,
                atd.num_tradename_newmobile AS new_mobile,
                atd.num_tradename_newapplitype AS new_applitype_id,
                atm.var_applitype_name AS new_applitype_name
            FROM
                aomk_applitradename_det atd
            INNER JOIN
                aomk_applitype_mas atm ON atm.num_applitype_id = atd.num_tradename_newapplitype
            WHERE
                atd.num_tradename_appid = :AppId
        `;

        const binds = {
            AppId: AppId
        };

        // Note: The driver will return the BLOB as an oracledb.Lob object by default,
        // which is handled correctly by your existing code using .getBuffer().
        const result = await connection.execute(sqlQuery, binds);
        
        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };

            // Handle the BLOB photo
            if (newRow.photo_blob instanceof oracledb.Lob) {
                const buffer = await newRow.photo_blob.getBuffer();
                if (buffer && buffer.length > 0) {
                    const filename = `tradename_photo_${uuidv4()}.jpg`;
                    const filepath = path.join(PHOTO_UPLOAD_DIR, filename);
                    await fs.writeFile(filepath, buffer);
                    newRow.photo_url = `/generated_photos/${filename}`;
                } else {
                    newRow.photo_url = null;
                }
            } else {
                newRow.photo_url = null;
            }
            delete newRow.photo_blob;

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                message: 'No trade name details found for the provided application ID.'
            });
        }

        res.json(processedRows);

    } catch (error) {
    // Corrected robust catch block to prevent the "circular structure" error
    console.error('API Error in getTradeNamePhotoDetails:', error);
    res.status(500).json({
        error: 'Failed to retrieve trade name details.',
        details: 'An internal server error occurred.'
    });
} finally {
    if (connection) {
        try {
            await connection.close();
        } catch (err) {
            console.error('Error closing connection in getTradeNamePhotoDetails:', err);
        }
    }
}};



const getTradeAddressDetails = async (req, res) => {
    let connection;
    try {
        const { AppId } = req.body;

        // Basic validation for the required field
        if (!AppId) {
            return res.status(400).json({
                error: 'Application ID (AppId) is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_tradeaddress_id AS id,
                num_tradeaddress_appid AS appid,
                num_tradeaddress_ulbid AS ulbid,
                var_tradeaddress_oldaddress AS old_address,
                var_tradeaddress_newaddress AS new_address,
                var_tradeaddress_insby AS inserted_by,
                date_tradeaddress_insdt AS inserted_date
            FROM
                aomk_applitradeaddress_det
            WHERE
                num_tradeaddress_appid = :AppId
        `;

        const binds = {
            AppId: AppId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No trade address details found for the provided application ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeAddressDetails:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade address details.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeAddressDetails:', err);
            }
        }
    }
};




const getTradeBusinessDetails = async (req, res) => {
    let connection;
    try {
        const { AppId, OrgId } = req.body;

        // Basic validation for required fields
        if (!AppId || !OrgId) {
            return res.status(400).json({
                error: 'Application ID (AppId) and Organization ID (OrgId) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                tbd.num_tradebusiness_appliid AS appliid,
                tbd.var_tradebusiness_busitype AS tradetype_id,
                rm.num_rate_tradetypename AS tradetype, 
                tcm.num_tradecategory_id AS tradecategory_id,
                tcm.var_tradecategory_name AS tradecategory,
                rm.num_rate_rate AS rate
            FROM
                aomk_tradebusiness_det tbd
            INNER JOIN
                aomk_tradeservice_mas tsm ON tsm.num_trade_id = tbd.num_tradebusiness_appliid
                                           AND tsm.num_trade_ulbid = tbd.num_tradebusiness_ulbid
            INNER JOIN
                market.aomk_rate_mas rm ON tbd.var_tradebusiness_busitype = rm.num_rate_id
            LEFT JOIN
                aomk_tradecategory_mas tcm ON tcm.num_tradecategory_id = tbd.var_tradebusiness_busicatagory
            WHERE
                tbd.num_tradebusiness_appliid = :AppId
                AND tbd.num_tradebusiness_ulbid = :OrgId
        `;

        const binds = {
            AppId: AppId,
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No trade business details found for the provided application and organization ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getTradeBusinessDetails:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade business details.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeBusinessDetails:', err);
            }
        }
    }
};




const getShopTypeByAppliId = async (req, res) => {
    let connection;
    try {
        const { AppliId, OrgId } = req.body;

        // Basic validation for required fields
        if (!AppliId || !OrgId) {
            return res.status(400).json({
                error: 'Application ID (AppliId) and Organization ID (OrgId) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                rm.num_rate_tradetypename AS shoptype
            FROM
                aomk_mktlice_mas mlm
            INNER JOIN
                aomk_appli_mas am ON am.num_appli_id = mlm.num_mktlice_appliid
            INNER JOIN
                aomk_applitradetyp_det attd ON attd.num_applitradetype_appliid = mlm.num_mktlice_appliid
            INNER JOIN
                aomk_rate_mas rm ON rm.num_rate_id = attd.num_applitradetype_trdtypid
            WHERE
                am.num_appli_id = :AppliId
                AND mlm.num_mktlice_ulbid = :OrgId
        `;

        const binds = {
            AppliId: AppliId,
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No shop types found for the provided application and organization ID.'
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getShopTypeByAppliId:', error);
        res.status(500).json({
            error: 'Failed to retrieve shop types.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getShopTypeByAppliId:', err);
            }
        }
    }
};



const getTradeAuthDate = async (req, res) => {
    let connection;
    try {
        const { AppId, OrgId, AppNo } = req.body;

        // Basic validation for required fields
        if (!AppId || !OrgId || !AppNo) {
            return res.status(400).json({
                error: 'Application ID (AppId), Organization ID (OrgId), and Application Number (AppNo) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                date_trade_authdt AS authorization_date
            FROM
                aomk_tradeservice_mas
            WHERE
                num_trade_appid = :AppId
                AND num_trade_ulbid = :OrgId
                AND var_trade_appno = :AppNo
        `;

        const binds = {
            AppId: AppId,
            OrgId: OrgId,
            AppNo: AppNo
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No authorization date found for the provided criteria.'
            });
        }

        // Assuming a single row is expected, return the first one
        res.json(result.rows[0]);

    } catch (error) {
        console.error('API Error in getTradeAuthDate:', error);
        res.status(500).json({
            error: 'Failed to retrieve trade authorization date.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeAuthDate:', err);
            }
        }
    }
};




const getOldDataHistory = async (req, res) => {
    let connection;
    try {
        const { Service, OrgId, AppId } = req.body;

        // Basic validation for required fields
        if (!Service || !OrgId || !AppId) {
            return res.status(400).json({
                error: 'Service Name (Service), Organization ID (OrgId), and Application ID (AppId) are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                MAX(CASE WHEN rn = 1 THEN TO_CHAR(insdate, 'DD-MM-YYYY') END) AS applied_on_1,
                MAX(CASE WHEN rn = 1 THEN oldval END) AS old_value_1,
                MAX(CASE WHEN rn = 1 THEN newval END) AS new_value_1,
                MAX(CASE WHEN rn = 2 THEN TO_CHAR(insdate, 'DD-MM-YYYY') END) AS applied_on_2,
                MAX(CASE WHEN rn = 2 THEN oldval END) AS old_value_2,
                MAX(CASE WHEN rn = 2 THEN newval END) AS new_value_2
            FROM (
                SELECT
                    ulbid,
                    appid,
                    service,
                    servicename,
                    insdate,
                    oldval,
                    newval,
                    ROW_NUMBER() OVER (ORDER BY insdate DESC) AS rn
                FROM
                    vw_olddata
                WHERE
                    service = :Service
                    AND ulbid = :OrgId
                    AND appid = :AppId
                    AND insdate IS NOT NULL
            )
            WHERE
                rn <= 2
            GROUP BY
                appid
            HAVING
                COUNT(*) > 0
        `;
        
        const binds = {
            Service: Service,
            OrgId: OrgId,
            AppId: AppId
        };

        const result = await connection.execute(sqlQuery, binds);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No old data history found for the provided criteria.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('API Error in getOldDataHistory:', error);
        res.status(500).json({
            error: 'Failed to retrieve old data history.',
            details: 'An internal server error occurred.'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getOldDataHistory:', err);
            }
        }
    }
};







const getTradeTypeDetails = async (req, res) => {
    let connection; // Declare connection variable to ensure it's accessible in finally block

    try {
        // Destructure parameters from the request body
        const { appliId, orgId } = req.body; 

        // Basic validation for the required fields
        if (!appliId || !orgId) {
            return res.status(400).json({
                error: 'Application ID (appliId) and Organization ID (orgId) are required in the request body.'
            });
        }

        // Get a database connection from the pool
        connection = await getConnection();

        // The SQL query to fetch trade type details
        const sqlQuery = `
            SELECT
                ad.num_applitradetype_id AS id,
                ad.num_applitradetype_appliid AS appliid,
                ad.num_applitradetype_trdtypid AS tradetype_id,
                NVL(num_applitrade_traderate, 0) AS rate,
                rm.num_rate_tradetypename AS tradetype_name,
                rm.num_rate_id AS tradetype_mas_id, -- Renamed to avoid confusion with tradetype_id from applitradetype_det
                '' AS tradecategory_id,
                '' AS tradecategory_name
            FROM
                aomk_applitradetyp_det ad
            INNER JOIN
                aomk_rate_mas rm ON rm.num_rate_id = ad.num_applitradetype_trdtypid
                                AND rm.num_rate_ulbid = ad.num_applitradetyp_ulbid
            LEFT JOIN -- Assuming num_applitrade_traderate comes from a different detail table
                aomk_applitrade_det atd ON atd.num_applitrade_appliid = ad.num_applitradetype_appliid
                                        AND atd.num_applitrade_ulbid = ad.num_applitradetyp_ulbid
                                        -- AND atd.num_applitrade_tradeid = ad.num_applitradetype_trdtypid -- Uncomment if needed
            WHERE
                ad.num_applitradetype_appliid = :appliId
                AND ad.num_applitradetyp_ulbid = :orgId
        `;

        // Bind variables for the query
        const binds = {
            appliId: appliId,
            orgId: orgId
        };

        // Execute the query
        const result = await connection.execute(sqlQuery, binds);

        // Check if any rows were returned
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No trade type details found for the provided application and organization ID.'
            });
        }

        // Send the query results as JSON response
        res.status(200).json(result.rows);

    } catch (error) {
        // Log the error for debugging purposes
        console.error('API Error in getTradeTypeDetails:', error);
        // Send an error response to the client
        res.status(500).json({
            error: 'Failed to retrieve trade type details.',
            details: error.message // Provide error message in development, or a generic message in production
        });
    } finally {
        // Ensure the database connection is always closed
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeTypeDetails:', err);
            }
        }
    }
};


const getTradeDirectorDetails = async (req, res) => {
    let connection; 

    try {
        const { appId } = req.body; 

        if (!appId) {
            return res.status(400).json({
                error: 'Application ID (appId) is required in the request body.'
            });
        }

        // Ensure the directory exists (idempotent, safe to call)
        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                tdd.num_tradedirector_id AS id,
                tdd.num_tradedirector_appliid AS appliid,
                tdd.var_tradedirector_name AS director_name,
                tdd.var_tradedirector_address AS director_address,
                tdd.num_tradedirector_mobileno AS mobile_no,
                tdd.var_tradedirector_emailid AS email_id,
                tdd.num_tradedirector_applitype AS appli_type_id,
                atm.var_applitype_name AS appli_type_name,
                tdd.num_tradedirector_aadhaarno AS aadhar_no,
                tdd.num_tradedirector_ulbid AS ulb_id,
                tdd.blo_applitype_photo AS photo_blob, 
                tdd.num_tradedirector_directorid AS director_id_pk,
                tdd.var_tradedirector_gender AS gender
            FROM
                aomk_tradedirector_det tdd
            INNER JOIN
                aomk_applitype_mas atm ON atm.num_applitype_id = tdd.num_tradedirector_applitype
            WHERE
                tdd.num_tradedirector_appliid = :appId
        `;

        const binds = {
            appId: appId
        };

        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT, 
            fetchInfo: {
                PHOTO_BLOB: { type: oracledb.BUFFER },
            },
        });
        
        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };

            let photoUrl = null;

            if (newRow.PHOTO_BLOB instanceof Buffer && newRow.PHOTO_BLOB.length > 0) {
                const filename = `director_photo_${uuidv4()}.jpg`;
                const filepath = path.join(FILE_UPLOAD_DIR, filename); // --- UPDATED TO FILE_UPLOAD_DIR ---
                try {
                    await fs.writeFile(filepath, newRow.PHOTO_BLOB);
                    console.log(`Successfully wrote photo to: ${filepath}`);
                    photoUrl = `/generated_files/${filename}`; // --- UPDATED URL PREFIX ---
                } catch (err) {
                    console.error(`Failed to write photo file ${filename} to ${filepath}:`, err);
                    photoUrl = null;
                }
            } else {
                console.log(`No photo BLOB found or BLOB is empty for row.`);
                photoUrl = null;
            }

            newRow.photo_url = photoUrl;
            delete newRow.PHOTO_BLOB; 

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                message: 'No trade director details found for the provided application ID.'
            });
        }

        res.status(200).json(processedRows);

    } catch (error) {
        console.error('API Error in getTradeDirectorDetails:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getTradeDirectorDetails:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching trade director details.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeDirectorDetails:', err);
            }
        }
    }
};






const getTradeNameDetailsWithPhoto = async (req, res) => {
    let connection;

    try {
        const { appId } = req.body; // Expecting appId in the request body

        // Input validation
        if (!appId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID (appId) is required in the request body.'
            });
        }

        // Ensure the directory exists (idempotent, safe to call)
        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                atd.num_tradename_id AS id,
                atd.num_tradename_appid AS app_id,
                atd.num_tradename_ulbid AS ulb_id,
                atd.var_tradename_oldname AS old_trade_name,
                atd.num_tradename_aadhar AS aadhar_no,
                atd.var_tradename_newname AS new_trade_name,
                atd.num_tradename_directorid AS director_id,
                atd.var_tradename_newcoownname AS new_co_owner_name,
                atd.num_tradename_newaadhar AS new_aadhar_no,
                atd.var_tradename_newgender AS new_gender,
                atd.blob_tradename_photo AS tradename_photo_blob, -- Alias the BLOB column
                atd.var_tradename_newaddress AS new_address,
                atd.var_tradename_newemail AS new_email,
                atd.num_tradename_newmobile AS new_mobile,
                atd.num_tradename_newapplitype AS new_appli_type_id,
                atm.var_applitype_name AS new_appli_type_name
            FROM
                aomk_applitradename_det atd
            INNER JOIN
                aomk_applitype_mas atm ON atm.num_applitype_id = atd.num_tradename_newapplitype
            WHERE
                atd.num_tradename_appid = :appId
        `;

        const binds = {
            appId: appId
        };

        // Execute the query, ensuring BLOBs are fetched as Buffers
        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT, // Fetch rows as objects
            fetchInfo: {
                TRADENAME_PHOTO_BLOB: { type: oracledb.BUFFER }, // Use the alias here
            },
        });

        // Process each row to handle the BLOB and create a downloadable URL
        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row }; // Create a copy of the row object
            let photoUrl = null;

            // Check if the photo BLOB exists and is a non-empty Buffer
            if (newRow.TRADENAME_PHOTO_BLOB instanceof Buffer && newRow.TRADENAME_PHOTO_BLOB.length > 0) {
                // Ensure unique filename, using .jpg extension (adjust if needed)
                const filename = `tradename_photo_${uuidv4()}.jpg`; 
                const filepath = path.join(FILE_UPLOAD_DIR, filename); // --- UPDATED TO FILE_UPLOAD_DIR ---
                try {
                    await fs.writeFile(filepath, newRow.TRADENAME_PHOTO_BLOB); // Write the buffer to a file
                    console.log(`Successfully wrote tradename photo to: ${filepath}`);
                    photoUrl = `/generated_files/${filename}`; // --- UPDATED URL PREFIX TO MATCH FILE_UPLOAD_DIR ---
                } catch (err) {
                    console.error(`Failed to write tradename photo file ${filename} to ${filepath}:`, err);
                    photoUrl = null; // Set URL to null if file write fails
                }
            } else {
                console.log(`No tradename photo BLOB found or BLOB is empty for row with ID: ${newRow.ID}`);
                photoUrl = null; // No BLOB or empty BLOB
            }

            newRow.photo_url = photoUrl;
            delete newRow.TRADENAME_PHOTO_BLOB; // Remove the raw BLOB data from the response

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No trade name details found for the provided application ID.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Trade name details fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getTradeNameDetailsWithPhoto:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getTradeNameDetailsWithPhoto:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching trade name details.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeNameDetailsWithPhoto:', err);
            }
        }
    }
};





const getServiceDocumentsWithImages = async (req, res) => { // Renamed from Images to Files for clarity if preferred
    let connection;

    try {
        const { appId } = req.body; // Expecting appId in the request body (YOUR_SESSION_APPLILIST_APPID_HERE)

        // Input validation
        if (!appId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID (appId) is required in the request body.'
            });
        }

        // Ensure the directory exists before attempting to write files
        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                sdd.num_servdocument_id AS docid,
                sdd.var_servdocument_ename AS docname,
                asd.var_applidoc_doctype AS doctype,
                asd.blo_applidoc_image AS file_blob -- Alias the BLOB column appropriately for PDF
            FROM
                aomk_appliservdoc_det asd
            INNER JOIN
                aomk_servdocument_det sdd ON sdd.num_servdocument_id = asd.num_applidoc_docid
            WHERE
                asd.num_applidoc_appliid = :appId
        `;

        const binds = {
            appId: appId
        };

        // Execute the query, ensuring BLOBs are fetched as Buffers
        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT, // Fetch rows as objects
            fetchInfo: {
                FILE_BLOB: { type: oracledb.BUFFER }, // Use the alias here
            },
        });

        // Process each row to handle the BLOB and create a downloadable URL
        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row }; // Create a copy of the row object
            let fileUrl = null; // Renamed for clarity (it's a file, not necessarily an image)

            // Check if the file BLOB exists and is a non-empty Buffer
            if (newRow.FILE_BLOB instanceof Buffer && newRow.FILE_BLOB.length > 0) {
                // --- CRUCIAL CHANGE: Use .pdf extension ---
                const filename = `servdoc_file_${uuidv4()}.pdf`; 
                const filepath = path.join(FILE_UPLOAD_DIR, filename);
                try {
                    await fs.writeFile(filepath, newRow.FILE_BLOB); // Write the buffer to a file
                    console.log(`Successfully wrote service document file to: ${filepath}`);
                    fileUrl = `/generated_files/${filename}`; // URL accessible from client
                } catch (err) {
                    console.error(`Failed to write service document file ${filename} to ${filepath}:`, err);
                    fileUrl = null; // Set URL to null if file write fails
                }
            } else {
                console.log(`No file BLOB found or BLOB is empty for doc ID: ${newRow.DOCID}`);
                fileUrl = null; // No BLOB or empty BLOB
            }

            newRow.file_url = fileUrl; // Add the URL to the response (renamed from image_url)
            delete newRow.FILE_BLOB; // Remove the raw BLOB data from the response

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No service documents found for the provided application ID.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service documents fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getServiceDocumentsWithImages:', error); // Keep function name for now, or rename
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getServiceDocumentsWithImages:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching service documents.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getServiceDocumentsWithImages:', err);
            }
        }
    }
};






function getFileExtension(fileType) {
    if (!fileType) return '.bin'; // Default if type is null or empty

    const typeLower = String(fileType).toLowerCase();
    switch (typeLower) {
        case 'pdf': return '.pdf';
        case 'jpeg':
        case 'jpg': return '.jpg';
        case 'png': return '.png';
        case 'gif': return '.gif';
        case 'bmp': return '.bmp';
        case 'tif':
        case 'tiff': return '.tif';
        case 'doc':
        case 'docx': return '.docx';
        case 'xls':
        case 'xlsx': return '.xlsx';
        case 'ppt':
        case 'pptx': return '.pptx';
        case 'txt': return '.txt';
        case 'zip': return '.zip';
        case 'xml': return '.xml';
        // Add more mappings as needed for your specific document types
        default:
            console.warn(`Unknown document type '${fileType}'. Defaulting to .bin extension.`);
            return '.bin'; // Fallback for unknown types
    }
}


const getApplicationDocuments = async (req, res) => {
    let connection;

    try {
        const { appId } = req.body;

        if (!appId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID (appId) is required in the request body.'
            });
        }

        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                addet.num_applidoc_id AS primaryDocId,
                addet.num_applidoc_appliid AS AppliId,
                addet.num_applidoc_docid AS docId,
                addet.var_applidoc_doctype AS FileType, -- This will be used directly for extension
                addet.blo_applidoc_image AS filebyte_blob,
                vdm.doctypename
            FROM
                aomk_applidoc_det addet
            INNER JOIN
                view_document_mas vdm ON vdm.docid = addet.num_applidoc_docid
            WHERE
                addet.num_applidoc_appliid = :appId
        `;

        const binds = {
            appId: appId
        };

        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
                FILEBYTE_BLOB: { type: oracledb.BUFFER },
            },
        });

        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };
            let fileUrl = null;

            // --- DIRECTLY DETERMINE EXTENSION FROM FILETYPE ---
            // If FileType is "PDF", it will be ".pdf"
            // If FileType is "JPG", it will be ".jpg"
            // If FileType is null/empty/undefined, it will be ".bin"
            const extension = newRow.FILETYPE ? `.${String(newRow.FILETYPE).toLowerCase()}` : '.bin'; 
            console.log("Determined extension:", extension); // Log for debugging
            // --- END DIRECT EXTENSION DETERMINATION ---


            if (newRow.FILEBYTE_BLOB instanceof Buffer && newRow.FILEBYTE_BLOB.length > 0) {
                const filename = `app_doc_${newRow.DOCID}_${uuidv4()}${extension}`; 
                const filepath = path.join(FILE_UPLOAD_DIR, filename);
                try {
                    await fs.writeFile(filepath, newRow.FILEBYTE_BLOB);
                    console.log(`Successfully wrote application document to: ${filepath}`);
                    fileUrl = `/generated_files/${filename}`;
                } catch (err) {
                    console.error(`Failed to write application document file ${filename} to ${filepath}:`, err);
                    fileUrl = null;
                }
            } else {
                console.log(`No file BLOB found or BLOB is empty for doc ID: ${newRow.primaryDocId}`);
                fileUrl = null;
            }

            newRow.file_url = fileUrl;
            delete newRow.FILEBYTE_BLOB;

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No application documents found for the provided application ID.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application documents fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getApplicationDocuments:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getApplicationDocuments:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching application documents.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getApplicationDocuments:', err);
            }
        }
    }
};





const getServiceDeliveryItemsWithFiles = async (req, res) => {
    let connection;

    try {
        const { itemsId } = req.body; // Expecting itemsId in the request body

        if (!itemsId) {
            return res.status(400).json({
                success: false,
                message: 'Item ID (itemsId) is required in the request body.'
            });
        }

        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                sditems.num_sditems_itemsid AS itemsid,
                sditem.var_sditems_name AS items_name,
                sditems.blob_sditems_siterpt AS siterpt_blob,
                sditems.blob_sditems_photo AS photo_blob
            FROM
                aomk_sditems_det sditems
            INNER JOIN
                aomk_sditems_mas sditem ON sditem.num_sditems_id = sditems.num_sditems_itemsid
            WHERE
                sditems.num_sditems_id = :itemsId
        `;

        const binds = {
            itemsId: itemsId
        };

        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
                SITERPT_BLOB: { type: oracledb.BUFFER },
                PHOTO_BLOB: { type: oracledb.BUFFER },
            },
        });

        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };
            let siterptUrl = null;
            let photoUrl = null;

            // --- Process SITERPT_BLOB (Now using .jpg as requested) ---
            if (newRow.SITERPT_BLOB instanceof Buffer && newRow.SITERPT_BLOB.length > 0) {
                // Assuming siterpt is also a JPG image
                const siterptFilename = `siterpt_${newRow.ITEMSID}_${uuidv4()}.jpg`; // <--- CHANGED TO .jpg
                const siterptFilepath = path.join(FILE_UPLOAD_DIR, siterptFilename);
                try {
                    await fs.writeFile(siterptFilepath, newRow.SITERPT_BLOB);
                    console.log(`Successfully wrote siterpt file to: ${siterptFilepath}`);
                    siterptUrl = `/generated_files/${siterptFilename}`;
                } catch (err) {
                    console.error(`Failed to write siterpt file ${siterptFilename} to ${siterptFilepath}:`, err);
                    siterptUrl = null;
                }
            } else {
                console.log(`No siterpt BLOB found or BLOB is empty for item ID: ${newRow.ITEMSID}`);
                siterptUrl = null;
            }

            // --- Process PHOTO_BLOB ---
            if (newRow.PHOTO_BLOB instanceof Buffer && newRow.PHOTO_BLOB.length > 0) {
                // Assuming photo is typically JPG. Adjust if you know it's PNG or another format.
                const photoFilename = `photo_${newRow.ITEMSID}_${uuidv4()}.jpg`; 
                const photoFilepath = path.join(FILE_UPLOAD_DIR, photoFilename);
                try {
                    await fs.writeFile(photoFilepath, newRow.PHOTO_BLOB);
                    console.log(`Successfully wrote photo file to: ${photoFilepath}`);
                    photoUrl = `/generated_files/${photoFilename}`;
                } catch (err) {
                    console.error(`Failed to write photo file ${photoFilename} to ${photoFilepath}:`, err);
                    photoUrl = null;
                }
            } else {
                console.log(`No photo BLOB found or BLOB is empty for item ID: ${newRow.ITEMSID}`);
                photoUrl = null;
            }

            newRow.siterpt_url = siterptUrl;
            newRow.photo_url = photoUrl;
            delete newRow.SITERPT_BLOB;
            delete newRow.PHOTO_BLOB;

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No service delivery items found for the provided Item ID.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service delivery items fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getServiceDeliveryItemsWithFiles:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getServiceDeliveryItemsWithFiles:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching service delivery items.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getServiceDeliveryItemsWithFiles:', err);
            }
        }
    }
};





const updateServiceDeliverySiterpt3 = async (req, res) => {
    let connection;

    try {
        // Multer puts file information in req.file
        const fileBuffer = req.file ? req.file.buffer : null;
        // Other fields from form-data are in req.body
        // --- itemsId is now hardcoded in the query, so it's removed from req.body destructuring ---
        const { appliId, ulbId } = req.body; 

        // Input validation
        // --- itemsId is removed from validation as it's hardcoded ---
        if (!appliId || !ulbId || !fileBuffer) {
            return res.status(400).json({
                success: false,
                message: 'All fields (appliId, ulbId) and a file (BlobDocFile) are required.'
            });
        }

        connection = await getConnection();

        // --- SQL Query: itemsId is now hardcoded as 3 ---
        const sqlQuery = `
            UPDATE
                aomk_sditems_det
            SET
                blob_sditems_siterpt = :blobDocFileBind
            WHERE
                num_sditems_appliid = :appliIdBind
                AND num_sditems_ulbid = :ulbIdBind
                AND num_sditems_itemsid = 3
        `;

        const binds = {
            blobDocFileBind: { val: fileBuffer, type: oracledb.BLOB, dir: oracledb.BIND_IN },
            appliIdBind: appliId,
            ulbIdBind: ulbId
            // --- itemsIdBind is removed from binds ---
        };

        const options = {
            autoCommit: false // We'll manually commit or rollback
        };

        const result = await connection.execute(sqlQuery, binds, options);

        if (result.rowsAffected && result.rowsAffected > 0) {
            await connection.commit(); // Commit the transaction if successful
            res.status(200).json({
                success: true,
                message: 'blob_sditems_siterpt updated successfully.',
                rowsAffected: result.rowsAffected
            });
        } else {
            await connection.rollback(); // Rollback if no rows were updated
            res.status(404).json({
                success: false,
                message: 'No matching record found for the provided appliId and ulbId with itemsId=3, or no update was necessary.',
                rowsAffected: 0
            });
        }

    } catch (error) {
        console.error('API Error in updateServiceDeliverySiterpt:', error);
        if (connection) {
            try {
                await connection.rollback(); // Rollback on error
            } catch (rollbackError) {
                console.error('Error during rollback in updateServiceDeliverySiterpt:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating siterpt.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in updateServiceDeliverySiterpt:', err);
            
            }
        }
    }
};





const updateServiceDeliveryPhoto4 = async (req, res) => {
    let connection;

    try {
        // Multer puts file information in req.file
        const fileBuffer = req.file ? req.file.buffer : null;
        // Other fields from form-data are in req.body
        const { appliId, ulbId } = req.body; 

        // Input validation
        if (!appliId || !ulbId || !fileBuffer) {
            return res.status(400).json({
                success: false,
                message: 'All fields (appliId, ulbId) and a file (BlobDocFile) are required.'
            });
        }

        connection = await getConnection();

        // SQL Query: itemsId is hardcoded as 4, and blob_sditems_photo is targeted
        const sqlQuery = `
            UPDATE
                aomk_sditems_det
            SET
                blob_sditems_photo = :blobDocFileBind
            WHERE
                num_sditems_appliid = :appliIdBind
                AND num_sditems_ulbid = :ulbIdBind
                AND num_sditems_itemsid = 4
        `;

        const binds = {
            blobDocFileBind: { val: fileBuffer, type: oracledb.BLOB, dir: oracledb.BIND_IN },
            appliIdBind: appliId,
            ulbIdBind: ulbId
        };

        const options = {
            autoCommit: false // We'll manually commit or rollback
        };

        const result = await connection.execute(sqlQuery, binds, options);

        if (result.rowsAffected && result.rowsAffected > 0) {
            await connection.commit(); // Commit the transaction if successful
            res.status(200).json({
                success: true,
                message: 'blob_sditems_photo updated successfully.',
                rowsAffected: result.rowsAffected
            });
        } else {
            await connection.rollback(); // Rollback if no rows were updated
            res.status(404).json({
                success: false,
                message: 'No matching record found for the provided appliId and ulbId with itemsId=4, or no update was necessary.',
                rowsAffected: 0
            });
        }

    } catch (error) {
        console.error('API Error in updateServiceDeliveryPhoto:', error);
        if (connection) {
            try {
                await connection.rollback(); // Rollback on error
            } catch (rollbackError) {
                console.error('Error during rollback in updateServiceDeliveryPhoto:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating photo.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in updateServiceDeliveryPhoto:', err);
            }
        }
    }
};



const updateServiceDeliveryPhoto5 = async (req, res) => {
    let connection;

    try {
        // Multer puts file information in req.file
        const fileBuffer = req.file ? req.file.buffer : null;
        // Other fields from form-data are in req.body
        const { appliId, ulbId } = req.body; 

        // Input validation
        if (!appliId || !ulbId || !fileBuffer) {
            return res.status(400).json({
                success: false,
                message: 'All fields (appliId, ulbId) and a file (BlobDocFile) are required.'
            });
        }

        connection = await getConnection();

        // SQL Query: itemsId is hardcoded as 5, and blob_sditems_photo is targeted
        const sqlQuery = `
            UPDATE
                aomk_sditems_det
            SET
                blob_sditems_photo = :blobDocFileBind
            WHERE
                num_sditems_appliid = :appliIdBind
                AND num_sditems_ulbid = :ulbIdBind
                AND num_sditems_itemsid = 5
        `;

        const binds = {
            blobDocFileBind: { val: fileBuffer, type: oracledb.BLOB, dir: oracledb.BIND_IN },
            appliIdBind: appliId,
            ulbIdBind: ulbId
        };

        const options = {
            autoCommit: false // We'll manually commit or rollback
        };

        const result = await connection.execute(sqlQuery, binds, options);

        if (result.rowsAffected && result.rowsAffected > 0) {
            await connection.commit(); // Commit the transaction if successful
            res.status(200).json({
                success: true,
                message: 'blob_sditems_photo for itemsId=5 updated successfully.',
                rowsAffected: result.rowsAffected
            });
        } else {
            await connection.rollback(); // Rollback if no rows were updated
            res.status(404).json({
                success: false,
                message: 'No matching record found for the provided appliId and ulbId with itemsId=5, or no update was necessary.',
                rowsAffected: 0
            });
        }

    } catch (error) {
        console.error('API Error in updateServiceDeliveryPhoto5:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in updateServiceDeliveryPhoto5:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating photo for itemsId=5.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in updateServiceDeliveryPhoto5:', err);
            }
        }
    }
};




const updateOnlineTrackingStatus = async (req, res) => {
    let connection;

    try {
        // Extract parameters from the request body
        const { applino, ulbId, certiInsBy } = req.body;

        // Input validation
        if (!applino || !ulbId || !certiInsBy) {
            return res.status(400).json({
                success: false,
                message: 'Application Number (applino), ULB ID (ulbId), and Certificate Issued By (certiInsBy) are required in the request body.'
            });
        }

        connection = await getConnection();

        // SQL Query with bind variables
        const sqlQuery = `
            UPDATE
                admins.aoma_onltrack_det
            SET
                var_onltrack_stepflag = 'AC',
                var_onltrack_certiflag = 'Y',
                var_onltrack_certidesc = 'Certificate Issued',
                var_onltrack_certiinsby = :certiInsByBind,
                date_onltrack_certiinsdt = SYSDATE
            WHERE
                var_onltrack_applino = :applinoBind
                AND num_onltrack_ulbid = :ulbIdBind
        `;

        const binds = {
            certiInsByBind: certiInsBy,
            applinoBind: applino,
            ulbIdBind: ulbId
        };

        const options = {
            autoCommit: false // We'll manually commit or rollback
        };

        const result = await connection.execute(sqlQuery, binds, options);

        if (result.rowsAffected && result.rowsAffected > 0) {
            await connection.commit(); // Commit the transaction if successful
            res.status(200).json({
                success: true,
                message: 'Online tracking status updated successfully.',
                rowsAffected: result.rowsAffected
            });
        } else {
            await connection.rollback(); // Rollback if no rows were updated
            res.status(404).json({
                success: false,
                message: 'No matching record found for the provided application number and ULB ID, or no update was necessary.'
            });
        }

    } catch (error) {
        console.error('API Error in updateOnlineTrackingStatus:', error);
        if (connection) {
            try {
                await connection.rollback(); // Rollback on error
            } catch (rollbackError) {
                console.error('Error during rollback in updateOnlineTrackingStatus:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating online tracking status.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in updateOnlineTrackingStatus:', err);
            }
        }
    }
};




module.exports = {
getWardConfigUserList ,
getTradeServiceAppStatus ,
getTradeServiceADVList ,
getTradeServiceTLCRBList ,
getTradeServiceList ,
getTradeServiceDetailsByAppNo ,
getSdItems ,
getSdItemsWithBlobs ,
getMarketLicenseDetailsByLicenseNoAndOrg ,
getApplicationDirectors ,
getTradeNameDetails ,
getTradeNamePhotoDetails ,
getTradeAddressDetails ,
getTradeBusinessDetails ,
getShopTypeByAppliId ,
getTradeAuthDate ,
getOldDataHistory ,
getTradeTypeDetails ,
getTradeDirectorDetails ,
getTradeNameDetailsWithPhoto ,
getServiceDocumentsWithImages ,
getApplicationDocuments ,
getServiceDeliveryItemsWithFiles ,
updateServiceDeliverySiterpt3 ,
updateServiceDeliveryPhoto4 ,
updateServiceDeliveryPhoto5 ,
updateOnlineTrackingStatus
}