const express = require("express");
var db = require('../db/db');
const config = require("../config");
const sql = require('mssql/msnodesqlv8')
require('dotenv').config();
// const jwt = require("jsonwebtoken");
const router = express.Router();
// const { json } = require("body-parser");



router.route("/enqiryViwe").get(async (req, res) => {
  try {
    const con = await sql.connect(db);
    const result = await con.request().query(`SELECT TOP 1000 *
    FROM qryEnquiriesFull
    ORDER BY Len(EnquiryNo) DESC , Right(EnquiryNo,Len(EnquiryNo)-1) DESC;    
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


router.route("/detail").post(async (req, res) => {
  sql.connect(db, function (err) {
    if (err) {
      console.log(err);
    }
    var con = new sql.Request();
    console.log(req.body['EnquiryNo']);

    con.query(`INSERT INTO tblEnquiries (EnquiryNo, EnqName, Address, Town, County, PostCode, EstimatorID, ManagerID, EnquiryTypeID)
      VALUES ('${req.body['EnquiryNo']}', 'John Smith', '123 Main Street', 'London', 'Greater London', 'SW1A 1AA', 123, 456, 789);
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


    con.query(`SELECT FirstName + ' ' + COALESCE(Surname, '') AS Name, tblEmployees.EmployeeID, CASE WHEN COALESCE([OfficeYN],0)=-1 THEN 'Office' WHEN COALESCE([ForemanYN],0)=-1 THEN 'Foreman' ELSE '' END AS Role, tblEmployees.Dormant AS Old FROM tblEmployees WHERE (COALESCE([OfficeYN],0)=-1 AND Surname IS NOT NULL) OR (Surname IS NOT NULL AND COALESCE([ForemanYN],0)=-1) ORDER BY tblEmployees.Dormant DESC, CASE WHEN COALESCE([OfficeYN],0)=-1 THEN 'Office' WHEN COALESCE([ForemanYN],0)=-1 THEN 'Foreman' ELSE '' END, tblEmployees.FirstName;`, function (err, record) {
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


    con.query(`SELECT tblInsuranceTypes.InsuranceType, tblInsuranceTypes.InsuranceDescription, tblInsuranceTypes.InsuranceTypeID
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
    const result = await con.request().query(`SELECT DISTINCT FirstName + ' ' + Surname AS ChaseBy, tblEmployees.EmployeeID, COUNT(tblCompanies.CompanyID) AS Companies FROM tblEmployees INNER JOIN tblCompanies ON tblEmployees.EmployeeID = tblCompanies.NextChaseBy WHERE ISNULL(OfficeYN,0)=-1 GROUP BY FirstName + ' ' + Surname, tblEmployees.EmployeeID ORDER BY FirstName + ' ' + Surname;`)
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

module.exports = router;