const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/posts");
});

router.get("/posts", (req, res) => {
  res.render("posts-list");
});

router.get("/new-post", async (req, res) => {
  const [authors] = await db.query("SELECT * FROM authors"); // array destructuring here
  res.render("create-post", { authors: authors });
});

router.post("/posts", async (req, res) => {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title, summary, body, author_id) VALUES (?)",
    [data]
  ); // data needs to be array, will replace question mark. MySql2 package will split into parts, order is important
  res.redirect("/posts");
});

module.exports = router;
