const express = require("express");
var db2 = require("../db/db2");


const sql = require("mssql/msnodesqlv8");
const router = express.Router();

router.route("/leaveRequest").get(async (req, res) => {
  try {
    const con = await sql.connect(db.con);
    const result = await con.request()
      .query(`SELECT TOP 1000 dbo.Workdays(StartDate, EndDate) - ISNULL(UnpaidDays, 0) AS LeaveDays, *
      FROM tblEmployeeLeave;
      `);
    res.status(200).json({
      data: result.recordsets[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
    });
  }
});

router.route("/siteAudits").get(async (req, res) => {
  try {
    const con = await sql.connect(db2);
    const result = await con.query(`SELECT *
      FROM CheckIt.dbo.qrySiteAuditSummary
      WHERE CheckIt.dbo.qrySiteAuditSummary.[ContractNo] IS NOT NULL
      ORDER BY CheckIt.dbo.qrySiteAuditSummary.AuditDate DESC;
      `);
    res.status(200).json({
      data: result.recordsets[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
    });
  }
});

router.route("/keyQuestion").get(async (req, res) => {
  try {
    const con = await sql.connect(db2);
    const result = await con.query(`SELECT *
      FROM CheckIt.dbo.qryKeyQuestionsSummary
      WHERE CheckIt.dbo.qryKeyQuestionsSummary.ContractNo IS NOT NULL
      ORDER BY CheckIt.dbo.qryKeyQuestionsSummary.AuditDate DESC;
      `);
    res.status(200).json({
      data: result.recordsets[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
    });
  }
});



router.route("/pre-StartMeetings").get(async (req, res) => {
    try {
      const con = await sql.connect(db2);
      const result = await con.query(`SELECT *
      FROM CheckIt.dbo.qryPreStartMeetingSummary
      WHERE CheckIt.dbo.qryPreStartMeetingSummary.ContractNo IS NOT NULL
      ORDER BY CheckIt.dbo.qryPreStartMeetingSummary.AuditDate DESC;
      `);
      res.status(200).json({
        data: result.recordsets[0],
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: false,
      });
    }
  });

  router.route("/dataOverride").get(async (req, res) => {
    try {
      const con = await sql.connect(db2);
      const result = await con.query(`SELECT *
      FROM CheckIt.dbo.tblOverrides;`);
      res.status(200).json({
        data: result.recordsets[0],
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: false,
      });
    }
  });
  

module.exports = router;
