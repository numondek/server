const express = require("express");
var db2 = require("../db/db2");
var db = require("../db/db");


const sql = require("mssql/msnodesqlv8");
const router = express.Router();

router.route("/leaveRequest").post(async (req, res) => {
  try {

    const data = req.body;
    const id = data.LeaveID;
    console.log(data);

    const setClauses = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && key !== "LeaveID") {
        let formattedValue = value;
        if (typeof value === "boolean") {
          formattedValue = value ? 1 : 0;
        } else if (typeof value === "string") {
          formattedValue = `'${value}'`;
        }
        setClauses.push(`${key} = ${formattedValue}`);
      }
    }

    let query;
    if (id !== null) {
      // Perform an UPDATE query
      query = `UPDATE tblEmployeeLeave SET ${setClauses.join(
        ", "
      )} WHERE LeaveID = ${id}`;
    } else {
      // Perform an INSERT query
      const columnNames = Object.keys(data).filter(
        (key) => key !== "LeaveID"
      );
      const columnValues = columnNames.map((key) => {
        let value = data[key];
        if (typeof value === "boolean") {
          value = value ? 1 : 0;
        } else if (typeof value === "string") {
          value = `'${value}'`;
        }
        else if (value === null) {
          value = 'NULL';
        }
        return value;
      });
      query = `INSERT INTO tblEmployeeLeave (${columnNames.join(
        ", "
      )}) VALUES (${columnValues.join(", ")})`;
      // console.log(query);
    }

    const con = await sql.connect(db);
    const result = await con.request().query(query);
    console.log(query);
    res.status(200).json({
      data: "successful",
    });s
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failure",
    });
  }
});

router.route("/myLeave").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request()
        .query(`SELECT *
        FROM qryLeaveList
        WHERE (((qryLeaveList.StartDate)>'2022-01-01' AND (qryLeaveList.StartDate)<'2022-12-31') AND ((qryLeaveList.LeaveID) Is Not Null) AND ((ISNULL([Cancel],0))=0)) OR (((qryLeaveList.LeaveID) Is Not Null) AND ((ISNULL([Cancel],0))=0) AND ((qryLeaveList.EndDate)>'2022-01-01' And (qryLeaveList.EndDate)<'2022-12-31'))
        ORDER BY qryLeaveList.StartDate;
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

  router.route("/myLeaveSub").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request()
        .query(`SELECT *
        FROM qryLeaveList
        WHERE qryLeaveList.LeaveID IS NULL;
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

  router.route("/noConformance").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request()
        .query(`SELECT tblImprovement.*, Round((Q1+Q2+Q3+Q4+Q5)/5,1) AS Average, (Q1+Q2+Q3+Q4+Q5) AS Total, (5*5) AS Possible, Round(100*(Q1+Q2+Q3+Q4+Q5)/(5*5),0) AS Percentage
        FROM tblImprovement
        WHERE tblImprovement.TypeID IS NOT NULL
        ORDER BY tblImprovement.RaisedDate DESC, tblImprovement.ImprovementID;
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
  

  router.route("/noConformanceSub").get(async (req, res) => {
    try {
        let ImprovementID = req.query.ImprovementID; 
      const con = await sql.connect(db);
      const result = await con.request()
        .query(`SELECT  tblHistoryImp.*
        FROM tblHistoryImp
        WHERE tbleHistoryImp.ImprovementID = ${ImprovementID}
        ORDER BY tblHistoryImp.EventDate DESC;
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
