const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/Link_Database", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

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
}, {
  collection: 'Links' // ✅ Force the use of capital 'Links'
});

const Link = mongoose.model("Link", linkSchema);

// 🚀 GET paginated links
app.get('/links', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const total = await Link.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const data = await Link.find().skip(skip).limit(limit);

    res.json({ data, totalPages });
  } catch (error) {
    console.error("❌ Error fetching links:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ POST new links (only if not already present)
app.post('/add-links', async (req, res) => {
  try {
    const newLinks = req.body;
    let addedCount = 0;

    for (const entry of newLinks) {
      const exists = await Link.findOne({ Links: entry.Links });
      if (!exists) {
        await Link.create(entry);
        addedCount++;
      }
    }

    res.json({ message: `✅ ${addedCount} new unique links added.` });
  } catch (error) {
    console.error("❌ Error adding links:", error);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
});
