const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/Link_Database?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.error("❌ MongoDB connection error:", err));
db.once("open", () => console.log("✅ MongoDB Connected to Link_Database"));

// Schema and Model
const linkSchema = new mongoose.Schema({
  Links: String,
  Observation: String,
  University: String,
  Country: String,
  Year: String,
  GroupName: String,
  GroupType: String,
});

const Link = mongoose.model("Links", linkSchema, "Links"); // Explicit collection name

// Fetch paginated links
app.get("/links", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const total = await Link.countDocuments();
    const data = await Link.find().skip(skip).limit(limit);

    const cleaned = data.map(doc => ({
      id: doc._id.toString(),
      Links: doc.Links || "",
      Observation: doc.Observation || "",
      University: doc.University || "",
      Country: doc.Country || "",
      Year: doc.Year || "",
      GroupName: doc.GroupName || "",
      GroupType: doc.GroupType || ""
    }));

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: cleaned
    });
  } catch (err) {
    console.error("Error fetching links:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update from NEW Links Sheet
app.post("/update-links", async (req, res) => {
  try {
    const incomingData = req.body;

    if (!Array.isArray(incomingData)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    let inserted = 0, skipped = 0;
    for (const item of incomingData) {
      const existing = await Link.findOne({ Links: item.Links });
      if (!existing) {
        await Link.create({
          Links: item.Links || "",
          Observation: item.Observation || "",
          University: item.University || "",
          Country: item.Country || "",
          Year: item.Year || "",
          GroupName: item.GroupName || "",
          GroupType: item.GroupType || ""
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    res.json({ message: "✅ Update complete", inserted, skipped });
  } catch (err) {
    console.error("Error in /update-links:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
});
