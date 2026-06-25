// controllers/menuDesignationController.js
const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const MenuDesignationId = async (req, res) => {
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
                num_desigantion_id 
            FROM
                admins.aoms_desigantion_mas
            INNER JOIN
                admins.aoma_menucorporation_def ON num_desigantion_ulbid = num_menusociety_ulbid
            WHERE
                num_menusociety_menuid = :menu_id_param
            
        `;
        const result = await connection.execute(
            sqlQuery,
            { menu_id_param: menu_id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // This is crucial for object output
        );
        res.status(200).json({
            data: result.rows
        });

    } catch (err) {
        console.error('Error in MenuDesignationId:', err);
        res.status(500).json({ error: 'Failed to fetch designation IDs for menu', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in MenuDesignationId:', err);
            }
        }
    }
};

module.exports = MenuDesignationId;