const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect("mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/")
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Use the correct DB and model
    const db = mongoose.connection.useDb("Link_Database");
    const AllLinksSchema = new mongoose.Schema({}, { strict: false });
    const AllLinks = db.model("All_Links", AllLinksSchema);

    app.get("/links", async (req, res) => {
      try {
        const raw = await AllLinks.find();
        const cleaned = raw.map(doc => ({
          id: doc._id.toString(),
          Links: doc.Links || "",
          Observation: doc.Observation || "",
          University: doc.University || "",
          Country: doc.Country || "",
          Year: doc.Year || "",
          GroupName: doc.GroupName || "",
          GroupType: doc["Group Type"] || ""
        }));
        console.log(`✅ Fetched ${cleaned.length} documents`);
        res.json(cleaned);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}/links`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });
