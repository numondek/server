const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");





router.route("/enquiryView").post(async (req, res) => {
  let divisionID = req.body['divisionID'];
  let enquiryTypeID = req.body['enquiryTypeID'];
  let estimatorID = req.body['estimatorID'];
  let proposalsID = req.body['proposalsID'];
  let cMFID = req.body['cMFID'];
  let qSID = req.body['qSID'];
  let clientID = req.body['clientID'];
  let clientGID = req.body['clientGID'];
  let pwtID = req.body['pwtID'];
  let qualityID = req.body['qualityID'];
  let prioritiesID = req.body['prioritiesID'];
  let sourceID = req.body['sourceID'];
  let fPSCID = req.body['fPSCID'];
  let fPSTID = req.body['fPSTID'];
  let fPSPTID = req.body['fPSPTID'];
  let industrySectorID = req.body['industrySectorID'];
  let financeTypeID = req.body['financeTypeID'];
  let workRegionID = req.body['workRegionID'];
  let marketSTID = req.body['marketSTID'];
  let mainTenderStatus = req.body['mainTenderStatus'];
  let majorProjectStatus = req.body['majorProjectStatus'];
  let jobOnHoldStatus = req.body['jobOnHoldStatus'];
  let jobSecuredByClientStatus = req.body['jobSecuredByClientStatus'];
  let targetEnquiryStatus = req.body['targetEnquiryStatus'];
  let dateSelected = req.body['dateSelected'] ?? null;
  let startDate = req.body['startDate'];
  let endDate = req.body['endDate'];
  let tender = req.body['tender'] ?? null;
  let keyWord = req.body['keyWord'] ?? null;
  const page = req.body['page'];
  const size = req.body['size'];
  const view = req.body['view'];


  try {
    const filters = [];


    const variables = [
      ['DivisionID', divisionID],
      ['EnquiryTypeID', enquiryTypeID],
      ['EstimatorID', estimatorID],
      ['ProposalsID', proposalsID],
      ['ManagerID', cMFID],
      ['SurveyorID', qSID],
      ['CompanyID', clientID],
      ['GroupID', clientGID],
      ['PileTypeID', pwtID],
      ['QualityID', qualityID],
      ['PriorityID', prioritiesID],
      ['SourceID', sourceID],
      ['FPSConstruction', fPSCID],
      ['FPSType', fPSTID],
      ['FPSPileType', fPSPTID],
      ['M_Industry', industrySectorID],
      ['M_Finance', financeTypeID],
      ['M_Region', workRegionID],
      ['M_Market', marketSTID],
      ['MainTender', mainTenderStatus],
      ['MajorProject', majorProjectStatus],
      ['onHold', jobOnHoldStatus],
      ['ContractSecured', jobSecuredByClientStatus],
      ['Target', targetEnquiryStatus],
    ];

    const dates = [
      ['Received', 'DateReceived'],
      ['Returned', 'DateReturned'],
      ['Due', 'DateDue'],
      ['Start', 'ContPropStart'],
      ['WonPrelim', 'DateOrderPrelim'],
      ['Won', 'DateOrder'],
      ['Lost', 'LostDate'],
      ['Complete', 'CompleteSiteDate']
    ];

    for (const [variable, value] of variables) {
      if (value || value != null) {
        filters.push(`${dateSelected !== null || keyWord !== null || tender !== null ? `AND` : ''} qryEnquiriesFull.${variable} = ${typeof(value) === 'boolean' ? `'${value}'` : value}`);
      }
    }

    let time;

    for (const [date, value] of dates) {
      if (dateSelected == date) {
        time = `${value} BETWEEN '${startDate}' AND '${endDate}' `;
        break;
      }
    }
    // console.log(req.body);

    let like ;
    if (keyWord !== null){
      like = `${dateSelected !== null ? `AND` : ''} EnqName LIKE '%${keyWord}%' OR FullAddress LIKE '%${keyWord} %' OR Company LIKE '%${keyWord}%'`;
      // console.log(keyWord);
    }

    let like1 ;
    if (tender !== null){
      like1 = ` ${dateSelected !== null || keyWord !== null ? `AND` : ''}  ISNULL(OrderValue, ISNULL(TenderValue, 0)) >= ISNULL(${tender}, 0)`;
      // console.log(tender);
    }
    


    

    const con = await sql.connect(db);

    const offset = (page - 1) * size;
    const whereConditions = [];

   
    if (dateSelected !== null) {
      whereConditions.push(time);
    }

    if (keyWord !== null) {
      whereConditions.push(like);
    }

    if (tender !== null) {
      whereConditions.push(like1);
    }
    if (filters.length > 0) {
      whereConditions.push(filters.join(' AND '));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' ')} ` : '';

    
    const whereClause1 = whereConditions.length > 0 ? `AND ${whereConditions.join(' ')} ` : '';
    console.log(whereClause);

    const result = await con.query(
      `SELECT COUNT(*) as TotalRows
       FROM qryEnquiriesFull ${whereClause};`
    );
    const totalPages = result.recordsets[0][0];

    var data;
    if (view == 1){
    const queryResult = await con.query(
      `SELECT *
      FROM qryEnquiriesFull ${whereClause} 
      ORDER BY LEN(EnquiryNo) DESC , RIGHT(EnquiryNo,LEN(EnquiryNo)-1) DESC OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY `
    );
    data = queryResult.recordsets[0];
    }else{
      const queryResult = await con.query(
        `SELECT IIF(ISNULL([Won], 0) = -1, 0, [TenderType]) AS EnquiryStatus, *
        FROM qryEnquiriesFull
        WHERE ISNULL([MainTender], 0) = 1 ${whereClause1}
        ORDER BY LEN(ContractNo) DESC, RIGHT(EnquiryNo, LEN(EnquiryNo) - 1) DESC OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY `
      );
      data = queryResult.recordsets[0];
      
    }

    res.status(200).json({
      data,
      totalPages
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false
    });
  }
});



router.route("/enquiryHistory").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblHistory.*, qryContacts.ContactFullName, tblCompanies.CompanyName + IIF(tblCompanies.OfficeName IS NOT NULL, ' - ' + tblCompanies.OfficeName, IIF(tblCompanies.Town IS NULL, '', ' - ' + tblCompanies.Town)) AS CompanyTown
FROM tblHistory LEFT JOIN qryContacts ON tblHistory.ContactID = qryContacts.ContactID LEFT JOIN  tblCompanies ON tblHistory.CompanyID = tblCompanies.CompanyID
ORDER BY tblHistory.EventDate DESC;
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


router.route("/enquiryPA").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryEnquiriesForemen
    ORDER BY qryEnquiriesForemen.StartDate;    
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

router.route("/enquiryPA").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryEnquiriesForemen
    WHERE EnquiryID = ${EnquiryID}
    ORDER BY qryEnquiriesForemen.StartDate;    
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



router.route("/enquiryCM").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT Right(AddedBy,Len(AddedBy)-CHARINDEX('',AddedBy)) AS AddedBy2, * FROM tblContractMargins WHERE Deleted = 0 ORDER BY MarginDate DESC;`)
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


router.route("/enquiryRA").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnquiries.EnquiryID, tblEnquiries.ApprovalEstYN, tblEnquiries.ApprovalEstBy, tblEnquiries.ApprovalEstDate, tblEnquiries.ApprovalEstComments, tblEnquiries.ApprovalTechYN, tblEnquiries.ApprovalTechBy, tblEnquiries.ApprovalTechDate, tblEnquiries.ApprovalTechComments, tblEnquiries.ApprovalContYN, tblEnquiries.ApprovalContBy, tblEnquiries.ApprovalContDate, tblEnquiries.ApprovalContComments, tblEnquiries.ApprovalDirYN, tblEnquiries.ApprovalDirBy, tblEnquiries.ApprovalDirDate, tblEnquiries.ApprovalDirComments, tblEnquiries.ApprovalSurvYN, tblEnquiries.ApprovalSurvBy, tblEnquiries.ApprovalSurvDate, tblEnquiries.ApprovalSurvComments FROM tblEnquiries;`)
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


router.route("/detail").post(async (req, res) => {
  try {
    const data = req.body;
    const id = data.EnquiryID;
    console.log(data);

    const setClauses = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && key !== "EnquiryID") {
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
      query = `UPDATE tblEnquiries SET ${setClauses.join(
        ", "
      )} WHERE EnquiryID = ${id}`;
    } else {
      // Perform an INSERT query
      const columnNames = Object.keys(data).filter(
        (key) => key !== "EnquiryID"
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
      query = `INSERT INTO tblEnquiries (${columnNames.join(
        ", "
      )}) VALUES (${columnValues.join(", ")})`;
      // console.log(query);
    }

    const con = await sql.connect(db);
    const result = await con.request().query(query);
    console.log(query);

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


router.route("/addNewInfo").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT * , Right(EnquiryNo, Len(EnquiryNo) - 1) AS NumberOnly FROM tblEnquiries
    WHERE tblEnquiries.EnquiryID = ${EnquiryID} AND IsNull(tblEnquiries.Deleted, 0) = 0
    ORDER BY tblEnquiries.EnquiryNo DESC;`)
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


router.route("/division").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT Division, DivisionID
      FROM tblDivisions
      WHERE ISNULL([Old],0) = 0;
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});

router.route("/stockType").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblStockType.StockType, tblStockType.StockTypeID
      FROM tblStockType;
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});




router.route("/SCategories").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblStockCategories.StockCat, tblStockCategories.StockCatID, tblStockCategories.Notes
      FROM tblStockCategories
      ORDER BY tblStockCategories.StockCat;
      ;
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});



router.route("/supplier").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT DISTINCT tblCompanies.CompanyName + ' - ' + COALESCE(tblCompanies.OfficeName, '') AS Supplier, tblCompanies.CompanyID, tblCompanies.Dormant FROM tblCompanies INNER JOIN tblStockOrder ON CAST(tblCompanies.CompanyID AS INT) = tblStockOrder.SupplierID WHERE tblCompanies.TypeID = 4 ORDER BY tblCompanies.Dormant DESC , tblCompanies.CompanyName + ' - ' + COALESCE(tblCompanies.OfficeName, '');
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});



router.route("/contract").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblEnquiries.ContractNo, ISNULL(tblEnquiries.EnqName, tblEnquiries.Address) AS Address, tblEnquiries.EnquiryID, tblContractStatus.ContStatus, IIF(tblEnquiries.ContractStatus = 2, 1, 0) AS Status, DivisionID FROM tblEnquiries LEFT OUTER JOIN tblContractStatus ON tblEnquiries.ContractStatus = tblContractStatus.StatusID WHERE tblEnquiries.Won = 1 AND LEFT(tblEnquiries.ContractNo,1) <> 'C' AND tblEnquiries.Saved = 1 AND tblEnquiries.Deleted = 0 UNION SELECT 'OFFICE', 'Office Staff', -1, '', 1, 0 FROM tblEnquiries ORDER BY Status DESC, tblEnquiries.ContractNo;`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});

router.route("/cMcontract1").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT CONCAT(FirstName, ' ', Surname) AS EngineerName,
    tblEmployees.EmployeeID,
    CASE WHEN Dormant = 0 THEN 'N' ELSE 'Y' END AS Old,
    tblEmployees.Dormant
FROM tblEmployees
INNER JOIN tblEnquiries ON tblEmployees.EmployeeID = tblEnquiries.ManagerID
INNER JOIN tblContractMargins ON tblEnquiries.EnquiryID = tblContractMargins.EnquiryID

ORDER BY tblEmployees.Dormant DESC, EngineerName;`);
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


router.route("/dVcontract").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT CONCAT(FirstName, ' ', Surname) AS EngineerName, tblEmployees.EmployeeID, tblEmployees.WinLogin, tblEmployees.EmailAddress, CASE WHEN tblEmployees.Dormant = 0 THEN 'N' ELSE 'Y' END AS Old FROM tblEmployees WHERE OfficeYN = 1 AND tblEmployees.FirstName IS NOT NULL ORDER BY Old, CONCAT(FirstName, ' ', Surname);`);
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


router.route("/cubeContract").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT DISTINCT tblEnquiries.EnquiryNo, tblEnquiries.Address, tblEnquiries.EnquiryID FROM tblEnquiries INNER JOIN tblCubeTests ON tblEnquiries.EnquiryID = tblCubeTests.EnquiryID WHERE tblEnquiries.Won = 1 AND tblEnquiries.Saved = 1 AND tblEnquiries.Deleted = 0 ORDER BY tblEnquiries.EnquiryNo DESC;`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});
router.route("/iTestContract").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblEnquiries.ContractNo, tblEnquiries.Address, tblEnquiries.EnquiryID FROM tblEnquiries INNER JOIN tblPileIntegrityTests ON tblEnquiries.ContractNo = tblPileIntegrityTests.ContractNo WHERE tblEnquiries.Won = 1 AND tblEnquiries.Saved = 1 AND tblEnquiries.Deleted = 0 ORDER BY tblEnquiries.ContractNo DESC;`);
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

router.route("/iReportTest").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT ReportNo FROM tblPileIntegrityTests ORDER BY ReportNo;`);
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


router.route("/rigType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT PileType, PileTypeID FROM tblPileTypes WHERE RigType = 1 ORDER BY PileType;`);
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

router.route("/cubetestType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCubeTestAge.AgeRef, tblCubeTestAge.Description, tblCubeTestAge.ID
    FROM tblCubeTestAge;`);
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

router.route("/cubereportType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblCubeTests.SheetRef
    FROM tblCubeTests
    ORDER BY tblCubeTests.SheetRef;
    `);
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

router.route("/requseted").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT (FirstName + ' ' + COALESCE(Surname, '')) AS Name, tblEmployees.EmployeeID, IIF(COALESCE([OfficeYN], 0) = -1, 'Office', IIF(COALESCE([ForemanYN], 0) = -1, 'Foreman', '')) AS Role, tblEmployees.Dormant AS Old FROM tblEmployees   ;`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});

router.route("/aStatus").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblExternalStatus.ExternalStatus, tblExternalStatus.ExternalStatusID
      FROM tblExternalStatus;
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});

router.route("/docType").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblInsuranceTypes.InsuranceType, tblInsuranceTypes.InsuranceDescription, tblInsuranceTypes.InsuranceTypeID, tblInsuranceTypes.TrackProgress, tblInsuranceTypes.ValidYears,  tblInsuranceTypes.Insurance
      FROM tblInsuranceTypes
      ORDER BY tblInsuranceTypes.Insurance DESC , tblInsuranceTypes.InsuranceType;      
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});



router.route("/operative").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT COALESCE(tblEmployees.Surname, '')+', '+ COALESCE(tblEmployees.FirstName, tblEmployees.Initials, '') AS FullName, tblEmployees.EmployeeID, tblDepartments.Department, tblEmployees.Telephone, tblJobTitles.JobTitle, IIF(COALESCE(tblEmployees.Dormant, 0)=0, 'Live', 'Left') AS Expr1 FROM (tblEmployees LEFT JOIN tblDepartments ON tblEmployees.DepartmentID = tblDepartments.DepartmentID) LEFT JOIN tblJobTitles ON tblEmployees.JobTitleID = tblJobTitles.JobTitleID WHERE tblEmployees.[EmployeeID] IS NOT NULL AND tblEmployees.[DepartmentID] = 1 ORDER BY COALESCE(tblEmployees.Surname, '');`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});


router.route("/driller").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT qryEmployees.EmployeeFullName, qryEmployees.EmployeeID, qryEmployees.Dormant FROM qryEmployees WHERE qryEmployees.EmployeeFullName IS NOT NULL AND COALESCE(OfficeYN, 0) = 0 AND ForemanYN = 1 ORDER BY qryEmployees.Dormant DESC , qryEmployees.EmployeeFullName;`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});


router.route("/rig").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT tblPileRigs.RigNo, tblPileRigs.RigType, tblPileRigs.RigTypeID, tblPileRigs.Obsolete AS Old
      FROM tblPileRigs
      ORDER BY tblPileRigs.Obsolete, tblPileRigs.RigManufacturer, tblPileRigs.RigType, tblPileRigs.RigNo;
      `, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});

router.route("/month").get(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();


    con.query(`SELECT DISTINCT CONCAT(DATEPART(YEAR,date_calendar.calendar_date), ' - ', DATENAME(MONTH,date_calendar.calendar_date)) AS Expr1, date_calendar.first_day_in_month, date_calendar.last_day_in_month FROM tblPileLogs INNER JOIN date_calendar ON CONVERT(date,tblPileLogs.LogDate) = date_calendar.calendar_date ORDER BY date_calendar.first_day_in_month DESC;`, function (err, record) {
      if (err) {
        console.log(err);
        res.status(500).json({
          status: false
        });
      } else {
        // console.log(record.recordsets[0]);
        var data = record.recordsets[0];
        // console.log('data[0]');
        res.status(200).json({
          data
        });
      }

    })
  });

});



router.route("/CMcontract").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT qryEnqContracts.ContractNo, qryEnqContracts.FullAddress, qryEnqContracts.EnquiryID
    FROM qryEnqContracts INNER JOIN tblContractMargins ON qryEnqContracts.EnquiryID = tblContractMargins.EnquiryID
    ORDER BY qryEnqContracts.ContractNo;`)
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


router.route("/asuc").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblASUCType.ASUCType, tblASUCType.ASUCTypeID, tblASUCType.Old
    FROM tblASUCType
    ORDER BY tblASUCType.Old;
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

router.route("/contractV").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT qryEnqContracts.ContractNo, qryEnqContracts.FullAddress, qryEnqContracts.EnquiryID
    FROM qryEnqContracts INNER JOIN tblValSched ON qryEnqContracts.EnquiryID = tblValSched.EnquiryID
    ORDER BY qryEnqContracts.ContractNo;    
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

router.route("/desginV").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qryEnqContracts.ContractNo, qryEnqContracts.Address, qryEnqContracts.EnquiryID
    FROM qryEnqContracts
    ORDER BY qryEnqContracts.ContractNo DESC;
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

router.route("/contractT").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblContraChargeType.ContraType, tblContraChargeType.ContraTypeID
    FROM tblContraChargeType
    ORDER BY tblContraChargeType.ContraType;        
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


router.route("/rigPlant").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPileRigs.RigNo, tblPileRigs.RigType, tblPileRigs.RigTypeID, COALESCE([Obsolete], 0) AS Old FROM tblPileRigs ORDER BY COALESCE([Obsolete], 0), tblPileRigs.RigManufacturer, tblPileRigs.RigType, tblPileRigs.RigNo;`)
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

router.route("/contractPlant").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblEnquiries.ContractNo, ISNULL(tblEnquiries.EnqName,tblEnquiries.Address) AS Address, tblEnquiries.EnquiryID, tblContractStatus.ContStatus, CASE WHEN tblEnquiries.ContractStatus=2 THEN 1 ELSE 0 END AS Status, tblEnquiries.DivisionID FROM tblEnquiries LEFT JOIN tblContractStatus ON tblEnquiries.ContractStatus = tblContractStatus.StatusID WHERE (tblEnquiries.Won = 1 AND LEFT(ContractNo,1)<>'C' AND tblEnquiries.Saved = 1 AND tblEnquiries.Deleted = 0) ORDER BY CASE WHEN tblEnquiries.ContractStatus=2 THEN 1 ELSE 0 END DESC , tblEnquiries.ContractStatus, tblEnquiries.ContractNo;`)
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

router.route("/fitter").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT CONCAT(FirstName, ' ', Surname) AS EngineerName, tblEmployees.EmployeeID, tblEmployees.WinLogin, tblEmployees.Dormant FROM tblEmployees WHERE COALESCE(YardYN, 0) = 1 AND FirstName IS NOT NULL ORDER BY tblEmployees.Dormant DESC, CONCAT(FirstName, ' ', Surname);`)
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

router.route("/t_o_f").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT a.CheckDescription, a.CheckID, tblCheckList.CheckList, a.CheckTypeID, ISNULL(a.HeaderOrder,b.HeaderOrder) AS HeaderOrder, a.LineOrder FROM ((tblChecklistQuestions AS a LEFT JOIN tblCheckListQuestions AS b ON a.HeaderID = b.CheckID) INNER JOIN tblRigDefects ON a.CheckID = tblRigDefects.CheckID) LEFT JOIN tblCheckList ON a.CheckTypeID = tblCheckList.CheckTypeID ORDER BY a.CheckTypeID, ISNULL(a.HeaderOrder,b.HeaderOrder), a.LineOrder;`)
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

router.route("/t_o_w").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblRigDefectType.DefectType, tblRigDefectType.DefectTypeID
    FROM tblRigDefectType;
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

router.route("/priority").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCheckListPriority.PriorityID, tblCheckListPriority.Priority
    FROM tblCheckListPriority;
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


router.route("/checklistType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCheckList.CheckList, tblCheckList.Comments, tblCheckList.Old, tblCheckList.CheckTypeID
    FROM tblCheckList
    ORDER BY tblCheckList.CheckList;
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




router.route("/plantClass").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPlantClass.PlantClass, tblPlantClass.ClassID
    FROM tblPlantClass;
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

router.route("/ownedBy").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT OwnedBy FROM tblPileRigs WHERE OwnedBy IS NOT NULL ORDER BY OwnedBy;`)
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

router.route("/group").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCompanyGroups.GroupName, tblCompanyGroups.GroupID, COUNT(tblCompanies.CompanyID) AS Companies FROM tblCompanyGroups LEFT JOIN tblCompanies ON tblCompanies.GroupID = tblCompanyGroups.GroupID WHERE tblCompanies.[CompanyName] IS NOT NULL GROUP BY tblCompanyGroups.GroupName, tblCompanyGroups.GroupID ORDER BY tblCompanyGroups.GroupName;`)
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

router.route("/cCategory").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblCompanyCategories.CompanyCategory, tblCompanyCategories.ID, COUNT(tblCompanies.CompanyID) AS Companies FROM (tblCompanyCategories LEFT JOIN tblCompaniesCategories ON tblCompanyCategories.ID = tblCompaniesCategories.CategoryID) LEFT JOIN tblCompanies ON tblCompaniesCategories.CompanyID = tblCompanies.CompanyID GROUP BY tblCompanyCategories.CompanyCategory, tblCompanyCategories.ID ORDER BY tblCompanyCategories.CompanyCategory;`)
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

router.route("/accountM").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qryEmployees.EmployeeFullName AS AccountMgr, qryEmployees.EmployeeID, COUNT(tblCompanies.CompanyID) AS Companies FROM qryEmployees INNER JOIN tblCompanies ON qryEmployees.EmployeeID = tblCompanies.AccountMgrID WHERE tblCompanies.Dormant = 0 GROUP BY qryEmployees.EmployeeFullName, qryEmployees.EmployeeID;`)
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

router.route("/chaseBy").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT FirstName + ' ' + Surname AS ChaseBy, tblEmployees.EmployeeID, COUNT(tblCompanies.CompanyID) AS Companies FROM tblEmployees INNER JOIN tblCompanies ON tblEmployees.EmployeeID = tblCompanies.NextChaseBy  GROUP BY FirstName + ' ' + Surname, tblEmployees.EmployeeID ORDER BY FirstName + ' ' + Surname;`)
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

router.route("/campaign").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblMailshots.MailshotRef AS Ref, Format(tblMailshots.MailshotDate,'dd/mm/yy') AS [Date], tblMailshots.MailshotNotes AS Notes, CASE WHEN [tblMailshots].[MailshotSent]=1 THEN 'Y' ELSE 'N' END AS Complete, tblMailshots.MailshotID FROM tblMailshots;`)
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

router.route("/market").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblM_Market.Market, tblM_Market.MarketID, COUNT(tblCompanies.CompanyID) AS Companies FROM tblM_Market LEFT JOIN tblCompaniesMarkets ON tblM_Market.MarketID = tblCompaniesMarkets.M_MarketID LEFT JOIN tblCompanies ON tblCompaniesMarkets.CompanyID = tblCompanies.CompanyID GROUP BY tblM_Market.Market, tblM_Market.MarketID ORDER BY tblM_Market.Market;`)
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

router.route("/companiesType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCompanyTypes.CompanyType, tblCompanyTypes.ID FROM tblCompanyTypes ORDER BY tblCompanyTypes.CompanyType ASC;`)
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

router.route("/targetType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblContactMarketingLevels.MarketingLevel, tblContactMarketingLevels.MarketingLevelID
    FROM tblContactMarketingLevels
    ORDER BY tblContactMarketingLevels.MarketingLevel;
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


router.route("/tasksType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT tblVehicleDateType.DateType, tblVehicleDateType.DateTypeID
    FROM tblVehicleDateType
    ORDER BY tblVehicleDateType.DateType;`)
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


router.route("/itemType").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblCompanyPropertyType.ItemType, tblCompanyPropertyType.ItemTypeID
    FROM tblCompanyPropertyType
    ORDER BY tblCompanyPropertyType.ItemType;`)
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


router.route("/estimator").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT DISTINCT
    FirstName + ' ' + Surname AS EngineerName,
    tblEmployees.EmployeeID,
    tblEmployees.WinLogin,
    tblEmployees.EmailAddress,
    tblEmployees.Dormant
  FROM tblEmployees
  WHERE ISNULL([OfficeYN], 0) = 1
    AND tblEmployees.[FirstName] IS NOT NULL
  ORDER BY tblEmployees.Dormant DESC, FirstName + ' ' + Surname;`)
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


router.route("/rigPriced").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPileRigs.RigType, tblPileRigs.RigNo, tblPileRigs.RigTypeID, IIF([Obsolete] = 0, 'N', 'Y') AS Old, tblPileRigs.RigID
    FROM tblPileRigs
    WHERE tblPileRigs.ClassID = 1 AND tblPileRigs.HireRig = 0
    ORDER BY IIF([Obsolete] = 0, 'N', 'Y'), tblPileRigs.RigType;
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

router.route("/concreteDeliveries").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblConcDetail.*, tblPileLogs.EnquiryID, tblPileLogs.RigNo, tblPileLogs.LogDate
    FROM tblConcDetail
    INNER JOIN tblPileLogs ON tblConcDetail.PileLogID = tblPileLogs.PileLogID
    WHERE tblPileLogs.EnquiryID = ${EnquiryID}
    ORDER BY tblPileLogs.LogDate DESC;
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

router.route("/externalOperatives").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT
    a.*,
    tblPileLogs.LogDate,
    tblPileLogs.EnquiryID,
    tblPileLogs.RigNo,
    date_calendar.first_day_in_week + 1 AS WkComm,
    CASE WHEN ISNULL(a.WorkHours, 0) > ISNULL(tblEmployees.StandardHours, 0) THEN tblEmployees.StandardHours ELSE a.WorkHours END AS BasicHours2,
    CASE WHEN ISNULL(a.WorkHours, 0) > ISNULL(tblEmployees.StandardHours, 0) THEN ISNULL(a.WorkHours, 0) - ISNULL(tblEmployees.StandardHours, 0) ELSE 0 END AS OvertimeHours2
FROM
    (tblPileLogPeople AS a
    INNER JOIN tblPileLogs ON a.PileLogID = tblPileLogs.PileLogID)
    INNER JOIN date_calendar ON tblPileLogs.LogDate = date_calendar.calendar_date
    INNER JOIN tblEmployees ON a.EmployeeID = tblEmployees.EmployeeID
WHERE
    a.EmployeeID = 8271 AND tblPileLogs.EnquiryID = ${EnquiryID}
ORDER BY
    tblPileLogs.LogDate DESC;
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

router.route("/valuationSummary").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryValuationSummary
    WHERE qryValuationSummary.EnquiryID = ${EnquiryID};
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

router.route("/standingTimeAnalysis").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT 
    tblStandingTimeAnalysis.*, 
    AnalysisHours * AnalysisRate AS AnalysisCost
FROM 
    tblStandingTimeAnalysis
WHERE 
    ISNULL(tblStandingTimeAnalysis.StandingTime, 0) <> 0 AND tblStandingTimeAnalysis.EnquiryID = ${EnquiryID}
ORDER BY 
    tblStandingTimeAnalysis.LogDate;
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

router.route("/subcontract").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM tblSubbieOrder      
    WHERE tblSubbieOrder.EnquiryID = ${EnquiryID};
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



router.route("/subContractSummary").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qrySubbieOrderSummary.*, qrySubbieSupplier.CompanyName AS Name, qryEmployees.EmployeeFullName
    FROM qrySubbieOrderSummary LEFT JOIN qrySubbieSupplier ON qrySubbieOrderSummary.SubbieCode = qrySubbieSupplier.CompanyID
    LEFT JOIN qryEmployees ON qryEmployees.EmployeeID = qrySubbieSupplier.ManagerID
    WHERE qrySubbieOrderSummary.EnquiryID = ${EnquiryID};
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




router.route("/saleValuation").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryValSched
    WHERE qryValSched.[DeleteYN] = 0 AND qryValSched.EnqID = ${EnquiryID}
    ORDER BY qryValSched.DeleteYN, qryValSched.ValSchedID;
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


router.route("/loadCases").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblPileCages.ID,
    tblPileCages.EnquiryID,
    tblPileCages.CageRef,
    tblPileCages.Cage1Count,
    tblPileCages.Cage1Diam,
    tblPileCages.Cage1Grade,
    tblPileCages.Cage1Length,
    tblPileCages.Cage1LinkDiam,
    tblPileCages.Cage1LinkGrade,
    tblPileCages.Cage1LinkPitch,
    tblPileCages.Cage1LinkTypeID,
    tblPileCages.Cage2Count,
    tblPileCages.Cage2Diam,
    tblPileCages.Cage2Grade,
    tblPileCages.Cage2Length,
    tblPileCages.Cage2LinkDiam,
    tblPileCages.Cage2LinkGrade,
    tblPileCages.Cage2LinkPitch,
    tblPileCages.Cage2LinkTypeID,
    tblPileCages.SWLMax,
    tblPileCages.SWLMin,
    tblPileCages.TensionMax,
    tblPileCages.TensionMin,
    tblPileCages.ShearMax,
    tblPileCages.ShearMin,
    tblPileCages.ConcStrength,
    COUNT(tblPileSched.PileNo) AS CountPiles,
    ROUND(AVG(tblPileSched.Length), 1) AS AverageLength,
    tblPileCages.PileDiam,
    tblPileCages.PilesPerDay,
    tblPileCages.DefaultRate
FROM
    tblPileCages
INNER JOIN
    tblPileSched ON tblPileCages.EnquiryID = tblPileSched.EnquiryID
    AND tblPileCages.CageRef = tblPileSched.CageType
    AND tblPileCages.PileDiam = tblPileSched.Diameter
    WHERE tblPileCages.EnquiryID = ${EnquiryID}
GROUP BY
    tblPileCages.ID,
    tblPileCages.EnquiryID,
    tblPileCages.CageRef,
    tblPileCages.Cage1Count,
    tblPileCages.Cage1Diam,
    tblPileCages.Cage1Grade,
    tblPileCages.Cage1Length,
    tblPileCages.Cage1LinkDiam,
    tblPileCages.Cage1LinkGrade,
    tblPileCages.Cage1LinkPitch,
    tblPileCages.Cage1LinkTypeID,
    tblPileCages.Cage2Count,
    tblPileCages.Cage2Diam,
    tblPileCages.Cage2Grade,
    tblPileCages.Cage2Length,
    tblPileCages.Cage2LinkDiam,
    tblPileCages.Cage2LinkGrade,
    tblPileCages.Cage2LinkPitch,
    tblPileCages.Cage2LinkTypeID,
    tblPileCages.SWLMax,
    tblPileCages.SWLMin,
    tblPileCages.TensionMax,
    tblPileCages.TensionMin,
    tblPileCages.ShearMax,
    tblPileCages.ShearMin,
    tblPileCages.ConcStrength,
    tblPileCages.PileDiam,
    tblPileCages.PilesPerDay,
    tblPileCages.DefaultRate
;
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

router.route("/jobLogByDate").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT qryPileLogDetailsFull2.RigNo,
    qryPileLogDetailsFull2.LogDate,
    qryPileLogDetailsFull2.ContractNo,
    qryPileLogDetailsFull2.EnqName,
    qryPileLogDetailsFull2.FullAddress,
    qryPileLogDetailsFull2.ConcVolume,
    qryPileLogDetailsFull2.Notes,
    qryPileLogDetailsFull2.PileNo,
    CAST(ISNULL(qryPileLogDetailsFull2.PileLength, 0) AS FLOAT) AS PileLength,
    qryPileLogDetailsFull2.ConcRateCont,
    qryPileLogDetailsFull2.ConcTheory,
    CAST(ISNULL(qryPileLogDetailsFull2.Length, 0) AS FLOAT) AS Length,
    qryPileLogDetailsFull2.Diameter,
    CAST(qryPileLogDetailsFull2.SteelWeight AS FLOAT) AS SteelWeight,
    qryPileLogDetailsFull2.Reinforcement
FROM
    qryPileLogDetailsFull2
    WHERE qryPileLogDetailsFull2.EnquiryID = ${EnquiryID};`)
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



router.route("/jobLogByPhase").post(async (req, res) => {
  try {
    let ContractNo = req.body['ContractNo'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 20 qryPileSchedLogDetailsJob.ContractNo,
    qryPileSchedLogDetailsJob.EnqName,
    qryPileSchedLogDetailsJob.FullAddress,
    qryPileSchedLogDetailsJob.RigNo,
    qryPileSchedLogDetailsJob.LogDate,
    qryPileSchedLogDetailsJob.Notes,
    qryPileSchedLogDetailsJob.PileNo,
    qryPileSchedLogDetailsJob.AreaRef,
    qryPileSchedLogDetailsJob.Diameter,
    CAST(qryPileSchedLogDetailsJob.Length AS FLOAT) AS Length,
    CAST(ISNULL(qryPileSchedLogDetailsJob.PileLength, 0) AS FLOAT) AS PileLength,
    qryPileSchedLogDetailsJob.Status,
    qryPileSchedLogDetailsJob.ReportDate,
    qryPileSchedLogDetailsJob.ReportNo,
    qryPileSchedLogDetailsJob.PileOK,
    qryPileSchedLogDetailsJob.TestStatus
    FROM
    qryPileSchedLogDetailsJob
    WHERE qryPileSchedLogDetailsJob.ContractNo = '${ContractNo}' ;
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


router.route("/jobLogByCage").post(async (req, res) => {
  try {
    let ContractNo = req.body['ContractNo'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  qryPileSchedLogDetailsJob.ContractNo,
    qryPileSchedLogDetailsJob.EnqName,
    qryPileSchedLogDetailsJob.FullAddress,
    qryPileSchedLogDetailsJob.RigNo,
    qryPileSchedLogDetailsJob.LogDate,
    qryPileSchedLogDetailsJob.Notes,
    qryPileSchedLogDetailsJob.PileNo,
    qryPileSchedLogDetailsJob.AreaRef,
    qryPileSchedLogDetailsJob.Diameter,
    CAST(qryPileSchedLogDetailsJob.Length AS FLOAT) AS Length,
    CAST(ISNULL(qryPileSchedLogDetailsJob.PileLength, 0) AS FLOAT) AS PileLength,
    qryPileSchedLogDetailsJob.Status,
    qryPileSchedLogDetailsJob.CageType
    FROM
    qryPileSchedLogDetailsJob
    WHERE qryPileSchedLogDetailsJob.ContractNo = '${ContractNo}' ;`)
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


router.route("/scheduleHistory").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryPileSchedAll
    WHERE qryPileSchedAll.EnquiryID = ${EnquiryID};`)
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


router.route("/costPlanningSummary").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT 
    CASE 
        WHEN CostPlan = -1 THEN 'Cost Plan'
        WHEN VariationID IS NULL THEN 'Startup'
        ELSE 'Variation'
    END AS StartupType,
    *
FROM tblStartup
WHERE ISNULL(Cancel, 0) = 0 AND tblStartup.EnquiryID = ${EnquiryID}
ORDER BY 
    CASE 
        WHEN VariationID IS NULL THEN 
            CASE 
                WHEN CostPlan = -1 THEN StartupParentID
                ELSE StartupID
            END
        ELSE StartupParentID
    END,
    tblStartup.StartupID,
    tblStartup.StartupDate;
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


router.route("/enquiryTender").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT 
    CONVERT(VARCHAR, tblEnquiryTenders.EnquiryID) + '-' + CONVERT(VARCHAR, tblEnquiryTenders.CompanyID) AS EnqCo,
    ROUND(tblEnquiryTenders.TenderValue * tblEnquiryTenders.GrossMargin / 100, 2) AS GrossProfit,
    ROUND(tblEnquiryTenders.TenderValue - (tblEnquiryTenders.TenderValue * tblEnquiryTenders.GrossMargin / 100), 2) AS TenderCost,
    tblEnquiryTenders.*,
    RIGHT(tblEnquiryTenders.AddedBy, LEN(tblEnquiryTenders.AddedBy) - CHARINDEX('\', tblEnquiryTenders.AddedBy)) AS AddedByTender
FROM tblEnquiryTenders
WHERE tblEnquiryTenders.Deleted = 0 AND tblEnquiryTenders.EnquiryID = ${EnquiryID}
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

router.route("/concreteTotal").post(async (req, res) => {
  try {
   
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM tblPileLogs
    ;
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




router.route("/commercialLog").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *, tblLogType.LogType AS LogTypeInfo
    FROM tblLog
    LEFT JOIN tblLogType ON tblLog.LogTypeID = tblLogType.LogTypeID
    WHERE ISNULL([Cancel], 0) = 0 AND tblLog.EnquiryID = ${EnquiryID}
    ORDER BY tblLog.LogID;
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

router.route("/commercialLogSub").post(async (req, res) => {
  try {
    let LogID = req.body['LogID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblLogDetail.*, tblLogItem.Description
    FROM tblLogItem
    INNER JOIN tblLogDetail ON tblLogItem.LogItemID = tblLogDetail.LogItemID
    WHERE tblLogItem.LogID = ${LogID}
    ORDER BY tblLogItem.ListOrder;
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

router.route("/commercialLogHistory").post(async (req, res) => {
  try {
    let LogID = req.body['LogID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT tblLogHistory.*
    FROM tblLogHistory
    WHERE tblLogHistory.LogID = ${LogID}
    ORDER BY tblLogHistory.CommentDate DESC;`)
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






router.route("/jobContact").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT 
    tblJobContacts.JobContactID,
    tblJobContacts.EnquiryID,
    tblJobContacts.ContactCoID,
    tblJobContacts.ContactID,
    tblJobContacts.ContactTitle,
    ISNULL(tblContacts.FirstName, ISNULL(tblContacts.Initials, '')) + ' ' + ISNULL(tblContacts.Surname, '') AS FullName,
	tblContacts.ContactID, tblContacts.Telephone, tblContacts.Mobile, tblContacts.Email,
    tblCompanies.CompanyName + '-' + ISNULL(tblCompanies.OfficeName, '') AS Company,
	tblJobContactTypes.ContactType
FROM 
    tblJobContacts
LEFT JOIN 
    tblContacts ON tblJobContacts.ContactID = tblContacts.ContactID
LEFT JOIN 
    tblCompanies ON tblJobContacts.ContactCoID = tblCompanies.CompanyID
	LEFT JOIN 
    tblJobContactTypes ON tblJobContacts.ContactTitle = tblJobContactTypes.ContactTypeID
    WHERE tblJobContacts.EnquiryID = ${EnquiryID};
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


router.route("/attendanceWork").post(async (req, res) => {
  try {
    let EnquiryID = req.body['EnquiryID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT * 
    FROM tblContractAttendantWorks LEFT JOIN tblWorksTypes ON tblContractAttendantWorks.WorksTypeID =  tblWorksTypes.ID
    LEFT JOIN tblWorksBy ON tblContractAttendantWorks.WorksByID =  tblWorksBy.ID
    WHERE tblContractAttendantWorks.EnquiryID = ${EnquiryID};`)
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

router.route("/preContractASUC").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM qryEnquiryASUC
    WHERE qryEnquiryASUC.EnquiryID = ${EnquiryID};`)
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

router.route("/commercialSub").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    console.log(req.body);
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT *
    FROM tblCommercialHistory
    WHERE tblCommercialHistory.EnquiryID = ${EnquiryID}
    ORDER BY tblCommercialHistory.CommentDate DESC;`)
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

router.route("/commercial").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  *
    FROM qryEnquiryCommercial
    WHERE qryEnquiryCommercial.EnquiryID = ${EnquiryID};
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


router.route("/workingTime").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  subquery.*,
    RIGHT('00' + CONVERT(VARCHAR, subquery.WorkHr), 2) + ':' + RIGHT('00' + CONVERT(VARCHAR, subquery.WorkMin), 2) AS WorkHours,
    RIGHT('00' + CONVERT(VARCHAR, subquery.TotHr), 2) + ':' + RIGHT('00' + CONVERT(VARCHAR, subquery.TotMin), 2) AS TotHours
FROM (
    SELECT
        tblWorkingTime.*,
        DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) AS WorkMinutes,
        CASE WHEN ISNULL(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])), 0) <> 0
            THEN CAST(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) / 60 AS INT)
            ELSE '' END AS WorkHr,
        CASE WHEN ISNULL(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])), 0) <> 0
            THEN DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) - (CAST(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) / 60 AS INT) * 60)
            ELSE '' END AS WorkMin,
        DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0) AS TotMinutes,
        CASE WHEN ISNULL(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0), 0) <> 0
            THEN CAST((DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0)) / 60 AS INT)
            ELSE '' END AS TotHr,
        CASE WHEN ISNULL(DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0), 0) <> 0
            THEN (DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0)) - (CAST((DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) + ISNULL(tblWorkingTime.[TravelTime], 0)) / 60 AS INT) * 60)
            ELSE '' END AS TotMin,
        CASE WHEN DATEDIFF(MINUTE, tblWorkingTime.[TimeIn], DATEADD(HOUR, IIF(tblWorkingTime.NightShift = -1, 24, 0), tblWorkingTime.[TimeOut])) < 12 * 60
            THEN 'N'
            ELSE 'Y' END AS ShiftNotOK,
        qryWorkingTimeBreaks.BreakLength,
        qryWorkingTimeBreaks.BreakHours,
        CONCAT(tblEmployees.FirstName, ' ', ISNULL(tblEmployees.Surname, '')) AS Name,
        tblWorkingTimeType.TransportType,
        tblWorkingTimeMode.Mode
    FROM
        tblWorkingTime
        LEFT JOIN qryWorkingTimeBreaks ON tblWorkingTime.ID = qryWorkingTimeBreaks.ID
        LEFT JOIN tblEmployees ON tblWorkingTime.EmployeeID = tblEmployees.EmployeeID
        LEFT JOIN  tblWorkingTimeType ON tblWorkingTime.TypeID =  tblWorkingTimeType.TypeID
        LEFT JOIN  tblWorkingTimeMode ON tblWorkingTime.ModeID =  tblWorkingTimeMode.ModeID
        
        WHERE tblWorkingTime.EnquiryID = ${EnquiryID}
) AS subquery
ORDER BY
    subquery.WorkDate;
`);
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



router.route("/pillingS").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  *
    FROM qryEnqPileSummary
    WHERE qryEnqPileSummary.EnquiryID = ${EnquiryID};`)
    res.status(200).json({
      data: result.recordsets[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'falses'
    });
  }
});


router.route("/contractCost").post(async (req, res) => {
  try {
    let NumberOnly = req.body['NumberOnly'];
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  E_cltran.cltserial, E_cltran.cltcode, E_cltran.cltchd, E_cltran.cltopn, E_cltran.cltperiod,
    E_cltran.cltdate, E_cltran.cltmod, E_cltran.cltbatch, E_cltran.cltcount, E_cltran.clttype,
    E_cltran.cltref1, E_cltran.cltref2, E_cltran.cltnotes, E_cltran.cltval,
    CAST(E_cltran.cltval AS float) AS cltval2, E_cltran.cltqty, E_cltran.cltsser,
    E_cltran.cltscode, E_cltran.clttoday, E_cltran.cltusser, E_cltran.cltubatch,
    E_cltran.cltcposn, E_cltran.cltcperiod, E_cltran.cltvallc, E_cltran.cltcurr,
    E_cltran.cltxrate, E_cltran.cltfromco, E_cltran.clttoco, E_cltran.cltvalno,
    E_cltran.cltpono, E_cltran.clcname, E_cltran.Grp, E_cltran.Cat, E_cltran.Division,
    E_cltran.NumberOnly, E_cltran.Recharge, E_cltran.Sales, E_cltran.Supplier
FROM E_cltran WHERE ISNUMERIC(E_cltran.NumberOnly) = 1 AND
E_cltran.NumberOnly = ${NumberOnly};
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

router.route("/contractCostR").post(async (req, res) => {
  try {
    let NumberOnly = req.body['NumberOnly'];
 
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  E_cltran.cltserial, E_cltran.cltcode, E_cltran.cltchd, E_cltran.cltopn, E_cltran.cltperiod,
    E_cltran.cltdate, E_cltran.cltmod, E_cltran.cltbatch, E_cltran.cltcount, E_cltran.clttype,
    E_cltran.cltref1, E_cltran.cltref2, E_cltran.cltnotes, E_cltran.cltval,
    CAST(E_cltran.cltval AS float) AS cltval2, E_cltran.cltqty, E_cltran.cltsser,
    E_cltran.cltscode, E_cltran.clttoday, E_cltran.cltusser, E_cltran.cltubatch,
    E_cltran.cltcposn, E_cltran.cltcperiod, E_cltran.cltvallc, E_cltran.cltcurr,
    E_cltran.cltxrate, E_cltran.cltfromco, E_cltran.clttoco, E_cltran.cltvalno,
    E_cltran.cltpono, E_cltran.clcname, E_cltran.Grp, E_cltran.Cat, E_cltran.Division,
    E_cltran.NumberOnly, E_cltran.Recharge, E_cltran.Sales, E_cltran.Supplier
FROM E_cltran
WHERE 
    E_cltran.Recharge = 'Y' AND ISNUMERIC(E_cltran.NumberOnly) = 1 AND
    E_cltran.NumberOnly = ${NumberOnly};
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


router.route("/purchaseOrder").post(async (req, res) => {
  try {
    const NumberOnly = req.body['NumberOnly'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT 
    E_poline.OrderNo,
    E_poline.pohcode,
    E_poline.pohserial,
    E_poline.pohsupply,
    E_poline.pohtype,
    E_poline.pohverno,
    E_poline.pohcopy,
    E_poline.pohclaser,
    E_poline.pohcon,
    E_poline.pohstsser,
    E_poline.pohstore,
    E_poline.pohbuyer,
    E_poline.pohplaser,
    E_poline.pohsup,
    E_poline.pohpld,
    E_poline.pohdel,
    E_poline.pohsjser,
    E_poline.pohsjob,
    E_poline.pohopn,
    E_poline.pohorddate,
    E_poline.pohdeldate,
    E_poline.pohreq,
    E_poline.pohdispatch,
    E_poline.pohfax,
    E_poline.pohemail,
    E_poline.pohmemohead,
    E_poline.pohmemofoot,
    E_poline.pohstatus,
    E_poline.pohdstatus,
    E_poline.pohlastline,
    E_poline.pohlines,
    E_poline.pohtotal,
    E_poline.pohdelval,
    E_poline.pohinv,
    E_poline.pohact,
    E_poline.pohdatemod,
    E_poline.pohscaser,
    E_poline.pohscacode,
    E_poline.pohtoco,
    E_poline.poholyn,
    E_poline.pohfromco,
    E_poline.pohdelco,
    E_poline.pohxrate,
    E_poline.pohudt1,
    E_poline.pohudt2,
    E_poline.pohudt3,
    E_poline.pohudt4,
    E_poline.pohudt5,
    E_poline.pohudt6,
    E_poline.pohudt7,
    E_poline.pohudt8,
    E_poline.pohudy1,
    E_poline.pohudy2,
    E_poline.pohudy3,
    E_poline.pohudy4,
    E_poline.pohudy5,
    E_poline.pohudy6,
    E_poline.pohudy7,
    E_poline.pohudy8,
    E_poline.pohudc1,
    E_poline.pohudc2,
    E_poline.pohudc3,
    E_poline.pohudc4,
    E_poline.pohudc5,
    E_poline.pohudd1,
    E_poline.pohudd2,
    E_poline.pohudd3,
    E_poline.pohudd4,
    E_poline.pohudd5,
    E_poline.pohpoastatus,
    E_poline.pohpoarqdate,
    E_poline.pohpoarqsyiser,
    E_poline.pohpoaarjdate,
    E_poline.pohpoaarjsyiser,
    E_poline.pohpoarjnotes,
    E_poline.pohsubnum,
    E_poline.pohsubpref,
    E_poline.pohsubsuff,
    E_poline.pohsubcoffno,
    E_poline.pohphdelclaser,
    E_poline.pohphdelclacon,
    E_poline.pohphlser,
    E_poline.pohcoffs,
    E_poline.pohbulkser,
    E_poline.pohptype,
    E_poline.pohtendcode,
    E_poline.pohtendrtndate,
    E_poline.pohtendtrade,
    E_poline.pohdeltime,
    E_poline.polcode,
    E_poline.polpohser,
    E_poline.polline,
    E_poline.polseq,
    E_poline.poltype,
    E_poline.polstaser,
    E_poline.polprod,
    E_poline.polsttser,
    E_poline.polname,
    E_poline.poldesc,
    E_poline.polsjser,
    E_poline.polsjob,
    E_poline.polopn,
    E_poline.polchd,
    E_poline.polorunit,
    ROUND(CAST(E_poline.polorqty AS decimal(18, 3)), 3) AS polorqty,
    E_poline.polmeunit,
    E_poline.poldim,
    E_poline.poldim1,
    E_poline.poldim2,
    E_poline.poldim3,
    E_poline.polmeqty,
    E_poline.polbaunit,
    CAST(polqty AS decimal(18, 0)) AS polqty,
    E_poline.polprunit,
    CAST(E_poline.polprice AS float) AS polprice,
    E_poline.polgross,
    E_poline.poldiscp1,
    E_poline.poldiscp2,
    E_poline.poldiscp3,
    E_poline.poldiscp4,
    E_poline.poldiscp5,
    E_poline.poldisc,
    CAST(E_poline.polval AS float) AS polval,
    E_poline.polvc,
    E_poline.polvat,
    E_poline.polpconv,
    CAST(E_poline.poluprice AS float) AS poluprice,
    E_poline.poldeldate,
    E_poline.polanalg,
    ROUND(CAST(E_poline.poldelqty AS decimal(18, 3)), 3) AS poldelqty,
    CAST(E_poline.poldelval AS float) AS poldelval,
    ROUND(CAST(E_poline.polinvqty AS decimal(18, 3)), 3) AS polinvqty,
    CAST(E_poline.polinvval AS float) AS polinvval,
    E_poline.polactinv,
    E_poline.polstatus,
    E_poline.pololyn,
    E_poline.poldeleted,
    E_poline.polupdprc,
    E_poline.poldec,
    E_poline.polscwser,
    E_poline.polnom,
    E_poline.polstastat,
    E_poline.polhexpdate,
    E_poline.polhenddate,
    E_poline.polcoffqty,
    E_poline.polcoffval,
    E_poline.poltoco,
    E_poline.polclaser,
    E_poline.polclacode,
    E_poline.poldeltime,
    E_poline.poldacton,
    E_poline.poltacton,
    E_poline.poldantoff,
    E_poline.poldactoff,
    E_poline.poltactoff,
    E_poline.polonhireref,
    E_poline.poloffhireref,
    E_poline.poldanton,
    E_poline.poltanton,
    E_poline.polcurrclaser,
    E_poline.polpoentonhireref,
    E_poline.polpoentoffhireref,
    E_poline.polpooledqty,
    E_poline.planame,
    E_poline.Grp,
    E_poline.Cat,
    E_poline.Division,
    E_poline.NumberOnly,
    CAST(E_poline.CommitVal AS float) AS CommitVal,
    CAST(E_poline.CommitOS AS float) AS CommitOS,
    E_poline.OverVal,
    E_poline.UnderVal,
    CAST(E_poline.OverUnder AS float) AS OverUnder,
    E_poline.YearPeriod,
    E_poline.CostCode,
    E_poline.InvDiff
FROM
    E_poline
WHERE
    E_poline.pohstatus <> 'x' AND ISNUMERIC(E_poline.NumberOnly) = 1 AND
    E_poline.NumberOnly = ${NumberOnly};
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

router.route("/contractSales").post(async (req, res) => {
  try {
    const NumberOnly = req.body['NumberOnly'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT  E_sltran.sltcon, E_sltran.sltcode, E_sltran.sltperiod, E_sltran.sltdate, E_sltran.sltbatch, E_sltran.sltcount, E_sltran.slttype, E_sltran.sltcsm, E_sltran.sltref1, E_sltran.sltref2, E_sltran.sltnotes, E_sltran.sltgoods, E_sltran.sltvat, E_sltran.sltdisc, E_sltran.sltretn, E_sltran.sltspare, E_sltran.slttotal, E_sltran.sltout,
    CAST(E_sltran.sltgoods AS DECIMAL(18,2)) AS sltgoods2,
    CAST(E_sltran.sltvat AS DECIMAL(18,2)) AS sltvat2,
    CAST(E_sltran.sltdisc AS DECIMAL(18,2)) AS sltdisc2,
    CAST(E_sltran.sltretn AS DECIMAL(18,2)) AS sltretn2,
    CAST(E_sltran.sltspare AS DECIMAL(18,2)) AS sltspare2,
    CAST(E_sltran.slttotal AS DECIMAL(18,2)) AS slttotal2,
    CAST(E_sltran.sltout AS DECIMAL(18,2)) AS sltout2,
    E_sltran.sltdatedue, E_sltran.sltdatemat, E_sltran.sltpermat, E_sltran.slttoday, E_sltran.sltusser, E_sltran.slaname, E_sltran.csmname, E_sltran.Division, E_sltran.NumberOnly
    FROM E_sltran
    WHERE (((E_sltran.[sltcsm])<>'MEMO')) AND ISNUMERIC(E_sltran.NumberOnly) = 1 AND
    E_sltran.NumberOnly = ${NumberOnly};
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

router.route("/contractSalesAdj").post(async (req, res) => {
  try {
    const NumberOnly = req.body['NumberOnly'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT E_cltran.cltserial, E_cltran.cltcode, E_cltran.cltchd, E_cltran.cltopn, E_cltran.cltperiod, E_cltran.cltdate, E_cltran.cltmod, E_cltran.cltbatch, E_cltran.cltcount, E_cltran.clttype, E_cltran.cltref1, E_cltran.cltref2, E_cltran.cltnotes, E_cltran.cltval,
    CAST(E_cltran.cltval AS DECIMAL(18,2)) AS cltval2,
    E_cltran.cltqty, E_cltran.cltsser, E_cltran.cltscode, E_cltran.clttoday, E_cltran.cltusser, E_cltran.cltubatch, E_cltran.cltcposn, E_cltran.cltcperiod, E_cltran.cltvallc, E_cltran.cltcurr, E_cltran.cltxrate, E_cltran.cltfromco, E_cltran.clttoco, E_cltran.cltvalno, E_cltran.cltpono, E_cltran.clcname, E_cltran.Grp, E_cltran.Cat, E_cltran.Division, E_cltran.NumberOnly, E_cltran.Sales
    FROM E_cltran
    WHERE (((E_cltran.[Recharge])='Y')) AND ISNUMERIC(E_cltran.NumberOnly) = 1 AND
    E_cltran.NumberOnly = ${NumberOnly};
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


////http://localhost:5000/enquiry/documentControl

router.route("/documentControl").get(async (req, res) => {
  try {
    // const NumberOnly = req.body['NumberOnly'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 10 *
      FROM tblContractDocs; 
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

////http://localhost:5000/enquiry/documentControlSub

router.route("/documentControlSub").get(async (req, res) => {
  try {
    // const EnquiryID = req.body['EnquiryID'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 10 *
    FROM tblDocIssues;`)
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


router.route("/revision").post(async (req, res) => {
  try {
    // const EnquiryID = req.body['EnquiryID'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 10 tblDocIssues.DocIssueID, tblDocIssues.DocID AS DocID2, tblDocIssues.DocRevNo, tblDocIssues.DocDate, tblDocIssues.DocDirection, tblDocIssues.MethodID, tblDocIssues.StatusID, tblDocIssues.IssuedByToID, tblContractDocs.EnquiryID, tblContractDocs.DocumentName + '-' + COALESCE(tblContractDocs.DocumentRef, '') AS DocName, qryJobContactsEmployees.ContactName, tblDocMethods.Method, tblDocStatus.Status
    FROM tblDocIssues INNER JOIN tblContractDocs ON tblDocIssues.DocID = tblContractDocs.DocID
    LEFT JOIN qryJobContactsEmployees ON tblDocIssues.IssuedByToID = qryJobContactsEmployees.ContactID
    LEFT JOIN tblDocMethods ON tblDocIssues.MethodID = tblDocMethods.MethodCode
    LEFT JOIN tblDocStatus ON tblDocIssues.StatusID = tblDocStatus.StatusCode;
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



router.route("/documentRegidter").post(async (req, res) => {
  try {
    const EnquiryID = req.body['EnquiryID'];
    
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 70 *
    FROM qryDocumentRegister;`)
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