const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://marketingktp85:Kushal123@kushal13.oyvr7.mongodb.net/Link_Database", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Schema for Links collection
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
  collection: 'Links' // Existing collection
});

const Link = mongoose.model("Link", linkSchema);

// ✅ Schema for FB_Data collection
const fbSchema = new mongoose.Schema({
  University: String,
  Country: String,
  Group_Link: String,
  FB_ID: String,
  Group_Status: String,
  Join_Status: String
}, {
  collection: 'FB_Data' // Targeting FB_Data collection
});

const FBData = mongoose.model("FBData", fbSchema);

// ✅ GET paginated links from Links collection
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

// ✅ POST - Add or update by unique Links
app.post('/add-links', async (req, res) => {
  try {
    const linksData = req.body;
    let added = 0;
    let updated = 0;

    for (const entry of linksData) {
      if (!entry.Links || entry.Links.trim() === "") continue;

      const trimmedLink = entry.Links.trim();
      const existing = await Link.findOne({ Links: trimmedLink });

      if (existing) {
        await Link.updateOne({ Links: trimmedLink }, { $set: entry });
        updated++;
      } else {
        await Link.create({ ...entry, Links: trimmedLink });
        added++;
      }
    }

    res.json({ message: `✅ ${added} added, 🔁 ${updated} updated.` });
  } catch (error) {
    console.error("❌ Error in /add-links:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ POST - Insert into FB_Data collection
app.post('/FB_Data', async (req, res) => {
  try {
    const data = req.body;
    let added = 0;

    for (const entry of data) {
      if (!entry.Group_Link || entry.Group_Link.trim() === "") continue;

      const exists = await FBData.findOne({ Group_Link: entry.Group_Link.trim() });
      if (exists) continue;

      await FBData.create(entry);
      added++;
    }

    res.json({ message: `✅ ${added} rows inserted into FB_Data` });
  } catch (error) {
    console.error("❌ Error in /FB_Data:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ PATCH - Update document by ObjectID
app.patch('/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updated = await Link.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "❌ Document not found" });
    }

    res.json({ message: `✅ Document ${id} updated successfully`, data: updated });
  } catch (error) {
    console.error("❌ Error updating document:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
  console.log(`🚀 Server running on http://localhost:${PORT}/FB_Data`);

});
