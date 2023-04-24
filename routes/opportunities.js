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
      const result = await con.request().query(`SELECT * FROM qryOpportunitiesFull WHERE qryOpportunitiesFull.[EnquiryNo] IS NOT NULL ORDER BY LEN(EnquiryNo) DESC, RIGHT(EnquiryNo, LEN(EnquiryNo)-1) DESC;`)
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
      const result = await con.request().query(`SELECT tblEnquiries.EstimatorID, tblHistory.* FROM tblHistory LEFT JOIN tblEnquiries ON tblHistory.EnquiryID = tblEnquiries.EnquiryID ORDER BY tblHistory.InteractionDate DESC, tblHistory.EventDate DESC;`)
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