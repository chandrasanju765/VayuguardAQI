const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "./dist")));

app.use(function (req, res) {
  res.sendFile(path.join(__dirname, "./dist", "index.html"));
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
