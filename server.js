const express = require("express");
const path = require("path");
const fs = require("fs");
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

  try {
    const data = fs.readFileSync(filePath, "utf8"); // Read file on every request
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: "Data file not found" });
  }
});

// Endpoint to get a specific object by its key
app.get("/api/deployments/:key", (req, res) => {
  const dataFile = "data.json"; // Assuming the file name is constant here
  const filePath = path.join(__dirname, dataFile);
  const key = req.params.key;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")); // Parse JSON
    if (data.hasOwnProperty(key)) {
      console.log("Reached here");
      console.log(data);
      res.json(data[key]);
    } else {
      res.status(404).json({ error: "Object not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to read or parse the data file" });
  }
});

app.get("/update/:id/", (req, res) => {
  const { id } = req.params; // Access the 'id' parameter from the URL
  const filePath = path.join(__dirname, "public", "edit.html");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("An error occurred while serving the HTML file.");
    }
  });
});

// Example: Serve the create.html file
app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create.html"));
});

app.post("/create", (req, res) => {
  const { week, id } = req.body; // Expect `week` and `id` in the request body
  const dataFile = "data.json"; // Define the JSON file
  const filePath = path.join(__dirname, dataFile);

  if (!week || !id) {
    return res.status(400).json({ error: "Both 'week' and 'id' are required" });
  }

  const primaryKey = `${week}-${id}`;
  
  try {
    // Read the existing data
    const existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Check if the key already exists
    if (existingData.hasOwnProperty(primaryKey)) {
      return res.status(400).json({ error: "Key already exists" });
    }

    const newData = req.body;
    const newObject = {[primaryKey]: newData, ...existingData};

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(newObject, null, 2), "utf8");

    // Respond with success
    res.json({ message: "Object created successfully", key: primaryKey });
  } catch (err) {
    console.error("Error writing to data file:", err);
    res.status(500).json({ error: "Failed to create the object" });
  }
});



app.post("/getUpdatedData", (req, res) => {
  const updatedData = req.body;
  const dataFile = req.query.file || "data.json"; // Default to "data.json"
  const filePath = path.join(__dirname, dataFile);

  try {
    const existingData = JSON.parse(fs.readFileSync(filePath, "utf8")); // Read and parse the file
    const primaryKey = updatedData.primaryKey; // Assuming `primaryKey` is passed in the body

    if (!primaryKey) {
      return res.status(400).json({ error: "Primary key is required" });
    }

    // If `existingData` is an array
    if (Array.isArray(existingData)) {
      const recordIndex = existingData.findIndex(
        (item) => item.primaryKey === primaryKey
      );

      if (recordIndex === -1) {
        return res.status(404).json({ error: "Key not found in data array" });
      }

      // Update the found record with new data
      existingData[recordIndex] = {
        ...existingData[recordIndex],
        ...updatedData,
      };
    } 
    // If `existingData` is an object
    else if (typeof existingData === "object" && existingData !== null) {
      if (!existingData.hasOwnProperty(primaryKey)) {
        return res.status(404).json({ error: "Key not found in data object" });
      }

      existingData[primaryKey] = {
        ...existingData[primaryKey],
        ...updatedData,
      };
    } 
    else {
      return res.status(500).json({ error: "Unsupported data format in file" });
    }

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf8");
    res.json({ message: "Data updated successfully" });
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).json({ error: "Failed to read, update, or write the data file" });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
