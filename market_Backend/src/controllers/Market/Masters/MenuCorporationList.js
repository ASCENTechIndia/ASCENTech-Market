const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const MenuCorporationList = async (req, res) => {
    let connection;
    try {
        const { menu_id } = req.body; 

       
        if (!menu_id) {
            return res.status(400).json({ error: 'menu_id is required in the request body.' });
        }
        if (isNaN(menu_id)) {
            return res.status(400).json({ error: 'Invalid menu_id provided. Must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_menusociety_ulbid AS ulbid
            FROM
                admins.aoma_menucorporation_def
            WHERE
                num_menusociety_menuid = :menu_id_param
        `;

        const result = await connection.execute(
            sqlQuery,
            { menu_id_param: menu_id }, // Pass menu_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        res.status(200).json({

            data: result.rows
        });

    } catch (err) {
        console.error('Error in getMenuCorporationUlbid:', err);
        res.status(500).json({ error: 'Failed to fetch ULB IDs for menu', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getMenuCorporationUlbid:', err);
            }
        }
    }
};

module.exports = MenuCorporationList