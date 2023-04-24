const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");



router.route("/cogroup").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblCompanyGroups ORDER BY tblCompanyGroups.GroupName;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });


  router.route("/campaigns").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblMailshots WHERE ISNULL([Cancel], 0) = 0 ORDER BY tblMailshots.MailshotCreated DESC;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });



  router.route("/credit").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT qryCreditInsuranceConsol.CompanyID, 
      qryCreditInsuranceConsol.CreditInsurance, 
      qryCreditInsuranceConsol.CreditInsuranceBy, 
      qryCreditInsuranceConsol.CreditInsuranceDate, 
      qryCreditInsuranceConsol.CreditInsuranceValReq, 
      qryCreditInsuranceConsol.CreditInsuranceVal, 
      qryCreditInsuranceConsol.CreditInsuranceStartDate, 
      qryCreditInsuranceConsol.CreditInsuranceNotes, 
      qryCreditInsuranceConsol.CreditInsuranceCLN_No, 
      qryCreditInsuranceConsol.CreditInsuranceCode, 
      qryCreditInsuranceConsol.InsType, 
      tblCompanies.CompanyName, 
      tblCompanies.OfficeName, 
      tblCompanyGroups.GroupName, 
      tblCompanies.Dormant, 
      qryCreditInsuranceConsol.GroupID
FROM qryCreditInsuranceConsol 
INNER JOIN tblCompanies ON qryCreditInsuranceConsol.CompanyID = tblCompanies.CompanyID 
LEFT JOIN tblCompanyGroups ON tblCompanies.GroupID = tblCompanyGroups.GroupID
WHERE (qryCreditInsuranceConsol.CreditInsurance=1) AND (tblCompanies.Dormant=0);
`, function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });




  router.route("/allcontact").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM qryContactSearch ORDER BY qryContactSearch.Surname, qryContactSearch.FirstName;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });


  router.route("/all").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT c.*, i.LastInteraction FROM dbo.qryCompanies AS c LEFT JOIN dbo.qryCompanyInteractionLast AS i ON c.CompanyID = i.CompanyID WHERE c.CompanyName IS NOT NULL ORDER BY c.CompanyName;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });


  router.route("/history").post(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM qryHistoryCampaign WHERE qryHistoryCampaign.CompanyID = ${req.body['CompanyID']}
      ORDER BY qryHistoryCampaign.EventDate  DESC;
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

  router.route("/enquiry").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM qryTendersCompany
      ORDER BY qryTendersCompany.DateReceived DESC;
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

  router.route("/contract").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM qryContactSearch
      ORDER BY qryContactSearch.Surname, qryContactSearch.FirstName;
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

  router.route("/companyCat").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblCompaniesCategories
      ORDER BY tblCompaniesCategories.CategoryID;
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

  router.route("/companyCampaign").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblCompaniesMailshots
      ORDER BY tblCompaniesMailshots.MailshotID;
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
  

  router.route("/editCompanyCampaign").post(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`UPDATE qryCreditInsuranceConsol SET CreditInsurance = 1, CreditInsuranceBy = NULL, CreditInsuranceDate = NULL, CreditInsuranceValReq = NULL, CreditInsuranceVal = NULL, CreditInsuranceStartDate = NULL, CreditInsuranceNotes = NULL, CreditInsuranceCLN_No = NULL, CreditInsuranceCode = NULL, InsType = '${req.body['insType']}', CompanyName = '${req.body['companyName']}', OfficeName = '${req.body['officeName']}', GroupName = '${req.body['groupName']}', Dormant = 0, GroupID = '${req.body['groupID']}' FROM tblCompanies INNER JOIN tblCompanyGroups ON tblCompanies.GroupID = tblCompanyGroups.GroupID WHERE qryCreditInsuranceConsol.GroupID = '${req.body['groupID']}';`)
      res.status(200).json({
        data: result.recordsets[0]
      });
      if(res.status(200)){
        console.log("hhhh");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: false
      });
    }
  });


  router.route("/subCoGroup").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblCompanies
      ORDER BY tblCompanies.Dormant, tblCompanies.CompanyName;
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



  router.route("/campaignCompanies").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT qryContacts.ContactFullName AS ContactName, qryCompanyChoice.CompanyOffice AS Company, qryContacts.JobTitle, qryContacts.EmailShort, qryContacts.Mobile, qryContacts.Gone, qryContacts.ContactID, tblContactsMailshots.* FROM qryContacts INNER JOIN qryCompanyChoice ON qryContacts.CompanyID = qryCompanyChoice.CompanyID LEFT JOIN tblContactsMailshots ON tblContactsMailshots.ContactID = qryContacts.ContactID WHERE qryContacts.[ContactFullName] <> '' AND EXISTS (SELECT CompanyID FROM tblCompaniesMailshots WHERE MailshotID = [MailshotID] AND tblCompaniesMailshots.CompanyID = qryContacts.CompanyID) AND tblContactsMailshots.Omit = 0 ORDER BY tblContactsMailshots.Omit DESC, qryContacts.ContactFullName;
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

  router.route("/campaignCompanies1").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT 
      tblCompanies.CompanyName + 
      IIF(tblCompanies.OfficeName IS NOT NULL, ' - ' + tblCompanies.OfficeName, IIF(tblCompanies.Town IS NULL, '', ' - ' + tblCompanies.Town)) AS CompanyOffice, 
      tblCompanies.Telephone, 
      tblCompanies.Website, 
      tblCompanies.Email, 
      tblCompanies.CompanyID AS ID, 
      IIF(ISNULL(tblCompanies.Caution, 0) = 1, 'Y', '') AS UseCaution, 
      tblCompanies.Dormant,
      tblContactsMailshots.*,
      qryContacts.ContactFullName -- Add the missing column to the SELECT statement
    FROM 
      tblCompanies
      INNER JOIN tblContactsMailshots ON tblCompanies.CompanyID = tblContactsMailshots.CompanyID
      LEFT JOIN qryContacts ON tblContactsMailshots.ContactID = qryContacts.ContactID 
    WHERE 
      tblCompanies.CompanyName IS NOT NULL AND 
      tblCompanies.TypeID = 1 AND
      tblContactsMailshots.Omit = 0 
    ORDER BY 
      tblCompanies.Dormant DESC, 
      tblCompanies.CompanyName + 
      IIF(tblCompanies.OfficeName IS NOT NULL, ' - ' + tblCompanies.OfficeName, IIF(tblCompanies.Town IS NULL, '', ' - ' + tblCompanies.Town)),
      qryContacts.ContactFullName;  
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

  router.route("/campaignInteraction").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblEnquiries.EstimatorID, tblHistory.* FROM tblHistory LEFT JOIN tblEnquiries ON tblHistory.EnquiryID = tblEnquiries.EnquiryID ORDER BY tblHistory.InteractionDate DESC, tblHistory.EventDate DESC
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