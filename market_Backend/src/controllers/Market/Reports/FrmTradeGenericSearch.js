const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeGenericSearch = async (req, res) => {
  let connection;
  let result;

  try {
    const {
      OrgId,
      ShopName,
      AadharNo,
      PanNo,
      MobileNo,
      Email,
      Address,
      ZoneId,
      WardId,
      ShopActNo,
      FoodLicNo,
      IsProd,
      OwnSpace,
      DirectorName,
      DirectorMob,
      DirectorEmail,
      LicenseNo,
    } = req.body;

    // --- Mandatory Parameter Validation ---
    if (!OrgId) {
      console.error("Validation Error: Missing required parameter: OrgId.");
      return res.status(400).json({ success: false, message: "OrgId is mandatory." });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for OrgId: ${OrgId}. Expected a number.` });
    }

    connection = await getConnection();

    const baseSqlQuery = `
      SELECT DISTINCT
        mld.num_mktlice_id AS mktLice_id,
        mld.num_mktlice_appliid AS Appl_id,
        mld.var_mktlice_shopname AS Shop_Name,
        mld.var_mktlice_panno AS Pan_no,
        mld.num_mktlice_contactno AS Mob_no,
        mld.var_mktlice_email AS Email,
        mld.var_mktlice_address AS Mkt_address,
        mld.num_mktlice_zoneid AS zone_id,
        mld.num_mktlice_wardid AS ward_id,
        mld.var_mktlice_shopactno AS shop_actno,
        mld.var_mktlice_foodlicno AS food_licno,
        mld.var_mktlice_isprod AS isProd,
        mld.var_mktlice_ownspace AS ownSpace,
        adt.var_applidirector_name AS director_name,
        adt.var_applidirector_emailid AS director_email,
        adt.num_applidirector_mobileno AS director_mob,
        znm.zonename AS zone_name,
        znm.wardname AS ward_name,
        adt.num_applidirector_aadhaarno AS adhar_no,
        mld.var_mktlice_licenceno AS licenceno
      FROM
        aomk_mktlice_mas mld
      INNER JOIN
        aomk_applidirector_det adt ON mld.num_mktlice_appliid = adt.num_applidirector_appliid
      INNER JOIN
        prop.vw_zonemas znm ON znm.zoneid = mld.num_mktlice_zoneid AND znm.wardid = mld.num_mktlice_wardid
      WHERE
        1 = 1 -- Placeholder for dynamic WHERE clauses
        AND mld.num_mktlice_ulbid = :OrgId
    `;

    let whereConditions = [];
    const binds = { OrgId: { val: parsedOrgId, type: oracledb.NUMBER } };

    if (ShopName) {
      whereConditions.push("mld.var_mktlice_shopname = :ShopName");
      binds.ShopName = { val: String(ShopName).trim(), type: oracledb.STRING };
    }
    if (AadharNo) {
      whereConditions.push("adt.num_applidirector_aadhaarno = :AadharNo");
      binds.AadharNo = { val: String(AadharNo).trim(), type: oracledb.STRING };
    }
    if (PanNo) {
      whereConditions.push("mld.var_mktlice_panno = :PanNo");
      binds.PanNo = { val: String(PanNo).trim(), type: oracledb.STRING };
    }
    if (MobileNo) {
      whereConditions.push("mld.num_mktlice_contactno = :MobileNo");
      binds.MobileNo = { val: String(MobileNo).trim(), type: oracledb.STRING };
    }
    if (Email) {
      whereConditions.push("mld.var_mktlice_email = :Email");
      binds.Email = { val: String(Email).trim(), type: oracledb.STRING };
    }
    if (Address) {
      whereConditions.push("mld.var_mktlice_address = :Address");
      binds.Address = { val: String(Address).trim(), type: oracledb.STRING };
    }
    if (ZoneId) {
      const parsedZoneId = parseInt(ZoneId, 10);
      if (!isNaN(parsedZoneId)) {
        whereConditions.push("mld.num_mktlice_zoneid = :ZoneId");
        binds.ZoneId = { val: parsedZoneId, type: oracledb.NUMBER };
      } else {
        console.warn(`Invalid ZoneId parameter ignored: ${ZoneId}`);
      }
    }
    if (WardId) {
      const parsedWardId = parseInt(WardId, 10);
      if (!isNaN(parsedWardId)) {
        whereConditions.push("mld.num_mktlice_wardid = :WardId");
        binds.WardId = { val: parsedWardId, type: oracledb.NUMBER };
      } else {
        console.warn(`Invalid WardId parameter ignored: ${WardId}`);
      }
    }
    if (ShopActNo) {
      whereConditions.push("mld.var_mktlice_shopactno = :ShopActNo");
      binds.ShopActNo = { val: String(ShopActNo).trim(), type: oracledb.STRING };
    }
    if (FoodLicNo) {
      whereConditions.push("mld.var_mktlice_foodlicno = :FoodLicNo");
      binds.FoodLicNo = { val: String(FoodLicNo).trim(), type: oracledb.STRING };
    }
    if (IsProd) {
      // Assuming IsProd is 'Y' or 'N' and should be trimmed to match DB
      const trimmedIsProd = String(IsProd).trim().toUpperCase();
      if (trimmedIsProd === 'Y' || trimmedIsProd === 'N') {
        whereConditions.push("mld.var_mktlice_isprod = :IsProd");
        binds.IsProd = { val: trimmedIsProd, type: oracledb.STRING };
      } else {
        console.warn(`Invalid IsProd parameter ignored: ${IsProd}. Expected 'Y' or 'N'.`);
      }
    }
    if (OwnSpace) {
      // Assuming OwnSpace is 'Y' or 'N' and should be trimmed to match DB
      const trimmedOwnSpace = String(OwnSpace).trim().toUpperCase();
      if (trimmedOwnSpace === 'Y' || trimmedOwnSpace === 'N') {
        whereConditions.push("mld.var_mktlice_ownspace = :OwnSpace");
        binds.OwnSpace = { val: trimmedOwnSpace, type: oracledb.STRING };
      } else {
        console.warn(`Invalid OwnSpace parameter ignored: ${OwnSpace}. Expected 'Y' or 'N'.`);
      }
    }
    if (DirectorName) {
      whereConditions.push("adt.var_applidirector_name = :DirectorName");
      binds.DirectorName = { val: String(DirectorName).trim(), type: oracledb.STRING };
    }
    if (DirectorMob) {
      whereConditions.push("adt.num_applidirector_mobileno = :DirectorMob");
      binds.DirectorMob = { val: String(DirectorMob).trim(), type: oracledb.STRING };
    }
    if (DirectorEmail) {
      whereConditions.push("adt.var_applidirector_emailid = :DirectorEmail");
      binds.DirectorEmail = { val: String(DirectorEmail).trim(), type: oracledb.STRING };
    }
    if (LicenseNo) {
      whereConditions.push("mld.var_mktlice_licenceno = :LicenseNo");
      binds.LicenseNo = { val: String(LicenseNo).trim(), type: oracledb.STRING };
    }

    // Combine base query with dynamic WHERE conditions
    let finalSqlQuery = baseSqlQuery;
    if (whereConditions.length > 0) {
      finalSqlQuery += " AND " + whereConditions.join(" AND ");
    }
    // Add ORDER BY clause
    finalSqlQuery += " ORDER BY mld.num_mktlice_id DESC"; // Order by a primary key for consistent results

    result = await connection.execute(finalSqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log("No comprehensive market license details found for the provided criteria.");
      return res.status(404).json({
        success: false,
        message: "No comprehensive market license details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching comprehensive market license details:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching comprehensive market license details.",
        error: clientError,
      });
    }
  } 
};

module.exports = FrmTradeGenericSearch;