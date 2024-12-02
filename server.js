const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static("public"));

// API to serve deployments data dynamically
app.get("/api/deployments", (req, res) => {
  const dataFile = req.query.file || "data.json"; // Default to "data.json"
  const filePath = path.join(__dirname, dataFile);

  try {
    const data = require(filePath);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Data file not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
