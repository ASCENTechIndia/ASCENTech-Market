const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database");

const FrmMenuList = async (req, res) => {
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
                a.var_menumaster_pagetitle AS pagetitle,
                c.var_menumaster_pagetitle AS parent,
                CASE
                    WHEN a.var_menumaster_pagetype = 'M' THEN 'Master'
                    WHEN a.var_menumaster_pagetype = 'T' THEN 'Transaction'
                END AS pagetype,
                a.var_menumaster_pagepath AS webpagepath,
                a.num_menumaster_menuid AS menuid,
                a.num_menumaster_parentmenuid AS parentmenuid
            FROM admins.aoma_menumaster_def a
            LEFT OUTER JOIN admins.aoma_menumaster_def c
                ON c.num_menumaster_menuid = a.num_menumaster_parentmenuid
            WHERE a.num_menumaster_deptid = :dept_id_param
              AND a.num_menumaster_parentmenuid <> 0
            ORDER BY c.var_menumaster_pagetitle
        `;

        const result = await connection.execute(
            sqlQuery,
            { dept_id_param: dept_id }, // Pass dept_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        res.status(200).json({
            message: `Menu data for Department ID '${dept_id}' fetched successfully`,
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getMenuDataByDeptId:', err);
        res.status(500).json({ error: 'Failed to fetch menu data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getMenuDataByDeptId:', err);
            }
        }
    }
};

module.exports = FrmMenuList ;