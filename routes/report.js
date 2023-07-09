const express = require("express");
var db = require('../db/db');
const sql = require('mssql/msnodesqlv8')
const router = express.Router();



router.route("/dashboard").get(async (req, res) => {
    try {
      
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT TOP 1000 *
      FROM qryEnquiriesByYear;
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