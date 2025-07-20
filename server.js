const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(cors());

// Mongoose schema
const linkSchema = new mongoose.Schema({}, { strict: false });
const Link = mongoose.model("All_Links", linkSchema, "All_Links");

// API endpoint with pagination
app.get("/links", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const skip = (page - 1) * limit;

  try {
    const total = await Link.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const data = await Link.find().skip(skip).limit(limit);

    // Cleaned format as you asked
    const cleaned = data.map(doc => ({
      id: doc._id.toString(),
      Links: doc.Links || "",
      Observation: doc.Observation || "",
      University: doc.University || "",
      Country: doc.Country || "",
      Year: doc.Year || "",
      GroupName: doc.GroupName || "",
      GroupType: doc["Group Type"] || "",
    }));

    res.json({
      page,
      totalPages,
      totalRecords: total,
      data: cleaned,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/links`);
});
