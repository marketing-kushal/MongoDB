const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());

// MongoDB Atlas URI
const uri = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/";

// Create MongoDB client
const client = new MongoClient(uri);

// Endpoint to fetch links
app.get('/links', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Link_Database').collection('All_Links');

    const data = await collection.find({}).toArray();

    // Clean up each document
    const cleaned = data.map(doc => ({
      id: doc._id.toString(),                   // Convert ObjectId to string
      Links: doc.Links || "",                   // Handle missing fields gracefully
      Observation: doc.Observation || "",
      Country: doc.Country || "",
      GroupType: doc["Group Type"] || ""        // Convert "Group Type" with space to GroupType
    }));

    res.json(cleaned);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).send("Error fetching data from MongoDB");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/links`));
