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



  router.route("/andNewOpportunitiesCompany").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT 
      CompanyName + 
      CASE 
          WHEN OfficeName IS NOT NULL THEN ' - ' + OfficeName
          WHEN Town IS NOT NULL THEN ' - ' + Town
          ELSE ''
      END AS CompanyOffice,
      Telephone,
      Fax,
      Email,
      CompanyID AS ID,
      CASE 
          WHEN ISNULL(Caution, 0) = 1 THEN 'Y'
          ELSE ''
      END AS UseCaution,
      Dormant
  FROM tblCompanies
  WHERE CompanyName IS NOT NULL AND TypeID = 1
  ORDER BY Dormant DESC, CompanyOffice;
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


  router.route("/andNewOpportunitiesSub").post(async (req, res) => {
    let EnquiryID = req.body['EnquiryID'];
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT 
      CONVERT(VARCHAR, tblEnquiryTenders.EnquiryID) + '-' + CONVERT(VARCHAR, tblEnquiryTenders.CompanyID) AS EnqCo,
      tblEnquiryTenders.*
  FROM tblEnquiryTenders
  INNER JOIN tblEnquiries ON tblEnquiryTenders.EnquiryID = tblEnquiries.EnquiryID
  WHERE tblEnquiries.EnquiryID = ${EnquiryID}
  ORDER BY tblEnquiryTenders.MainTender DESC, tblEnquiryTenders.Deleted, tblEnquiryTenders.TenderNo;
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


  router.route("/andNewOpportunitiesContract").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT 
      CASE 
          WHEN firstname IS NULL THEN ISNULL(Initials, '')
          ELSE firstname
      END + ' ' + ISNULL(Surname, '') AS ContactFullName,
      Telephone + CASE 
                      WHEN Extension IS NULL THEN ''
                      ELSE ' - Ext ' + Extension
                  END AS TelExt,
      tblContacts.Mobile,
      tblContacts.Email,
      tblContacts.ContactID,
      tblContacts.Gone
  FROM tblContacts
  WHERE tblContacts.CompanyID = 44042
  ORDER BY tblContacts.Gone DESC, 
           CASE 
               WHEN firstname IS NULL THEN ISNULL(Initials, '')
               ELSE firstname
           END + ' ' + ISNULL(Surname, '');
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


  router.route("/andNewOpportunitiesCountry").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT tblEnquiries.County
        FROM tblEnquiries
        WHERE tblEnquiries.County IS NOT NULL
            AND tblEnquiries.County <> ''
            AND ISNUMERIC(SUBSTRING(tblEnquiries.County, 2, 1)) = 0
            AND ISNUMERIC(SUBSTRING(tblEnquiries.County, 3, 1)) = 0
        ORDER BY tblEnquiries.County;
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