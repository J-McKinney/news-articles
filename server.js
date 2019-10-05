// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Require all models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
// ???Axios VS Request???
// var axios = require("axios");
var request = require("request");
// ???Axios VS Request???
// Request is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.
// request supports both streaming and callback interfaces natively. If you'd like request to return a Promise instead, you can use an alternative interface wrapper for request. These wrappers can be useful if you prefer to work with Promises, or if you'd like to use async/await
// It’s flexible and easy to use, Uses promises to avoid callback hell, It has a nice and simple syntax
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Define port
var port = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// mongoose.connect("mongodb://heroku_hjd2jb8f:6jiuccbv0oth9j8t7odenmj3kd@ds123331.mlab.com:23331/heroku_hjd2jb8f");
mongoose.connect("mongodb://localhost/NewsScraperHW", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Show any mongoose errors
mongoose.connection.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
mongoose.connection.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes

app.get("/", function(req, res) {
  Article.find({ saved: false }, function(error, data) {
    var hbsObject = {
      article: data
    };
    // console.log(hbsObject);
    res.render("home", hbsObject);
  });
});

app.get("/saved", function(req, res) {
  Article.find({ saved: true })
    .populate("notes")
    .exec(function(error, articles) {
      var hbsObject = {
        article: articles
      };
      res.render("saved", hbsObject);
    });
});

app.get("/scrape", function(req, res) {
  request("https://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article").each(function(i, element) {
      var result = {};
      summary = "";
      if ($(this).find("ul").length) {
        summary = $(this)
          .find("li")
          .first()
          .text();
      } else {
        summary = $(this)
          .find("p")
          .text();
      }
      result.title = $(this)
        .find("h2")
        .text();
      result.summary = summary;
      result.link =
        "https://www.nytimes.com" +
        $(this)
          .find("a")
          .attr("href");
      var entry = new Article(result);
      entry.save(function(err, doc) {
        if (err) {
          // console.log(err);
        } else {
          // console.log(doc);
        }
      });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      // console.log(error);
    } else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ _id: req.params.id })
    .populate("note")
    .exec(function(error, doc) {
      if (error) {
        // console.log(error);
      } else {
        res.json(doc);
      }
    });
});

app.post("/articles/save/:id", function(req, res) {
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }).exec(
    function(err, doc) {
      if (err) {
        // console.log(err);
      } else {
        res.send(doc);
      }
    }
  );
});

app.post("/articles/delete/:id", function(req, res) {
  Article.findOneAndUpdate(
    { _id: req.params.id },
    { saved: false, notes: [] }
  ).exec(function(err, doc) {
    if (err) {
      // console.log(err);
    } else {
      res.send(doc);
    }
  });
});

app.post("/notes/save/:id", function(req, res) {
  var newNote = new Note({
    body: req.body.text,
    article: req.params.id
  });
  // console.log(req.body);
  newNote.save(function(error, note) {
    if (error) {
      // console.log(error);
    } else {
      Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: note } }
      ).exec(function(err) {
        if (err) {
          // console.log(err);
          res.send(err);
        } else {
          res.send(note);
        }
      });
    }
  });
});

app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
  Note.findOneAndRemove({ _id: req.params.note_id }, function(err) {
    if (err) {
      // console.log(err);
      res.send(err);
    } else {
      Article.findOneAndUpdate(
        { _id: req.params.article_id },
        { $pull: { notes: req.params.note_id } }
      ).exec(function(err) {
        if (err) {
          // console.log(err);
          res.send(err);
        } else {
          res.send("Note Deleted");
        }
      });
    }
  });
});

app.listen(port, function() {
  console.log("App running on port " + port + " !!!");
});
