const sql = require('mssql/msnodesqlv8');


  const sqlCon = {
    database: 'CheckIt',
    server: 'DESKTOP-EJ6G373',
    driver:"msnodesqlv8",
    options: {
      trustedConnection:true,
    },
  
  };
  
  sql.connect(sqlCon, function(err){
      if(err){
          console.log(err);
      }
    var con1 = new sql.Request();
  
    module.exports = con1;
    
  });
  