// global variables
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
// var path = require("path");
var db = require("./models");
var PORT = 3000;
var app = express();
// middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// Set Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// mongodb connect
// mongoose.connect("mongodb://heroku_hjd2jb8f:6jiuccbv0oth9j8t7odenmj3kd@ds123331.mlab.com:23331/heroku_hjd2jb8f");
mongoose.connect("mongodb://localhost/NewsScraperHW", { useNewUrlParser: true });
// Routes
app.get("/scrape", function(req, res) {
  axios.get("https://www.boredpanda.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("article h2").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      // result.summary = $(this)
      //   .children("p")
      //   .text();
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(error) {
          console.log(error);
        });
    });
    res.send("Scraping Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
