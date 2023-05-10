const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");


router.route("/data").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *, qryEmployees.Initials FROM qryOpportunitiesFull LEFT JOIN qryEmployees  ON qryOpportunitiesFull.NextChaseBy = qryEmployees.EmployeeID WHERE qryOpportunitiesFull.[EnquiryNo] IS NOT NULL ORDER BY LEN(EnquiryNo)  DESC, RIGHT(EnquiryNo, LEN(EnquiryNo)-1) DESC;`)
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


  router.route("/interaction").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblEnquiries.EstimatorID, tblHistory.*, tblEnquiries.Address, qryContacts.ContactFullName
      FROM tblHistory
      LEFT JOIN tblEnquiries
      ON tblHistory.EnquiryID = tblEnquiries.EnquiryID LEFT JOIN  qryContacts ON tblHistory.ContactID = qryContacts.ContactID
      ORDER BY tblHistory.InteractionDate DESC, tblHistory.EventDate DESC, tblEnquiries.EnquiryNo DESC;
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


  router.route("/search").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT qryOpportunitiesFull.EnquiryNo AS [Opp No],
      qryOpportunitiesFull.EnqName AS Name,
      ISNULL(Address, '') + IIF(Town IS NULL OR Town = '', '', ', ' + Town) AS OppAddress,
      qryOpportunitiesFull.EnquiryID,
      IIF(ISNULL(OppWon, 0) = -1, 'Converted', IIF(ISNULL(OppDead, 0) = -1, 'Dead', OppStatus)) AS Status,
      qryOpportunitiesFull.NextChaseDate2 AS [Next Chase]
FROM qryOpportunitiesFull
WHERE qryOpportunitiesFull.EnquiryNo <> ''
 AND qryOpportunitiesFull.OppWon = 0
 AND qryOpportunitiesFull.OppDead = 0
ORDER BY qryOpportunitiesFull.EnquiryID DESC;`)
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



  router.route("/andNewOpportunities").post(async (req, res) => {
    let EnquiryID = req.body['EnquiryID'];
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT EnquiryNo AS NumberOnly, tblEnquiries.* FROM tblEnquiries WHERE tblEnquiries.EnquiryID = ${EnquiryID} ORDER BY tblEnquiries.EnquiryNo DESC;`)
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