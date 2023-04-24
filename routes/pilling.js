const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
const router = express.Router();



// router.route("/pillog").get( async(req, res) => {
//   sql.connect(db, function(err){
//       if(err){
//           console.log(err);
//       }
//     var con = new sql.Request();
  
//     con.query('SELECT TOP 1000 * FROM qryPileLogList ORDER BY qryPileLogList.LogDate DESC , qryPileLogList.RigNo;', function(err, record) {
//       if (err) {
//           console.log(err);
//           res.status(500).json({ status: false });
//       } else {
//           // console.log(record.recordsets[0]);
//           var data = record.recordsets[0];
//           // console.log('data[0]');
//           res.status(200).json({data});
//       }
      
//     })  
//   });
   
// });

router.route("/pillog").post(async (req, res) => {

  let contract;
  let driller;
  let rig;
  let month;
  let month0;
  let approve;
  let notExport;
  let testType;
  let faultChechlist;
  let extOperative;
  let signature;
  let maintChecklist;
  const  pageNumber = req.body['page'];
  const  pageSize  = req.body['size']; 


  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
      res.status(500).json({ status: false });
    } else {
      const filterMap = {
        contract: "EnquiryID",
        driller: "DrillerID",
        rig: "RigNo",
        approve: "Approved",
        testType: "EnquiryID",
        faultChechlist: "ChecklistSaved",
        extOperative: "TSSaved",
        signature: "SignedDate",
        maintChecklist: "ChecklistSaved2"
      };
      
      for (const [key, value] of Object.entries(filterMap)) {
        if (eval(key)) {
          filters.push(`${value} = '${eval(key)}'`);
        }
      }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')} ` : '';
    console.log(whereClause);
      
      const con = new sql.Request();
      con.query(
        `SELECT COUNT(*) as totalRows FROM qryPileLogList;
         SELECT * FROM qryPileLogList ORDER BY qryPileLogList.LogDate DESC, qryPileLogList.RigNo 
         OFFSET ${(pageNumber - 1) * pageSize} ROWS 
         FETCH NEXT ${pageSize} ROWS ONLY;`,
        function (err, record) {
          if (err) {
            console.log(err);
            res.status(500).json({ status: false });
          } else {
            const totalRows = record.recordsets[0][0].totalRows;
            const data = record.recordsets[1];
            const totalPages = Math.ceil(totalRows / pageSize);
            res.status(200).json({ data, totalPages });
          }
        }
      );
    }
  });
});




router.route("/cubetest").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM qryCubeTestList ORDER BY qryCubeTestList.DateMade DESC;', function(err, record) {
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



  
// router.route("/pillog").get( async(req, res) => {
//   sql.connect(db, function(err){
//       if(err){
//           console.log(err);
//       }
//     var con = new sql.Request();
  
//     con.query('SELECT tblEnquiries.DivisionID, tblPileLogImages.*, tblPileLogs.EnquiryID, tblPileLogs.LogDate, tblPileLogs.RigNo, tblPileLogs.AgitatorNo, tblPileLogs.RigTypeID, tblPileLogs.Notes, tblPileLogs.NotesSite, tblPileLogs.DrillerID FROM tblPileLogImages LEFT JOIN tblPileLogs ON tblPileLogImages.PileLogID = tblPileLogs.PileLogID LEFT JOIN tblEnquiries ON tblPileLogs.EnquiryID = tblEnquiries.EnquiryID WHERE tblPileLogImages.PileLogID IS NOT NULL;', function(err, record) {
//       if (err) {
//           console.log(err);
//           res.status(500).json({ status: false });
//       } else {
//           // console.log(record.recordsets[0]);
//           var data = record.recordsets[0];
//           console.log('data[0]');
//           res.status(200).json({data});
//       }
      
//     })  
//   });
   
// });



router.route("/integirtedtest").get( async(req, res) => {
  sql.connect(db, function(err){
      if(err){
          console.log(err);
      }
    var con = new sql.Request();
  
    con.query('SELECT * FROM tblPileIntegrityTests ORDER BY tblPileIntegrityTests.ReportDate DESC;', function(err, record) {
      if (err) {
          console.log(err);
          res.status(500).json({ status: false });
      } else {
          // console.log(record.recordsets[0]);
          var data = record.recordsets[0];
        
          res.status(200).json({data});
      }
      
    })  
  });
   
});



router.route("/timesheets").get( async(req, res) => {
  sql.connect(db, function(err){
      if(err){
          console.log(err);
      }
    var con = new sql.Request();
  
    con.query(`SELECT DATEDIFF(n, qryWorkingTimeEntry.TimeIn, DATEADD(hh, IIF(qryWorkingTimeEntry.NightShift=-1, 24, 0), qryWorkingTimeEntry.TimeOut)) AS WorkMinutes, 
    CASE WHEN ISNULL(WorkMinutes, '') <> '' THEN CAST(FLOOR(WorkMinutes/60) AS VARCHAR(10)) ELSE '' END AS WorkHr, 
    CASE WHEN ISNULL(WorkMinutes, '') <> '' THEN WorkMinutes-(FLOOR(WorkMinutes/60)*60) ELSE '' END AS WorkMin, 
    WorkMinutes + COALESCE(qryWorkingTimeEntry.TravelTime, 0) AS TotMinutes, 
    CASE WHEN ISNULL(TotMinutes, '') <> '' THEN CAST(FLOOR(TotMinutes/60) AS VARCHAR(10)) ELSE '' END AS TotHr, 
    CASE WHEN ISNULL(TotMinutes, '') <> '' THEN TotMinutes-(FLOOR(TotMinutes/60)*60) ELSE '' END AS TotMin, 
    FORMAT(WorkHr, '00') + ':' + FORMAT(WorkMin, '00') AS WorkHours, 
    FORMAT(TotHr, '00') + ':' + FORMAT(TotMin, '00') AS TotHours, 
    * FROM qryWorkingTimeEntry WHERE TSSaved = 1`, function(err, record) {
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



router.route("/rig").get( async(req, res) => {
  sql.connect(db, function(err){
      if(err){
          console.log(err);
      }
    var con = new sql.Request();
  
    con.query(`SELECT tblPileRigs.RigID, tblPileRigs.RigNo, tblPileRigs.RigManufacturer, tblPileRigs.RigType, tblPileRigs.SerialNo, tblPileRigs.RigNotes, tblPileRigs.OwnedBy, tblPileRigs.Obsolete, tblPileRigs.ObsoleteDate, tblPileRigs.DailyRate, tblPileRigs.CertDue12Month, tblPileRigs.DrillerID, tblPileRigs.RigTypeID, tblPileRigs.HireRig, tblPileRigs.ServiceIntHours, tblPileRigs.Agitator, IIF(ISNULL(qryPileRigCertLatest.Status, 'Expired!') = 'Expired!', 'Expired!', qryPileRigCertLatest.Status) AS CertStatus, qryPileRigServiceLatest.ServiceStatus, tblPileRigs.Nominal, tblPileRigs.ClassID, tblPileRigs.FolderPath
    FROM tblPileRigs 
    LEFT JOIN qryPileRigCertLatest ON tblPileRigs.RigNo = qryPileRigCertLatest.RigNo 
    LEFT JOIN qryPileRigServiceLatest ON tblPileRigs.RigNo = qryPileRigServiceLatest.RigNo
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



router.route("/weekM").get( async(req, res) => {
  sql.connect(db, function(err){
      if(err){
          console.log(err);
      }
    var con = new sql.Request();
  
    con.query('SELECT tblWeek.WeekComm, tblWeek.TSClosed, tblWeek.TSClosedBy, tblWeek.TSClosedDate, date_calendar.calendar_year, date_calendar.month_name FROM tblWeek INNER JOIN date_calendar ON tblWeek.WeekComm = date_calendar.calendar_date;', function(err, record) {
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