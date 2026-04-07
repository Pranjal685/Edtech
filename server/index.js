const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: require('path').resolve(__dirname, '.env') });

const generateRoute = require("./routes/generate");
const reviewRoute = require("./routes/review");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/generate", generateRoute);
app.use("/api/review", reviewRoute);

app.get("/", (req, res) => {
  res.json({ status: "EdTech Architecture Engine API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
