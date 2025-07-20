const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// MongoDB Connection
const MONGO_URI = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/Link_Database?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.error("❌ MongoDB Connection Error:", err));
db.once("open", () => console.log("✅ MongoDB Connected Successfully"));

// Define Schema
const linkSchema = new mongoose.Schema({
  id: String,
  Links: String,
  Observation: String,
  University: String,
  Country: String,
  Year: String,
  GroupName: String,
  GroupType: String,
});

const Link = mongoose.model("Links", linkSchema);

// Route: GET /links with pagination
app.get("/links", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;

    const total = await Link.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const data = await Link.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ total, totalPages, currentPage: page, data });
  } catch (err) {
    console.error("GET /links error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route: POST /links/add-unique
app.post("/links/add-unique", async (req, res) => {
  try {
    const newLinks = req.body;

    if (!Array.isArray(newLinks)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const existingLinks = await Link.find({
      Links: { $in: newLinks.map(item => item.Links) },
    }).select("Links");

    const existingSet = new Set(existingLinks.map(doc => doc.Links));
    const uniqueLinks = newLinks.filter(item => !existingSet.has(item.Links));

    if (uniqueLinks.length > 0) {
      await Link.insertMany(uniqueLinks);
    }

    res.json({ message: "Unique links added", inserted: uniqueLinks.length });
  } catch (err) {
    console.error("POST /links/add-unique error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
});
