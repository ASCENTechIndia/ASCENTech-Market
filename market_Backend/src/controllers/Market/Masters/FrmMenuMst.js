const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const  FrmMenuMst = async (req, res) => {
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
                a.num_menumaster_menuid,
                a.num_menumaster_parentmenuid AS parentmenuid,
                a.var_menumaster_pagetitle AS pagetitle,
                a.var_menumaster_pagetype AS PageType,
                a.var_menumaster_pagepath AS pagepath,
                S.num_corporation_id,
                S.var_corporation_name,
                S.var_corporation_address
            FROM
                admins.aoma_menumaster_def a
            LEFT OUTER JOIN admins.aoma_menucorporation_def C
                ON a.num_menumaster_menuid = C.num_menusociety_menuid
            LEFT OUTER JOIN admins.aoma_corporation_mas S
                ON S.num_corporation_id = C.num_menusociety_ulbid
            WHERE
                a.num_menumaster_menuid = :menu_id_param
            ORDER BY
                a.var_menumaster_pagetitle ASC -- Added an order by for consistent results
        `;

        const result = await connection.execute(
            sqlQuery,
            { menu_id_param: menu_id }, // Pass menu_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        res.status(200).json({
            message: `Menu details for menu ID '${menu_id}' fetched successfully`,
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getMenuDetailsById:', err);
        res.status(500).json({ error: 'Failed to fetch menu details', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getMenuDetailsById:', err);
            }
        }
    }
};

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

module.exports = {FrmMenuMst, FrmMenuList}