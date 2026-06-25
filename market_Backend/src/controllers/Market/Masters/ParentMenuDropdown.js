const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const ParentMenuDropdown = async (req, res) => {
    let connection;
    try {
        const { dept_id } = req.body; 

        // Validate dept_id
        if (!dept_id) {
            return res.status(400).json({ error: 'dept_id is required in the request body.' });
        }
        connection = await getConnection();

        const sqlQuery = `
            SELECT
                var_menumaster_pagetitle AS pagetitle,
                num_menumaster_menuid AS menuid
            FROM
                admins.aoma_menumaster_def
            WHERE
                var_menumaster_pagepath IS NULL
                AND num_menumaster_deptid = :dept_id_param -- Use bind variable
                AND num_menumaster_parentmenuid = 0
            ORDER BY
                var_menumaster_pagetitle ASC
        `;

        const result = await connection.execute(
            sqlQuery,
            { dept_id_param: dept_id }, // NEW: Pass dept_id from request body
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getParentMenuItems:', err);
        res.status(500).json({ error: 'Failed to fetch parent menu items', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getParentMenuItems:', err);
            }
        }
    }
};

module.exports = ParentMenuDropdown