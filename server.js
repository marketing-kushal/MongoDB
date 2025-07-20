const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const mongoURI = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/";
const client = new MongoClient(mongoURI);

let collection;

app.use(cors());

app.get("/links", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  console.log(`Received request: page=${page}, limit=${limit}`);

  try {
    const totalDocuments = await collection.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    const data = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log(`Sending ${data.length} records (Page ${page} of ${totalPages})`);

    res.json({
      data,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB connection successful");

    const db = client.db("Link_Database");
    collection = db.collection("Links");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

startServer();
