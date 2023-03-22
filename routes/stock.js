const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
const { json } = require("body-parser");



router.route("/stockitems").get( async(req, res) => {


    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT TOP 100 PERCENT tblStockItems.*, tblStockCategories.StockCat, qryStockLevels.StockLevel, CAST(ISNULL(IIF(qryStockLevels.StockLevel < 0, 0, qryStockLevels.StockLevel * CostPrice), 0) AS numeric(18,2)) AS StockValue FROM (tblStockItems  LEFT JOIN tblStockCategories ON tblStockItems.StockCatID = tblStockCategories.StockCatID) LEFT JOIN qryStockLevels ON tblStockItems.ID = qryStockLevels.StockItemID ORDER BY tblStockItems.Dormant DESC, tblStockCategories.StockCat, tblStockItems.DescriptShort;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log(data[0]);
            res.status(200).json({data});
        }
        
      })
    
      
    });
    
  });



  router.route("/stockitemsfilter").get( async(req, res) => {


    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
      var div = 2;
      const div1 = 'DivisionID = 2';
      const sqlq = `SELECT TOP 100 PERCENT tblStockItems.*, tblStockCategories.StockCat, qryStockLevels.StockLevel, CAST(ISNULL(IIF(qryStockLevels.StockLevel < 0, 0, qryStockLevels.StockLevel * CostPrice), 0) AS numeric(18,2)) AS StockValue FROM (tblStockItems  LEFT JOIN tblStockCategories ON tblStockItems.StockCatID = tblStockCategories.StockCatID) LEFT JOIN qryStockLevels ON tblStockItems.ID = qryStockLevels.StockItemID WHERE '${div1}' ORDER BY tblStockItems.Dormant DESC, tblStockCategories.StockCat, tblStockItems.DescriptShort;`;
      
    
      con.query(sqlq, function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log(data[0]);
            res.status(200).json({data});
        }
        
      })
    
      
    });
    
  });


  router.route("/restock").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblStockOrder WHERE tblStockOrder.StockOrderID IS NOT NULL AND tblStockOrder.OrderTypeID = 2 ORDER BY tblStockOrder.DeliveryDate DESC;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            // console.log(data[0]);
            res.status(200).json({data});
        }
        
      })
    
      
    });
    
  });



  router.route("/stockcheck").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblStockOrder WHERE StockOrderID IS NOT NULL AND OrderTypeID = 3 ORDER BY DeliveryDate DESC;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
     
  });


  router.route("/stockorder").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT * FROM tblStockOrder WHERE StockOrderID IS NOT NULL AND OrderTypeID = 1 ORDER BY DeliveryDate DESC;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
    
  });

  router.route("/stockorderdetails").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query('SELECT  tblStockOrder.StockOrderID, tblStockOrder.DeliveryDate, tblStockOrder.RequestedByID, tblStockOrder.JobID, tblStockOrder.SupplierID, tblStockOrder.DivisionID, tblStockOrder.Notes, tblStockOrder.OrderTypeID, tblStockOrder.RaisedDate, tblStockOrderDetails.StockOrderDetID, tblStockOrderDetails.StockOrderID, tblStockOrderDetails.StockItemID, tblStockOrderDetails.PreEnterQuantity, tblStockOrderDetails.EnteredQuantity, tblStockOrderDetails.Quantity, tblStockOrderDetails.Unit, tblStockOrderDetails.Price, tblStockOrderDetails.AllocatedToID, tblStockOrderDetails.Notes, tblStockOrder.RaisedBy, CAST(ISNULL(Quantity*Price,0) AS money) AS [Value], tblStockItems.StockCatID, tblStockItems.StockTypeID, tblStockItems.DivisionID, tblStockOrderDetails.Received, tblStockOrderDetails.ReceivedDate, tblStockOrderDetails.ReceivedBy, tblStockOrder.Cancelled FROM tblStockOrderDetails INNER JOIN tblStockOrder ON tblStockOrderDetails.StockOrderID = tblStockOrder.StockOrderID LEFT JOIN tblStockItems ON tblStockOrderDetails.StockItemID = tblStockItems.ID WHERE tblStockOrder.OrderTypeID = 1 AND ISNULL(tblStockOrder.Cancelled, 0) = 0 AND ISNULL(tblStockOrderDetails.Cancelled, 0) = 0;', function(err, record) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: false });
        } else {
            // console.log(record.recordsets[0]);
            var data = record.recordsets[0];
            console.log('data[0]');
            res.status(200).json({data});
        }
        
      })  
    });
    
  });



  









module.exports = router;