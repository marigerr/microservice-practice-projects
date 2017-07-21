
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(function (req, res, next) {
    console.log(req.method + " " + req.path + " - " + req.ip);
    next();
})

app.get("/:timestamp", function (req, res) {
    var d;
    var timeString = req.params.timestamp;
    if (timeString.indexOf('-') > -1) {
        d = new Date(timeString);
    } else {
        d = new Date(parseInt(req.params.timestamp));
    }
    if (isNaN(d.getTime())) {
        // d = new Date(); 
        res.json({ "error": "Invalid Date" });
    } else {
        res.json({ "unix": d.getTime(), "utc": d })
    }
})

app.get("/", function (req, res) {
    var d = new Date();
    res.json({"unix" : d.getTime(), "utc": d});
})

var port = 3000;
app.listen(port, function () {
    console.log('Node is listening on port ' + port + '...')
});;


