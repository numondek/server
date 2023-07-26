const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
const router = express.Router();




router.route("/pillog").post(async (req, res) => {

  let contract = req.body['contract'];
  let driller = req.body['driller'];
  let rig = req.body['rig'];
  let month = req.body['month'];
  let month0 = req.body['month0'];
  let approve  = req.body['approve'];
  let notExport  = req.body['notExport'];
  let testType  = req.body['testType'];
  let faultChechlist  = req.body['faultChechlist'];
  let extOperative  = req.body['extOperative'];
  let signature  = req.body['signature'];
  let maintChecklist  = req.body['maintChecklist'];
  const  pageNumber = req.body['page'];
  const  pageSize  = req.body['size']; 


  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
      res.status(500).json({ status: false });
    } else {
      const filters = [];

      const filterMap = [
        [contract, "EnquiryID"],
        [driller, "DrillerID"],
        [rig, "RigNo"],
        [approve, "Approved"],
        [testType, "EnquiryID"],
        [faultChechlist, "ChecklistSaved"],
        [extOperative, "TSSaved"],
        [signature, "SignedDate"],
        [maintChecklist, "ChecklistSaved2"]
      ];
      
      for (const [value, filterMaps] of filterMap) {
        if (value || value != null) {
          filters.push(`qryPileLogList.${filterMaps} = ${typeof(value) === 'boolean' || 'String' ? `'${value}'` : value}`);
        }
      }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')} ` : '';
    console.log(whereClause);
      
      const con = new sql.Request();
      con.query(
        `SELECT COUNT(*) as totalRows FROM qryPileLogList ${whereClause};
         SELECT * FROM qryPileLogList ${whereClause} ORDER BY qryPileLogList.LogDate DESC, qryPileLogList.RigNo 
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
  
    con.query(`SELECT  DATEDIFF(n, qryWorkingTimeEntry.TimeIn, DATEADD(hh, IIF(qryWorkingTimeEntry.NightShift=-1, 24, 0), qryWorkingTimeEntry.TimeOut)) AS WorkMinutes, 
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


router.route("/addNewPillingGrouping").post(async (req, res) => {
  try {
    
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryPileGroupingsInput
    WHERE qryPileGroupingsInput.EnquiryID = ${EnquiryID}
    ORDER BY qryPileGroupingsInput.StartDate;
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