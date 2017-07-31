
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/apipractice'
var app = express();

app.use(function (req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
}, bodyParser.urlencoded({ extended: false }))

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get("/api/url-shortener", function (req, res) {
  res.sendFile(__dirname + '/url-shorten.html')
})

// app.use(express.static(__dirname + '/public'))

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

app.get("/api/whoami", function (req, res) {
  res.json({ "ip-address": req.ip, "language": req.headers["accept-language"], "software": req.headers["user-agent"] })
})

app.post("/api/shorturl/new", function (req, res) {

  var originalUrl = req.body.url;
  console.log(originalUrl);
  // var shortenedUrlSuffix = getNextSequence("urlid");
  // console.log(originalUrl, shortenedUrlSuffix);

  mongo.connect(url, function (err, db) {

    if (err) throw err;

    function getNextSequence(name) {
      var counters = db.collection("counters");
      var ret = db.counters.findAndModify(
        {
          query: { _id: name },
          update: { $inc: { seq: 1 } },
          new: true
        }
      );
      return ret.seq;
    }


    var coll = db.collection("shorturls");
    coll.insert({
      _id: getNextSequence("urlid"),
      url: originalUrl
    });
    // console.log(JSON.stringify(obj));
    db.close();

  })

  res.json({ "original url": originalUrl })
  // res.json({ "original url": originalUrl, "shortened url": shortenedUrlSuffix })

})



var port = 3000;
app.listen(port, function () {
  console.log('Node is listening on port ' + port + '...')
});;


