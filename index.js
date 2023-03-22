const express = require("express");
const cors = require('cors');
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser")
const app = express();
// const { response } = require("express");
var socketSeverUrl = "";
var hostlive = "http://localhost:5000";

var socket = require('socket.io-client')(socketSeverUrl);
const superagent = require('superagent');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


socket.on('connect', function(){
  console.log("connected");
})

socket.on('disconnect', function(){
  console.log("disconnected");
})


socket.on('page-requst', function(data){
  var path = data.path;
  var mettod = data.mettod;
  var params = data.params;
  console.log('request');

  var localhostUrl  = hostlive + path;
  if(mettod == "get")executeGet(localhostUrl, params);
})


function executeGet(url, params) {
  superagent.get(url).query(params).end((err, response) => {
    if(err){
      socket.emit('page-response', response.text);
    }
  })
}

//middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const stockRoute = require("./routes/stock");
app.use("/stock", stockRoute);
const pilRoute = require("./routes/pilling");
app.use("/pil", pilRoute);
const contractRoute = require("./routes/contract");
app.use("/contract", contractRoute);
const companiesRoute = require("./routes/companies");
app.use("/companies", companiesRoute);
const plantRoute = require("./routes/plant");
app.use("/plant", plantRoute);
const procurementRoute = require("./routes/procure");
app.use("/procure", procurementRoute);
const enquiryRoute = require("./routes/enquiry");
app.use("/enquiry", enquiryRoute);
const trainingRoute = require("./routes/training");
app.use("/training", trainingRoute);



data = {
  info: "This is a franki endpoint",

};

app.route("/").get((req, res) => res.json(data));

app.listen(port, "0.0.0.0", () =>
  console.log(`welcome your listinnig at port ${port}`)
);
