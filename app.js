
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(function (req, res, next) {
    console.log(req.method + " " + req.path + " - " + req.ip);
    next();
})

app.get("/api/timestamp/:date_string?", function (req, res) {
    var d;
    var date_string = req.params.date_string;
    
    if (typeof date_string == "undefined") {
        d = new Date();    
    } else if (date_string.indexOf('-') > -1) {
        d = new Date(date_string);
    } else {
        d = new Date(parseInt(req.params.date_string));
    }
    if (isNaN(d.getTime())) {
        res.json({ "error": "Invalid Date" });
    } else {
        res.json({ "unix": d.getTime(), "utc": d.toLocaleString() })
    }
})

var port = 3000;
app.listen(port, function () {
    console.log('Node is listening on port ' + port + '...')
});;


