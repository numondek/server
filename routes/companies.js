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








module.exports = router;