const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");




router.route("/coststructure").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT tblCostGroup.* FROM tblCostGroup ORDER BY tblCostGroup.LineOrder, tblCostGroup.CostGroupID;', function(err, record) {
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


  router.route("/workingT").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT 
      tblWorkingTime.*, 
      DATEDIFF(n, tblWorkingTime.TimeIn, DATEADD(hour, IIF(tblWorkingTime.NightShift=-1, 24, 0), tblWorkingTime.TimeOut)) AS WorkMinutes, 
      IIF(ISNULL(WorkMinutes, 0)=0, CONVERT(INT, FLOOR(WorkMinutes/60.0)), '') AS WorkHr, 
      WorkMinutes-CONVERT(INT, FLOOR(WorkMinutes/60.0))*60 AS WorkMin, 
      WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0) AS TotMinutes, 
      IIF(ISNULL(WorkMinutes, 0)=0, CONVERT(INT, FLOOR((WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))/60.0)), '') AS TotHr, 
      (WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))-CONVERT(INT, FLOOR((WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))/60.0))*60 AS TotMin, 
      FORMAT(WorkHr, '00') + ':' + FORMAT(WorkMin, '00') AS WorkHours, 
      FORMAT(IIF(ISNULL(WorkMinutes, 0)=0, CONVERT(INT, FLOOR((WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))/60.0)), ''), '00') 
          + ':' 
          + FORMAT((WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))-CONVERT(INT, FLOOR((WorkMinutes+ISNULL(tblWorkingTime.TravelTime, 0))/60.0))*60, '00') AS TotHours, 
      IIF(WorkMinutes<12*60, 'N', 'Y') AS ShiftNotOK, 
      qryWorkingTimeBreaks.BreakLength, 
      qryWorkingTimeBreaks.BreakHours, 
      tblEmployees.FirstName
  FROM 
      (tblWorkingTime LEFT JOIN qryWorkingTimeBreaks ON tblWorkingTime.ID = qryWorkingTimeBreaks.ID) 
      LEFT JOIN tblEmployees ON tblWorkingTime.EmployeeID = tblEmployees.EmployeeID
  WHERE 
      ((tblWorkingTime.WorkDate < '2021-01-01') AND (ISNULL(tblWorkingTime.TSSaved, 0) = 0)) 
      OR 
      ((tblWorkingTime.WorkDate >= '2021-01-01') AND (ISNULL(tblWorkingTime.TSSaved, 0) = -1) AND (ISNULL(tblWorkingTime.Deleted, 0) = 0))
  ORDER BY 
      tblWorkingTime.WorkDate, 
      tblEmployees.FirstName;
  
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



  router.route("/startup").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblEnquiries.DivisionID, tblStartup.*
      FROM tblStartup INNER JOIN tblEnquiries ON tblStartup.EnquiryID = tblEnquiries.EnquiryID
      WHERE ((COALESCE([Cancel],0))=0) AND ((tblStartup.EnquiryID)>0) AND ((tblStartup.[VariationID]) Is Null)
      ORDER BY tblStartup.StartupDate;
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


  router.route("/margin").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblEnquiries.ManagerID, tblContractMargins.*, RIGHT(tblContractMargins.AddedBy, LEN(tblContractMargins.AddedBy) - CHARINDEX('\', tblContractMargins.AddedBy)) AS AddedBy2
      FROM tblContractMargins INNER JOIN tblEnquiries ON tblContractMargins.EnquiryID = tblEnquiries.EnquiryID
      WHERE tblContractMargins.Deleted = 0
      ORDER BY tblContractMargins.MarginDate DESC, tblContractMargins.EnquiryID;
      
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


  router.route("/jobcosting").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblEnquiries.ManagerID, tblContractMargins.*, RIGHT(tblContractMargins.AddedBy, LEN(tblContractMargins.AddedBy) - CHARINDEX('\', tblContractMargins.AddedBy)) AS AddedBy2
      FROM tblContractMargins INNER JOIN tblEnquiries ON tblContractMargins.EnquiryID = tblEnquiries.EnquiryID
      WHERE tblContractMargins.Deleted = 0 AND tblContractMargins.JobCosting = 1
      ORDER BY tblContractMargins.MarginDate DESC, tblContractMargins.EnquiryID;
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


  
  router.route("/ausc").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM qryEnquiryASUC;', function(err, record) {
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


  router.route("/desgin").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT tblDesignTime.* FROM tblDesignTime', function(err, record) {
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


  router.route("/charge").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblContraCharge;', function(err, record) {
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



  router.route("/variation").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblVariations.*, tblEnquiries.EnquiryNo, tblEnquiries.Address, tblEnquiries.Town, tblEnquiries.County, tblEnquiries.PostCode, tblVariations.Quantity*tblVariations.Rate AS ValueTotal, tblValSchedDet.ValSchedID, tblValSchedDet.TBC
      FROM tblVariations INNER JOIN tblEnquiries ON tblVariations.EnquiryID = tblEnquiries.EnquiryID LEFT JOIN (SELECT * FROM tblValSchedDet WHERE DeleteYN=0) AS tblValSchedDet ON tblVariations.VariationID = tblValSchedDet.VariationID
      ORDER BY tblVariations.VarDate;
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


    router.route("/variationtemp").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT * FROM tblValSchedTypes ORDER BY tblValSchedTypes.ValSchedTypeID DESC;`, function(err, record) {
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



  router.route("/startuptemp").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT * FROM tblStartupTypes ORDER BY tblStartupTypes.Old, tblStartupTypes.StartupTypeID DESC;`, function(err, record) {
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


  router.route("/reserves").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT * FROM qryValSchedConsolReserves ORDER BY qryValSchedConsolReserves.EnquiryNo, qryValSchedConsolReserves.LineOrderID;`, function(err, record) {
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



  router.route("/retention").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT * FROM qryValRetentionOS; `, function(err, record) {
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


  
  router.route("/app").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT qryValuationList.EnquiryNo, qryValuationList.Address, qryValuationList.Client, qryValuationList.ValID, qryValuationList.ValSchedID, qryValuationList.ForecastDate, qryValuationList.ForecastTotal, qryValuationList.ForecastExpected, qryValuationList.ForecastAgreed, qryValuationList.CommentsForecast, qryValuationList.ValDate, qryValuationList.ValToDate, qryValuationList.ValNo, qryValuationList.ValRetention, qryValuationList.ValDiscount, qryValuationList.ValDiscountVar, qryValuationList.ValuationTotal, qryValuationList.ValuationTotalPrev, qryValuationList.ValuationUplift, qryValuationList.Comments, qryValuationList.ValReserve, qryValuationList.ValReservePrev, qryValuationList.ReserveUplift, qryValuationList.CommentsReserve, qryValuationList.Reported, qryValuationList.ReportedPrev, qryValuationList.ReportedUplift, qryValuationList.AmtCertified, qryValuationList.AmtCertifiedVar, qryValuationList.AmtCertifiedTot, qryValuationList.AmtCertifiedPrev, qryValuationList.AmtCertifiedVarPrev, qryValuationList.AmtCertifiedTotPrev, qryValuationList.AmtCertifiedUplift, qryValuationList.AmtCertifiedVarUplift, qryValuationList.AmtCertifiedTotUplift, qryValuationList.DateCertExp, qryValuationList.DateCertified, qryValuationList.CertDocPath, qryValuationList.CommentsCert, qryValuationList.InvNo, qryValuationList.DueDate, qryValuationList.FinalAcctYN, qryValuationList.ValVATCode, qryValuationList.Live, qryValuationList.Lock, qryValuationList.CommentsInv, qryValuationList.InvDate, qryValuationList.PayLessYN, qryValuationList.PayLessDate, qryValuationList.PayLessValue, qryValuationList.PayLessDeduction, qryValuationList.CommentsPayLess, qryValuationList.PayLessDocPath, qryValuationList.ValNotCertifed, qryValuationList.CertDays, qryValuationList.ValuationFrequency, qryValuationList.ValSchedType, qryValuationList.PaymentTerms, qryValuationList.DivisionID, qryValuationList.ContractPrefix, qryValuationList.AccountsCode, qryValuationList.VATCodeEvo, qryValuationList.InvoiceUplift, qryValuationList.VATValue, qryValuationList.WkComm, qryValuationList.EnquiryID, qryValuationList.ValOverMeasure, qryValuationList.ValUnderMeasure, qryValuationList.ValAdjustmentTot, qryValuationList.ValAdjustment, qryValuationList.PayLessValueTot, qryValuationList.ContractStatus, qryValuationList.PaidDate, qryValuationList.PaidTotal, qryValuationList.CommentsPaid, qryValuationList.ValUnpaid FROM qryValuationList;`, function(err, record) {
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
     
  })






module.exports = router;