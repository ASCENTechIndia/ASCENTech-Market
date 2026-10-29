const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database'); 

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const aomk_warduserconfig_ins = async (req, res) => {
    let connection;
    try {
        const {
            In_UserId,           
            In_UlbId,            
            In_User,             
            In_ward,            
            In_zoneconfigstr,    
            In_ipaddress,        
            In_source            
        } = req.body;


        connection = await getConnection();

        const sql = `
            BEGIN
                aomk_warduserconfig_ins(
                    In_UserId => :In_UserId,
                    In_UlbId => :In_UlbId,
                    In_User => :In_User,
                    In_ward => :In_ward,
                    In_zoneconfigstr => :In_zoneconfigstr,
                    In_ipaddress => :In_ipaddress,
                    In_source => :In_source,
                    Out_errorCode => :Out_errorCode,
                    Out_ErrorMsg => :Out_ErrorMsg
                );
            END;
        `;

        const binds = {
            In_UserId: In_UserId,
            In_UlbId: In_UlbId,
            In_User: In_User,
            In_ward: In_ward,
            In_zoneconfigstr: In_zoneconfigstr,
            In_ipaddress: In_ipaddress,
            In_source: In_source,
            Out_errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            Out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 255 }
        };


        const result = await connection.execute(sql, binds);


        const { Out_errorCode, Out_ErrorMsg } = result.outBinds;


        if (Out_errorCode === 9999) {
            res.status(200).json({
                errorCode: Out_errorCode,
                errorMsg: Out_ErrorMsg
            });
        } else {
            res.status(400).json({
                errorCode: Out_errorCode,
                errorMsg: Out_ErrorMsg
            });
        }

    } catch (error) {
        console.error('API Error in aomk_warduserconfig_ins:', error);
        res.status(500).json({
            errorCode: -1,
            errorMsg: 'Internal server error.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

module.exports = aomk_warduserconfig_ins