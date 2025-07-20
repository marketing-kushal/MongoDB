const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string
const uri = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/";

app.use(cors());

app.get("/links", async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("Link_Database");
    const collection = db.collection("Links"); // ✅ Updated collection name

    // Pagination (load 1000 at a time)
    const skip = parseInt(req.query.skip) || 0;
    const limit = 1000;

    const data = await collection.find({}).skip(skip).limit(limit).toArray();

    // Clean data
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
    await client.close();
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
});
