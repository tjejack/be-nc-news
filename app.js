const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api-controllers.js");
const { getTopics } = require("./controllers/topics-controllers.js");

app.use(express.json());

app.get("/api", getEndpoints)
app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint Not Found" });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Something Went Wrong!" });
});

module.exports = app;
