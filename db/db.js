const sql = require('mssql/msnodesqlv8')



const sqlConfig = {
  database: 'Able',
  server: 'DESKTOP-EJ6G373',
  driver:"msnodesqlv8",
  options: {
    trustedConnection:true,
  },

};

sql.connect(sqlConfig, function(err){
    if(err){
        console.log(err);
    }
  var con = new sql.Request();

  module.exports = con;

//   con.query('select * from tblchecklistquestionstest', function(err, record) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(record);
//     }
    
//   })

  
});

