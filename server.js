const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Access the correct DB and Collection
const AllLinksSchema = new mongoose.Schema({}, { strict: false });
const AllLinks = mongoose.connection.useDb("Link_Database").model("All_Links", AllLinksSchema);

// Route to fetch cleaned data
app.get("/links", async (req, res) => {
  try {
    const data = await AllLinks.find();

    const cleaned = data.map(doc => ({
      id: doc._id.toString(),
      Links: doc.Links || "",
      Observation: doc.Observation || "",
      University: doc.University || "",
      Country: doc.Country || "",
      Year: doc.Year || "",
      GroupName: doc.GroupName || "",
      GroupType: doc["Group Type"] || ""
    }));

    res.json(cleaned);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}/links`);
});
