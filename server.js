const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/Link_Database?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const linkSchema = new mongoose.Schema({
  Links: String,
  Observation: String,
  University: String,
  Country: String,
  Year: String,
  GroupName: String,
  GroupType: String,
  Joining: String,
  Timestamp: String
});

const Link = mongoose.model("Links", linkSchema);

// ✅ Fetch with Pagination
app.get("/links", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const skip = (page - 1) * limit;

  try {
    const total = await Link.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const links = await Link.find().skip(skip).limit(limit);
    const cleaned = links.map(doc => ({
      id: doc._id.toString(),
      Links: doc.Links || "",
      Observation: doc.Observation || "",
      University: doc.University || "",
      Country: doc.Country || "",
      Year: doc.Year || "",
      GroupName: doc.GroupName || "",
      GroupType: doc.GroupType || "",
      Joining: doc.Joining || "",
      Timestamp: doc.Timestamp || ""
    }));

    res.json({ data: cleaned, totalPages });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// ✅ Insert only Unique Links from NEW_Links
app.post("/add-links", async (req, res) => {
  try {
    const newLinks = req.body;
    const added = [];

    for (let link of newLinks) {
      const exists = await Link.findOne({ Links: link.Links });
      if (!exists) {
        const doc = new Link(link);
        await doc.save();
        added.push(link.Links);
      }
    }

    res.json({ message: `${added.length} unique links added.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to insert links" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
