const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
const router = express.Router();


router.route("/leaveYear").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblLeaveYears
      ORDER BY tblLeaveYears.LeaveYear DESC;
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

  router.route("/bankHols").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblHolidays
      ORDER BY tblHolidays.Holiday;`)
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

  router.route("/allowance").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblLeaveBF.*, qryEmployees.FirstName, qryEmployees.Surname, qryEmployees.StartDate, qryEmployees.DepartmentID FROM tblLeaveBF LEFT JOIN qryEmployees ON tblLeaveBF.EmployeeID = qryEmployees.EmployeeID ORDER BY tblLeaveBF.LeaveYear DESC , qryEmployees.EmployeeFullName;`)
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

  router.route("/approvalM").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT * FROM tblEmployees WHERE tblEmployees.[FirstName] IS NOT NULL ORDER BY tblEmployees.Dormant, tblEmployees.FirstName;`)
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

  
  router.route("/leaveGroup").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblLeaveGroup.* FROM tblLeaveGroup ORDER BY tblLeaveGroup.Old DESC, tblLeaveGroup.LeaveGroup;`)
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

  router.route("/vehicles").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblVehicles.VehicleID, tblVehicles.RegNo, tblVehicles.Manufacturer, tblVehicles.Model, tblVehicles.RegDate, tblVehicles.Insurer, tblVehicles.Notes, tblVehicles.Disposed, tblVehicles.DisposedDate, tblVehicles.DisposedNotes, tblVehicles.Timestamp, * FROM tblVehicles ORDER BY tblVehicles.Disposed ASC;`)
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

  router.route("/equipment").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM tblCompanyProperty
      ORDER BY tblCompanyProperty.Dormant, tblCompanyProperty.PurchaseDate;`)
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


  router.route("/tasksCheck").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblVehicles.RegNo, tblVehicles.Manufacturer, tblVehicles.Model, tblVehicleDate.DateTypeID, tblVehicleDate.DateDone, tblVehicleDate.ExpiryMonths, CASE WHEN ISNULL(ExpiryMonths, 0) = 0 THEN NULL ELSE DATEADD(MONTH, ExpiryMonths, DateDone) END AS DateExpiry, tblVehicleDate.Notes FROM tblVehicles INNER JOIN tblVehicleDate ON tblVehicles.VehicleID = tblVehicleDate.VehicleID WHERE tblVehicles.Disposed = 0 AND tblVehicleDate.Void = 0;`)
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

  router.route("/leaveCalendar").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT LeaveID, Employee + '-' + tblLeaveTypes.ShortCode AS EmployeeLeave, StartDate, EndDate, UnpaidDays, Comments, Cancel, EnteredBy, EnteredDate FROM tblEmployeeLeave LEFT OUTER JOIN tblLeaveTypes ON tblEmployeeLeave.LeaveTypeID=tblLeaveTypes.LeaveTypeID UNION SELECT ID, ISNULL(Description, 'BANK HOLIDAY'), Holiday, Holiday, NULL, NULL, NULL, NULL, NULL FROM tblHolidays`)
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