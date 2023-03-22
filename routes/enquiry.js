const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");



router.route("/detail").post( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      console.log(req.body['EnquiryNo']);
    
      con.query(`INSERT INTO tblEnquiries (EnquiryNo, EnqName, Address, Town, County, PostCode, EstimatorID, ManagerID, EnquiryTypeID)
      VALUES ('${req.body['EnquiryNo']}', 'John Smith', '123 Main Street', 'London', 'Greater London', 'SW1A 1AA', 123, 456, 789);
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


  router.route("/division").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT Division, DivisionID
      FROM tblDivisions
      WHERE ISNULL([Old],0) = 0;
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

  router.route("/stockType").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT tblStockType.StockType, tblStockType.StockTypeID
      FROM tblStockType;
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
  

  
  
  router.route("/SCategories").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT tblStockCategories.StockCat, tblStockCategories.StockCatID, tblStockCategories.Notes
      FROM tblStockCategories
      ORDER BY tblStockCategories.StockCat;
      ;
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
  
  

  router.route("/supplier").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT DISTINCT tblCompanies.CompanyName + ' - ' + COALESCE(tblCompanies.OfficeName, '') AS Supplier, tblCompanies.CompanyID, tblCompanies.Dormant FROM tblCompanies INNER JOIN tblStockOrder ON CAST(tblCompanies.CompanyID AS INT) = tblStockOrder.SupplierID WHERE tblCompanies.TypeID = 4 ORDER BY tblCompanies.Dormant DESC , tblCompanies.CompanyName + ' - ' + COALESCE(tblCompanies.OfficeName, '');
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



  router.route("/contract").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT tblEnquiries.ContractNo, ISNULL(tblEnquiries.EnqName, tblEnquiries.Address) AS Address, tblEnquiries.EnquiryID, tblContractStatus.ContStatus, IIF(tblEnquiries.ContractStatus = 2, 1, 0) AS Status, DivisionID FROM tblEnquiries LEFT OUTER JOIN tblContractStatus ON tblEnquiries.ContractStatus = tblContractStatus.StatusID WHERE tblEnquiries.Won = 1 AND LEFT(tblEnquiries.ContractNo,1) <> 'C' AND tblEnquiries.Saved = 1 AND tblEnquiries.Deleted = 0 UNION SELECT 'OFFICE', 'Office Staff', -1, '', 1, 0 FROM tblEnquiries ORDER BY Status DESC, tblEnquiries.ContractNo;`, function(err, record) {
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


  router.route("/requseted").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT FirstName + ' ' + COALESCE(Surname, '') AS Name, tblEmployees.EmployeeID, CASE WHEN COALESCE([OfficeYN],0)=-1 THEN 'Office' WHEN COALESCE([ForemanYN],0)=-1 THEN 'Foreman' ELSE '' END AS Role, tblEmployees.Dormant AS Old FROM tblEmployees WHERE (COALESCE([OfficeYN],0)=-1 AND Surname IS NOT NULL) OR (Surname IS NOT NULL AND COALESCE([ForemanYN],0)=-1) ORDER BY tblEmployees.Dormant DESC, CASE WHEN COALESCE([OfficeYN],0)=-1 THEN 'Office' WHEN COALESCE([ForemanYN],0)=-1 THEN 'Foreman' ELSE '' END, tblEmployees.FirstName;`, function(err, record) {
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

  router.route("/aStatus").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT tblExternalStatus.ExternalStatus, tblExternalStatus.ExternalStatusID
      FROM tblExternalStatus;
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

  router.route("/docType").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      
    
      con.query(`SELECT tblInsuranceTypes.InsuranceType, tblInsuranceTypes.InsuranceDescription, tblInsuranceTypes.InsuranceTypeID
      FROM tblInsuranceTypes
      ORDER BY tblInsuranceTypes.Insurance DESC , tblInsuranceTypes.InsuranceType;      
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



module.exports = router;