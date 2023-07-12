const express = require("express");
var db = require('../db/db');
const sql = require('mssql/msnodesqlv8')
const router = express.Router();


router.route("/rating").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblImprovement.*, 
      ROUND((ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0))/8,1) AS Average, 
      (ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0)) AS Total, 
      (5*8) AS Possible, 
      ROUND(100*(ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)+ISNULL(Q7,0)+ISNULL(Q8,0))/(5*8),0) AS Percentage, qrySubbieSupplier.CompanyName, tblImprovementType.TypeName, qryEmployees.FirstName+' '+qryEmployees.Surname AS ActionBy
    FROM tblImprovement LEFT JOIN qrySubbieSupplier ON tblImprovement.CompanyID = qrySubbieSupplier.CompanyID LEFT JOIN tblImprovementType  ON  tblImprovement.TypeID = tblImprovementType.TypeID LEFT JOIN qryEmployees  ON tblImprovement.ActionByID = qryEmployees.EmployeeID
    WHERE tblImprovement.SourceID = 1 
    ORDER BY tblImprovement.RaisedDate DESC, tblImprovement.ImprovementID 
    OFFSET 0 ROWS FETCH NEXT 1000 ROWS ONLY;
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



  router.route("/external").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT qrySubbieSupplier.*
      FROM qrySubbieSupplier
      ORDER BY qrySubbieSupplier.CompanyName;`, function(err, record) {
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


  

  router.route("/rating1").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblImprovement.*, ROUND((ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0))/6,1) AS Average, (ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0)) AS Total, (6*5) AS Possible, ROUND(100*(ISNULL(Q1,0)+ISNULL(Q2,0)+ISNULL(Q3,0)+ISNULL(Q4,0)+ISNULL(Q5,0)+ISNULL(Q6,0))/(6*5),0) AS Percentage, qrySubbieSupplier.CompanyName, tblImprovementType.TypeName, qryEmployees.FirstName+' '+qryEmployees.Surname AS ActionBy
      FROM tblImprovement LEFT JOIN qrySubbieSupplier ON tblImprovement.CompanyID = qrySubbieSupplier.CompanyID LEFT JOIN tblImprovementType  ON  tblImprovement.TypeID = tblImprovementType.TypeID LEFT JOIN qryEmployees  ON tblImprovement.ActionByID = qryEmployees.EmployeeID
      WHERE (((tblImprovement.SourceID)=2))
      ORDER BY tblImprovement.RaisedDate DESC, tblImprovement.ImprovementID;
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


  router.route("/rating").post(async (req, res) => {
    try {
      const data = req.body;
      const id = data.ImprovementID;
  
      const setClauses = [];
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && key !== "ImprovementID") {
          let formattedValue = value;
          if (typeof value === "boolean") {
            formattedValue = value ? 1 : 0;
          } else if (typeof value === "string") {
            formattedValue = `'${value}'`;
          }
          setClauses.push(`${key} = ${formattedValue}`);
        }
      }
  
      const query = `UPDATE tblImprovement SET ${setClauses.join(
        ", "
      )} WHERE tblImprovement.ImprovementID = ${id};`;
  // console.log(query);
      const con = await sql.connect(db);
      await con.request().query(query);
      // console.log(query);
  
      res.status(200).json({
        data: "successful",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: "failure",
      });
    }
  });




  router.route("/vetting").get( async(req, res) => {
    sql.connect(db, function(err){
        if(err){
            console.log(err);
        }
      var con = new sql.Request();
    
      con.query(`SELECT tblInsurance_Details.ID, tblInsurance_Details.InsuranceCoID, tblInsurance_Details.Description, tblInsurance_Details.StartDate, tblInsurance_Details.EndDate, tblInsurance_Details.InsuranceTypeID, tblInsurance_Details.SCID, tblInsurance_Details.Value, tblInsurance_Details.Active, tblInsurance_Details.Excess, tblInsurance_Details.Notes, tblInsurance_Details.BusinessDescription, tblInsurance_Details.IndemnityToPrinciple, tblInsurance_Details.Height, tblInsurance_Details.Depth, tblInsurance_Details.Heat, tblInsurance_Details.PilingGuarantee, tblInsurance_Details.Sent, tblInsurance_Details.SentBy, tblInsurance_Details.SentDate, tblInsurance_Details.Received, tblInsurance_Details.ReceivedBy, tblInsurance_Details.ReceivedDate, tblInsurance_Details.Approved, tblInsurance_Details.ApprovedBy, tblInsurance_Details.ApprovedDate, tblInsurance_Details.Timestamp, tblInsurance_Details.DocPath, qrySubbieSupplier.CompanyName,tblInsuranceTypes.InsuranceType,tblCompanies.CompanyName as IcompanyName
      FROM dbo.tblInsurance_Details LEFT JOIN qrySubbieSupplier
      ON tblInsurance_Details.SCID = qrySubbieSupplier.CompanyID LEFT JOIN  tblInsuranceTypes ON tblInsurance_Details.InsuranceTypeID = tblInsuranceTypes.InsuranceTypeID LEFT JOIN  tblCompanies ON tblInsurance_Details.InsuranceCoID = tblCompanies.CompanyID
      ORDER BY tblInsurance_Details.Active DESC , tblInsurance_Details.InsuranceTypeID;`, function(err, record) {
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

  router.route("/vetting").post(async (req, res) => {
    try {
      const data = req.body;
      const id = data.ID;
  
      const setClauses = [];
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && key !== "ID") {
          let formattedValue = value;
          if (typeof value === "boolean") {
            formattedValue = value ? 1 : 0;
          } else if (typeof value === "string") {
            formattedValue = `'${value}'`;
          }
          setClauses.push(`${key} = ${formattedValue}`);
        }
      }
  
      const query = `UPDATE tblInsurance_Details SET ${setClauses.join(
        ", "
      )} WHERE tblInsurance_Details.ID = ${id};`;
  // console.log(query);
      const con = await sql.connect(db);
      await con.request().query(query);
      // console.log(query);
  
      res.status(200).json({
        data: "successful",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: "failure",
      });
    }
  });

  
  router.route("/insuranceCompany").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT CompanyName, CompanyID
      FROM tblCompanies
      WHERE TypeID = 9
      ORDER BY CompanyName;
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

  router.route("/type").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT tblImprovementType.TypeName, tblImprovementType.TypeID, tblImprovementType.Type
      FROM tblImprovementType;
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





  router.route("/doneby").get(async (req, res) => {
    try {
      const con = await sql.connect(db);
      const result = await con.request().query(`SELECT DISTINCT FirstName + ' ' + Surname AS EngineerName, 
      EmployeeID, WinLogin, EmailAddress
  FROM tblEmployees
  WHERE ISNULL(OfficeYN, 0) = 1
  ORDER BY EngineerName;
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