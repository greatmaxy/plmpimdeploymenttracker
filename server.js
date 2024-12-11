const express = require("express");
const path = require("path");
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static("public"));

// Middleware to parse JSON
app.use(express.json()); 

// API to serve deployments data dynamically
app.get("/api/deployments", (req, res) => {
  const dataFile = req.query.file || "data.json"; // Default to "data.json"
  const filePath = path.join(__dirname, dataFile);

  const data = fs.readFileSync(filePath, 'utf8'); // Read file on every request
  try {
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: "Data file not found" });
  }
});

// Endpoint to get a specific object by primaryKey
app.get("/api/deployments/:primaryKey", (req, res) => {
  const dataFile = "data.json"; // Assuming the file name is constant here
  const filePath = path.join(__dirname, dataFile);
  const primaryKey = req.params.primaryKey;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")); // Parse JSON
    let objectFound = false;
    for(const item of data) {
      if(item.primaryKey === primaryKey) {
        console.log(item);
        res.json(item);
        objectFound=true;
      }
    }
    if(!objectFound)
      res.status(404).json({ error: "Object not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to read or parse the data file" });
  }
});


app.get("/update/:id/", (req, res) => {
  const { id } = req.params; // Access the 'id' parameter from the URL
  // Assuming your HTML files are stored in a 'public' directory
  const filePath = path.join(__dirname, "public", "edit.html");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("An error occurred while serving the HTML file.");
    }
  });
});

app.post("/getUpdatedData", (req, res) => {
  console.log(req);
  const data = req.body;
  console.log(data);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
