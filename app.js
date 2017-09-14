require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient
const app = express();

app.set('view engine', 'pug')
app.use('/public', express.static(process.cwd() + '/public'));
app.use(function (req, res, next) {
  // console.log(req.method + " " + req.path + " - " + req.ip);
  next();
}, bodyParser.urlencoded({ extended: false }))

app.get("/", function (req, res) {
  res.render('index.pug');
})

app.get("/api/timestamp", function (req, res) {
  let d;
  const date_string = req.query.date_string;
  if (typeof date_string == "undefined" || date_string == "") {
    d = new Date();
  } else if (date_string.indexOf('-') > -1) {
    d = new Date(date_string);
  } else {
    d = new Date(parseInt(req.query.date_string));
  }
  if (isNaN(d.getTime())) {
    res.json({ "error": "Invalid Date" });
  } else {
    res.json({ "unix": d.getTime(), "utc": d.toISOString(), "Locale string": d.toLocaleString() })
  }
})

app.get("/api/whoami", function (req, res) {
  res.json({ "ip-address": req.ip, "language": req.headers["accept-language"], "software": req.headers["user-agent"] })
})

app.post("/api/shorturl/new", function (req, res) {

  const appUrl = process.env.host + '/su/'
  const originalUrl = req.body.url;

  mongo.connect(process.env.DATABASE, (err, db) => {

    if (err) throw err;

    db.collection("counter").findAndModify(
      { _id: "urlid" },
      null,
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
      function (err, doc) {
        if (err) console.log(err);
        else {
          db.collection("shorturls").findAndModify(
            { url: originalUrl },
            null,
            {
              $setOnInsert: {
                url: originalUrl,
                newurlsuffix: doc.value.seq
              }
            },
            { upsert: true, new: true },
            (err, doc) => {
              const shortenedlink = appUrl + doc.value.newurlsuffix;
              res.render('index.pug', { shortenedlink: shortenedlink });
            }
          )
        }
      }
    );
    // db.close();
  })
})

app.get("/su/:urlsuffix", function (req, res) {

  const urlsuffix = parseInt(req.params.urlsuffix);
  mongo.connect(process.env.DATABASE, (err, db) => {
    db.collection("shorturls").findOne(
      { newurlsuffix: urlsuffix },
      (err, doc) => {
        res.redirect(doc.url)
      }
    )    
  });
});

const port = 3000;
app.listen(port, function () {
  console.log('Node is listening on port ' + port + '...')
});;



/* need to fix url shortener so that it won't increment if not new

    let newCount;
    db.collection("shorturls").findOne(
      { url: originalUrl },
      function(err, doc) {
        console.log(err);
        if (doc) {
          newCount =  await getNextSequence().then((done) => {return done});
          console.log(newCount);
        } 
      }
    )

    function getNextSequence() {
      db.collection("counter").findAndModify(
        { _id: "urlid" },
        null,
        { $inc: { seq: 1 } },
        { upsert: true, new: true },
        function (err, doc) {
          if (err) console.log(err);
          else {
            console.log(doc.value.seq);
            return doc.value.seq;
          }
        }
      )
    }


    db.collection("shorturls").findAndModify(
      { url: originalUrl },
      null,
      {
        $setOnInsert: {
          url: originalUrl,
          newurlsuffix: getNextSequence()
        }
      },
      { upsert: true, new: true },
      (err, doc) => {
        // console.log(doc.value);
        res.json({ "original url": doc.value })
        // return cb(null, doc.value);
      }
      // db.close();
    )
  }
);

*/

