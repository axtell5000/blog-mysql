const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/posts");
});

router.get("/posts", async (req, res) => {
  const query = `
    SELECT posts.*, authors.name AS author_name FROM posts 
    INNER JOIN authors ON posts.author_id = authors.id
  `;
  const [posts] = await db.query(query); // query returns an array with 2 items, first item is data sencond item is metadata
  res.render("posts-list", { posts: posts });
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

router.get("/posts/:id", async (req, res) => {
  const query = `
    SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
  `;

  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

// getting details to edit
router.get("/posts/:id/edit", async (req, res) => {
  const query = `
    SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

// updating database with new details
router.post("/posts/:id/edit", async (req, res) => {
  // order matters
  const query = `
    UPDATE posts SET title = ?, summary = ?, body = ?
    WHERE id = ?
  `;
  // order matters
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);

  res.redirect("/posts");
});

module.exports = router;
