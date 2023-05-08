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
      WHERE OfficeYN = 1
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


module.exports = router;