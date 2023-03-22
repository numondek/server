const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
const router = express.Router();


router.route("/rating").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblImprovement.*, 
      ROUND((ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0))/8,1) AS Average, 
      (ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0)) AS Total, 
      (5*8) AS Possible, 
      ROUND(100*(ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0))/(5*8),0) AS Percentage 
    FROM tblImprovement 
    WHERE tblImprovement.SourceID = 1 
    ORDER BY tblImprovement.RaisedDate DESC, tblImprovement.ImprovementID 
    OFFSET 0 ROWS FETCH NEXT 1000 ROWS ONLY;
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



  router.route("/external").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT qrySubbieSupplier.*
      FROM qrySubbieSupplier
      ORDER BY qrySubbieSupplier.CompanyName;`, function(err, record) {
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



  router.route("/rating1").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblImprovement.*, ROUND((ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0))/6,1) AS Average, (ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)) AS Total, (6*5) AS Possible, ROUND(100*(ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0))/(6*5),0) AS Percentage
      FROM tblImprovement
      WHERE (((tblImprovement.SourceID)=2))
      ORDER BY tblImprovement.RaisedDate DESC, tblImprovement.ImprovementID;
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




  router.route("/vetting").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblInsurance_Details.ID, tblInsurance_Details.InsuranceCoID, tblInsurance_Details.Description, tblInsurance_Details.StartDate, tblInsurance_Details.EndDate, tblInsurance_Details.InsuranceTypeID, tblInsurance_Details.SCID, tblInsurance_Details.Value, tblInsurance_Details.Active, tblInsurance_Details.Excess, tblInsurance_Details.Notes, tblInsurance_Details.BusinessDescription, tblInsurance_Details.IndemnityToPrinciple, tblInsurance_Details.Height, tblInsurance_Details.Depth, tblInsurance_Details.Heat, tblInsurance_Details.PilingGuarantee, tblInsurance_Details.Sent, tblInsurance_Details.SentBy, tblInsurance_Details.SentDate, tblInsurance_Details.Received, tblInsurance_Details.ReceivedBy, tblInsurance_Details.ReceivedDate, tblInsurance_Details.Approved, tblInsurance_Details.ApprovedBy, tblInsurance_Details.ApprovedDate, tblInsurance_Details.Timestamp, tblInsurance_Details.DocPath
      FROM dbo.tblInsurance_Details
      ORDER BY tblInsurance_Details.Active DESC , tblInsurance_Details.InsuranceTypeID;`, function(err, record) {
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