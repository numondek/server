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

  router.route("/stockitemsSub").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT *
      FROM qryStockMovements
      ORDER BY qryStockMovements.RaisedDate DESC;
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



 


  router.route("/restock").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblStockOrder.*, [tblCompanies].[CompanyName] + ' - ' + ISNULL([tblCompanies].[OfficeName], '') AS Supplier  FROM tblStockOrder LEFT JOIN tblCompanies ON tblStockOrder.SupplierID = tblCompanies.CompanyID WHERE tblStockOrder.StockOrderID IS NOT NULL AND tblStockOrder.OrderTypeID = 2 ORDER BY tblStockOrder.DeliveryDate DESC;`, function(err, record) {
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
    
      con.query(`SELECT tblStockOrder.*, tblEmployees.FirstName+' '+tblEmployees.Surname AS RequestedBy, tblEnquiries.ContractNo FROM tblStockOrder LEFT JOIN tblEmployees ON tblStockOrder.RequestedByID = tblEmployees.EmployeeID LEFT JOIN tblEnquiries ON tblStockOrder.JobID = tblEnquiries.EnquiryID WHERE StockOrderID IS NOT NULL AND OrderTypeID = 1 ORDER BY DeliveryDate DESC;`, function(err, record) {
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


  router.route("/stockorderSub").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT Description, ID, StockCat, Unit, SalePrice, SupplierCode, IndivAllocation, Live, StockLevel, Dormant FROM qryStockItemList WHERE ID IS NOT NULL  ORDER BY Dormant, StockCat, Description`)
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

  router.route("/stockorderdetails").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT  tblStockOrder.StockOrderID, tblStockOrder.DeliveryDate, tblStockOrder.RequestedByID, tblStockOrder.JobID, tblStockOrder.SupplierID, tblStockOrder.DivisionID, tblStockOrder.Notes, tblStockOrder.OrderTypeID, tblStockOrder.RaisedDate, tblStockOrderDetails.StockOrderDetID, tblStockOrderDetails.StockOrderID, tblStockOrderDetails.StockItemID, tblStockOrderDetails.PreEnterQuantity, tblStockOrderDetails.EnteredQuantity, tblStockOrderDetails.Quantity, tblStockOrderDetails.Unit, tblStockOrderDetails.Price, tblStockOrderDetails.AllocatedToID, tblStockOrderDetails.Notes, tblStockOrder.RaisedBy,  CAST(ISNULL(Quantity*Price,0) AS money) AS [Value], tblStockItems.StockCatID, tblStockItems.StockTypeID, tblStockItems.DivisionID, tblStockOrderDetails.Received, tblStockOrderDetails.ReceivedDate, tblStockOrderDetails.ReceivedBy, tblStockOrder.Cancelled, tblEmployees.FirstName+' '+tblEmployees.Surname AS RequestedBy, tblStockItems.DescriptShort + IIF([Size] IS NULL, '', ' - ' + [Size]) AS Description, tblAllocatedTo.FirstName+' '+tblAllocatedTo.Surname AS AllocatedTo  FROM tblStockOrderDetails  INNER JOIN tblStockOrder ON tblStockOrderDetails.StockOrderID = tblStockOrder.StockOrderID LEFT JOIN tblStockItems ON tblStockOrderDetails.StockItemID = tblStockItems.ID 
      LEFT JOIN tblEmployees ON tblStockOrder.RequestedByID = tblEmployees.EmployeeID 
      LEFT JOIN tblEmployees AS tblAllocatedTo ON tblStockOrderDetails.AllocatedToID = tblAllocatedTo.EmployeeID  WHERE tblStockOrder.OrderTypeID = 1 AND ISNULL(tblStockOrder.Cancelled, 0) = 0 AND ISNULL(tblStockOrderDetails.Cancelled, 0) = 0 ;`, function(err, record) {
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

  router.route("/stockOrder1").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT FORMAT(Quantity * [Price], 'C', 'en-US') AS [Value], tblStockOrderDetails.*, qryStockLevels.StockLevel FROM tblStockOrderDetails LEFT JOIN qryStockLevels ON tblStockOrderDetails.StockItemID = qryStockLevels.StockItemID WHERE ISNULL([Cancelled], 0) = 0;`)
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
  // tblStockOrderDetails.EnquiryID = ${EnquiryID}

  router.route("/addNewContractStockOrder").get(async (req, res) => {
    try {
      let EnquiryID = req.body['EnquiryID'];
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblStockOrder.StockOrderID, tblStockOrder.DeliveryDate, tblStockOrder.RequestedByID, tblStockOrder.JobID, tblStockOrder.SupplierID, tblStockOrder.DivisionID, tblStockOrder.Notes, tblStockOrder.OrderTypeID, tblStockOrder.RaisedDate, tblStockOrderDetails.StockOrderDetID, tblStockOrderDetails.StockOrderID, tblStockOrderDetails.StockItemID, tblStockOrderDetails.PreEnterQuantity, tblStockOrderDetails.EnteredQuantity, tblStockOrderDetails.Quantity, tblStockOrderDetails.Unit, tblStockOrderDetails.Price, tblStockOrderDetails.AllocatedToID, tblStockOrderDetails.Notes, tblStockOrder.RaisedBy, FORMAT(ISNULL(Quantity * [Price], 0), 'C') AS [Value], tblAllocatedTo.FirstName+' '+tblAllocatedTo.Surname AS AllocatedTo, tblEmployees.FirstName+' '+tblEmployees.Surname AS RequestedBy, 
      itemID.DescriptShort + IIF(tblStockItems.[Size] IS NULL, '', ' - ' + tblStockItems.[Size]) AS Description, tblStockOrder.Notes AS Notes2
      FROM tblStockOrderDetails
      INNER JOIN tblStockOrder ON tblStockOrderDetails.StockOrderID = tblStockOrder.StockOrderID
      LEFT JOIN tblStockItems ON tblStockOrderDetails.StockItemID = tblStockItems.ID
      LEFT JOIN tblStockType ON tblStockType.StockTypeID = tblStockItems.StockTypeID
      LEFT JOIN tblEmployees ON tblStockOrder.RequestedByID = tblEmployees.EmployeeID
      LEFT JOIN tblStockItems AS itemID ON tblStockOrderDetails.StockItemID = tblStockItems.ID 
      LEFT JOIN tblEmployees AS tblAllocatedTo ON tblStockOrderDetails.AllocatedToID = tblAllocatedTo.EmployeeID
      WHERE tblStockOrder.OrderTypeID = 1 
        
        AND ISNULL(tblStockOrder.Cancelled, 0) = 0
        AND ISNULL(tblStockOrderDetails.Cancelled, 0) = 0
        AND ISNULL(tblStockType.ShowInCosts, 0) = 1;
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