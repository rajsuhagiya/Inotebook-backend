const connectToMongo = require("./db");
const express = require("express");

connectToMongo();

const app = express();
const port = 4000;

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("hello");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
