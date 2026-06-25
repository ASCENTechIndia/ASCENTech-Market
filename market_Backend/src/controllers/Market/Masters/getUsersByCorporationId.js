const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 
const getUsersByCorporationId = async (req, res) => {
    let connection;
    try {
        const { corp_id } = req.body; 

      
        if (!corp_id) {
            return res.status(400).json({ error: 'corp_id is required in the request body.' });
        }
        if (isNaN(corp_id)) {
            return res.status(400).json({ error: 'Invalid corp_id provided. Must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_corporation_id AS corpid,
                num_user_userid AS userid,
                var_user_username AS username,
                num_user_usertypeid AS usertypeid,
                var_desigantion_engname AS userlevel,
                num_user_desgid AS levelid,
                dat_user_validfrom AS validfrom,
                dat_user_validupto AS validupto
            FROM
                admins.aoma_user_def um
            INNER JOIN
                admins.aoma_corporation_mas br ON br.num_corporation_id = um.num_user_ulbid
            INNER JOIN
                admins.aoms_desigantion_mas ut ON ut.num_desigantion_id = um.num_user_desgid
            WHERE
                um.num_user_ulbid = :corp_id_param
                AND (um.dat_user_validupto IS NULL OR um.dat_user_validupto >= TRUNC(SYSDATE))
        `;

        const result = await connection.execute(
            sqlQuery,
            { corp_id_param: corp_id }, // Pass corp_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );


        res.status(200).json({
            message: `User data for Corporation ID '${corp_id}' fetched successfully`,
            data: result.rows // Return the raw array of objects
        });

    } catch (err) {
        console.error('Error in getUsersByCorporationId:', err);
        res.status(500).json({ error: 'Failed to fetch user data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getUsersByCorporationId:', err);
            }
        }
    }
};

module.exports =  getUsersByCorporationId