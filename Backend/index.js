import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello yange maavu world");
});

app.listen(3000, () => {
  console.log("connected to 3000 port");
});
