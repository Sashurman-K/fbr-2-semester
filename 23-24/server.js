const express = require("express");

const app = express();
const PORT = 3000;

const MESSAGE = process.env.MSG

app.get("/", (req, res) => {
  res.json({
    message: `Response from backend server ${MESSAGE}`,
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});