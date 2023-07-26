const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");



router.route("/enquiryfilter").post(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT FirstName+' '+Surname AS EngineerName, tblEmployees.EmployeeID, CASE WHEN Dormant = 0 THEN 'N' ELSE 'Y' END AS Old, tblEmployees.Dormant FROM tblEmployees INNER JOIN tblEnquiries ON tblEmployees.EmployeeID =  ${req.body['section']} ORDER BY tblEmployees.Dormant DESC , FirstName+' '+Surname;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquiryType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnquiryTypes.EnquiryType, tblEnquiryTypes.EnquiryTypeID
      FROM tblEnquiryTypes;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/enquiryClient").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT qryCompanyChoice.CompanyID, qryCompanyChoice.CompanyName, qryCompanyChoice.Office, qryCompanyChoice.Address, qryCompanyChoice.Dormant, qryCompanyChoice.Caution, qryCompanyChoice.Type FROM qryCompanyChoice INNER JOIN tblEnquiryTenders ON qryCompanyChoice.CompanyID = tblEnquiryTenders.CompanyID WHERE qryCompanyChoice.TypeID = 1 ORDER BY qryCompanyChoice.CompanyName;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquiryClientG").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCompanyGroups.GroupName, tblCompanyGroups.GroupID
      FROM tblCompanyGroups
      ORDER BY tblCompanyGroups.GroupName;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/pwt").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT PileType, PileTypeID FROM tblPileTypes WHERE [Old] = 0 ORDER BY PileType;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/manageBy").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT CONCAT(FirstName, ' ', Surname) AS EngineerName, tblEmployees.EmployeeID, CASE WHEN Dormant = 0 THEN 'N' ELSE 'Y' END AS Old, tblEmployees.Dormant FROM tblEmployees INNER JOIN qryOpportunitiesFull ON tblEmployees.EmployeeID = qryOpportunitiesFull.OppManagerID ORDER BY tblEmployees.Dormant DESC, CONCAT(FirstName, ' ', Surname);`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquiryQuality").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnquiryQuality.Quality, tblEnquiryQuality.Description
      FROM tblEnquiryQuality;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquiryPriorities").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnquiryPriorities.Priority, tblEnquiryPriorities.Description
      FROM tblEnquiryPriorities;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquirySource").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblEnquirySource.Source, tblEnquirySource.SourceID FROM tblEnquirySource WHERE COALESCE([Old], 0) = 0`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/FPSC").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblFPSConstruction.FPSConstruction, tblFPSConstruction.FPSConstructionID FROM tblFPSConstruction WHERE ([Old] IS NULL OR [Old] = 0);`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/FPST").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblFPSType.FPSType, tblFPSType.FPSTypeID
      FROM tblFPSType
      WHERE ([Old] IS NULL OR [Old] = 0);`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/FPSPT").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblFPSPileType.FPSPileType, tblFPSPileType.Notes, tblFPSPileType.FPSPileTypeID
      FROM tblFPSPileType
      WHERE ([Old] IS NULL OR [Old] = 0);`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/industrySector").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblM_Industry.Industry, tblM_Industry.IndustryID
      FROM tblM_Industry;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/financeType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblM_Finance.Finance, tblM_Finance.FinanceID
      FROM tblM_Finance;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/workRegion").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblM_Region.Region, tblM_Region.RegionID
      FROM tblM_Region;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/marketST").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblM_Market.Market, tblM_Market.MarketID
      FROM tblM_Market;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/interactionType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblHistoryType.HistoryType, tblHistoryType.TypeID
      FROM tblHistoryType;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/attendee").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT FirstName + ' ' + Surname AS EngineerName, EmployeeID
      FROM tblEmployees
      WHERE FirstName + ' ' + Surname IS NOT NULL AND OfficeYN = 1
      ORDER BY Dormant DESC, EngineerName;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});





router.route("/oppStatus").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblOpportunityStatus.OppStatus, tblOpportunityStatus.OppStatusID
      FROM tblOpportunityStatus;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/chaseby").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT FirstName + ' ' + Surname AS EngineerName, EmployeeID
      FROM tblEmployees
      
      ORDER BY EngineerName;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});
router.route("/sector").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblSector.Sector, tblSector.SectorID
      FROM tblSector;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/plotType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPlotType.PlotType, tblPlotType.PlotTypeID
      FROM tblPlotType;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/rigTypes").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qryRigTypes.Type, qryRigTypes.RigType, qryRigTypes.NoOfRigs
      FROM qryRigTypes
      WHERE qryRigTypes.Obsolete = 0
      ORDER BY qryRigTypes.Type;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/acceptedBy").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT FirstName + ' ' + Surname AS EngineerName, tblEmployees.WinLogin
      FROM tblEmployees
      WHERE OfficeYN = 1 AND (FirstName + ' ' + Surname) IS NOT NULL
      ORDER BY tblEmployees.Dormant DESC, EngineerName;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/foreman").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT FirstName + ' ' + Surname AS ForemanName, tblEmployees.EmployeeID, tblEmployees.Dormant
      FROM tblEmployees
      WHERE OfficeYN = 1 AND (FirstName + ' ' + Surname) IS NOT NULL
      ORDER BY tblEmployees.Dormant DESC, ForemanName;`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/tblPileCategories").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPileCategories.PileCategory, tblPileCategories.PileCategoryID
      FROM tblPileCategories
      ORDER BY tblPileCategories.ListOrder, tblPileCategories.PileCategory;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/enquiriesSearch").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qryEnquiriesMainTender.EnquiryNo, ISNULL(Address, '') + 
      CASE WHEN Town IS NULL THEN '' ELSE ', ' + Town END AS JobAddress,
      qryEnquiriesMainTender.EnquiryID,
      CASE WHEN ISNULL(Won, 0) = -1 THEN 'Contract'
           WHEN ISNULL(Lost, 0) = -1 THEN 'Lost'
           ELSE 'Enquiry' + ' - ' + ISNULL(TenderTypeShort, '')
      END AS Status,
            qryEnquiriesMainTender.DivisionID
      FROM qryEnquiriesMainTender
      WHERE qryEnquiriesMainTender.EnquiryNo <> ''
      ORDER BY qryEnquiriesMainTender.EnquiryID DESC;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/vatCode").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblVATTable.VATCode, tblVATTable.VATRate, tblVATTable.VATNotes
      FROM tblVATTable
      ORDER BY tblVATTable.VATCode;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresMetrixQT1highoutputID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_HighOutput.HighOutput, tblEnqM_HighOutput.HighOutputID
      FROM tblEnqM_HighOutput;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});




router.route("/projectANenquiresMetrixQTHighOutputRotaryID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(` SELECT tblEnqM_HighOutputRotary.HighOutputRotary, tblEnqM_HighOutputRotary.HighOutputRotaryID
      FROM tblEnqM_HighOutputRotary;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


//

router.route("/projectANenquiresMetrixQTClientRelationshipID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_ClientRelationship.ClientRelationship, tblEnqM_ClientRelationship.ClientRelationshipID
      FROM tblEnqM_ClientRelationship;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});





router.route("/projectANenquiresMetrixQTProjectAdvantageID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_ProjectAdvantage.ProjectAdvantage, tblEnqM_ProjectAdvantage.ProjectAdvantageID
      FROM tblEnqM_ProjectAdvantage;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresMetrixQTSiteConditionsID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_SiteConditions.SiteConditions, tblEnqM_SiteConditions.SiteConditionsID
      FROM tblEnqM_SiteConditions;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/projectANenquiresMetrixQTPileDiameterID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_PileDiameter.PileDiameter, tblEnqM_PileDiameter.PileDiameterID
      FROM tblEnqM_PileDiameter;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresMetrixQTCasingRequirementID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(` SELECT tblEnqM_CasingRequirement.CasingRequirement, tblEnqM_CasingRequirement.CasingRequirementID
      FROM tblEnqM_CasingRequirement;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

router.route("/projectANenquiresMetrixQTReinfRequirementID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_ReinfRequirement.ReinfRequirement, tblEnqM_ReinfRequirement.ReinfRequirementID
      FROM tblEnqM_ReinfRequirement;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresMetrixQTRedesignPossID").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnqM_RedesignPoss.RedesignPoss, tblEnqM_RedesignPoss.RedesignPossID
      FROM tblEnqM_RedesignPoss;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});




//////////////// Metrix Screen Model post

router.route("/projectANenquiresMetrixModel").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
      FROM qryEnqMetric
      WHERE qryEnqMetric.EnquiryID = ${EnquiryID}
      ;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});

//////////EAD E questions

router.route("/projectANenquiresQuestions").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
      FROM qryEnqMetric
      WHERE qryEnqMetric.EnquiryID = ${EnquiryID}
      ;
      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});




//  ////    EAD History Section

router.route("/projectANenquiresHistoryCompanies").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(` SELECT CompanyName+IIf(OfficeName Is Not Null,' - '+OfficeName,IIf(Town Is Null,'',' - '+Town)) AS CompanyTown, tblCompanies.CompanyID
FROM tblCompanies
WHERE (((tblCompanies.CompanyID) In (SELECT CompanyID FROM tblEnquiryTenders WHERE EnquiryID >0)))
ORDER BY CompanyName+IIf(OfficeName Is Not Null,' - '+OfficeName,IIf(Town Is Null,'',' - '+Town));

      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


//
router.route("/projectANenquiresHistoryContract").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`
      
      SELECT qryContacts.ContactFullName, qryContacts.ContactID
      FROM qryContacts
      WHERE qryContacts.ContactFullName <> ''
      ORDER BY qryContacts.ContactFullName;


      `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresHistoryType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`
SELECT tblHistoryType.HistoryType, tblHistoryType.TypeID
FROM tblHistoryType;    
  `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});


router.route("/projectANenquiresHistoryAttendance").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`
    SELECT FirstName + ' ' + Surname AS EngineerName, EmployeeID
FROM tblEmployees
WHERE (FirstName + ' ' + Surname IS NOT NULL) AND (OfficeYN = 1)
ORDER BY Dormant DESC, FirstName + ' ' + Surname;
      
  `)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});



module.exports = router;