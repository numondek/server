const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");




router.route("/editplant").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM qryRigDefectsList ORDER BY qryRigDefectsList.DefectDate DESC;', function(err, record) {
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



  router.route("/plannedM").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM qryEnquiriesForemen WHERE qryEnquiriesForemen.EnquiryID = -10 ORDER BY qryEnquiriesForemen.Complete, qryEnquiriesForemen.StartDate DESC;', function(err, record) {
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


  router.route("/checklist").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT qryRigChecklists.*, qryChecklistsWithFaults.ID AS FaultID
      FROM qryRigChecklists LEFT JOIN qryChecklistsWithFaults ON (qryRigChecklists.CheckTypeID = qryChecklistsWithFaults.CheckTypeID) AND (qryRigChecklists.ID = qryChecklistsWithFaults.ID)
      ORDER BY qryRigChecklists.LogDate DESC , qryRigChecklists.RigNo;`, function(err, record) {
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

  



  router.route("/pilling").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblPileRigs.RigID, tblPileRigs.RigNo, tblPileRigs.RigManufacturer, tblPileRigs.RigType, tblPileRigs.SerialNo, tblPileRigs.RigNotes, tblPileRigs.OwnedBy, tblPileRigs.Obsolete, tblPileRigs.ObsoleteDate, tblPileRigs.DailyRate, tblPileRigs.CertDue12Month, tblPileRigs.DrillerID, tblPileRigs.RigTypeID, tblPileRigs.HireRig, tblPileRigs.ServiceIntHours, tblPileRigs.Agitator, 
      CASE 
        WHEN qryPileRigCertLatest.Status IS NULL THEN 'Expired!' 
        ELSE CAST(qryPileRigCertLatest.Status AS varchar(50)) 
      END AS CertStatus, 
      qryPileRigServiceLatest.ServiceStatus, tblPileRigs.Nominal, tblPileRigs.ClassID, tblPileRigs.FolderPath
    FROM qryPileRigCertLatest 
    RIGHT JOIN tblPileRigs 
    ON qryPileRigCertLatest.RigNo = tblPileRigs.RigNo 
    LEFT JOIN qryPileRigServiceLatest 
    ON qryPileRigServiceLatest.RigNo = tblPileRigs.RigNo
    ORDER BY tblPileRigs.Obsolete DESC, tblPileRigs.HireRig DESC, tblPileRigs.RigNo;
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



  router.route("/service").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblPileRigs.RigNo, 
      ISNULL(tblPileRigs.RigManufacturer,'') + ' ' + ISNULL(tblPileRigs.RigType,'') + ' - ' + ISNULL(tblPileRigs.SerialNo,'') AS RigDescription, 
      qryPileRigServiceLatest.RigChecklistID, 
      qryPileRigServiceLatest.ServiceHours, 
      qryPileRigServiceLatest.Latestdate, 
      qryPileRigServiceLatest.HoursWorked, 
      qryPileRigServiceLatest.ServiceIntHours, 
      qryPileRigServiceLatest.HoursElapsed, 
      qryPileRigServiceLatest.HoursRemaining, 
      qryPileRigServiceLatest.ServiceStatus, 
      tblPileRigs.Obsolete, 
      tblPileRigs.HireRig, 
      tblPileRigs.ClassID, 
      tblPileRigs.RigTypeID
      FROM tblPileRigs LEFT JOIN qryPileRigServiceLatest ON qryPileRigServiceLatest.RigNo = tblPileRigs.RigNo
      ORDER BY tblPileRigs.Obsolete, tblPileRigs.RigNo;
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