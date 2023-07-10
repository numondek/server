const sql = require('mssql/msnodesqlv8')



const sqlConfig1 = {
  database: 'Able',
  server: 'DESKTOP-EJ6G373',
  driver:"msnodesqlv8",
  options: {
    trustedConnection:true,
  },

};

sql.connect(sqlConfig1, function(err){
    if(err){
        console.log(err);
    }
  var con = new sql.Request();

  module.exports = con;
  
});




