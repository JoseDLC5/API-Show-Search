const express = require("express");
const axios = require("axios");
const app = express();
const tvMaze = "http://api.tvmaze.com/shows";
const static = express.static(__dirname + "/public");

const exphbs = require("express-handlebars");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
  res.render("posts/root", { title: "Show Finder" });
});

app.post("/search", async (req, res) => {
  console.log(req.body);
  if (
    !req.body.searchTerm ||
    typeof req.body.searchTerm != "string" ||
    !req.body.searchTerm.trim()
  ) {
    res.status(400).render("posts/error", {
      title: "Error",
      errors: "Seach Term must be a non-empty string.",
    });
  } else {
    const { data } = await axios.get(
      "http://api.tvmaze.com/search/shows?q=" + req.body.searchTerm
    );
    res.render("posts/found", {
      title: "Shows Found",
      found: data,
      searchTerm: req.body.searchTerm,
    });
  }
});

app.get("/shows/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).render("posts/error", {
      title: "Error",
      errors: "ID must be a positive integer",
    });
  }
  if (parseInt(req.params.id) == req.params.id && parseInt(req.params.id) > 0) {
    try {
      let { data } = await axios.get(tvMaze + "/" + req.params.id);
      data.summary = data.summary
        .replace(/<[^>]*>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      res.render("posts/show", { title: data.name, show: data });
    } catch (error) {
      res.status(404).render("posts/error", {
        title: "Error",
        errors: "Show Not Found",
      });
    }
  } else {
    res.status(400).render("posts/error", {
      title: "Error",
      errors: "ID must be a positive integer",
    });
  }
});

app.get("*", async (req, res) => {
  res.status(404);
});

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
