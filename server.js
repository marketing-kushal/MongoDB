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

/* ------------------ SCHEMAS ------------------ */

// ✅ Links Schema
const linkSchema = new mongoose.Schema({
  Links: String,
  Observation: String,
  University: String,
  Country: String,
  Year: String,
  GroupName: String,
  GroupType: String,
  Joining: String,
  Timestamp: String,
  Name: String

}, { collection: 'Links' });

const Link = mongoose.model("Link", linkSchema);

// Create unique index on Links for fast existence check and uniqueness enforcement
Link.collection.createIndex({ Links: 1 }, { unique: true }, (err, result) => {
  if (err) console.error("❌ Error creating index on Links:", err);
  else console.log("✅ MongoDB unique index created on Links field");
});

// ✅ FB_Data Schema
const fbSchema = new mongoose.Schema({
  University: String,
  Country: String,
  Group_Link: String,
  FB_ID: String,
  Group_Status: String,
  Join_Status: String,
  Timestamp: String
}, { collection: 'FB_Data' });

const FBData = mongoose.model("FBData", fbSchema);

// ✅ Dropdown Schema
const dropdownSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: String, required: true }
}, { collection: 'All_Data' });

const Dropdown = mongoose.model("Dropdown", dropdownSchema);

/* ------------------ ROUTES ------------------ */

// New: GET /links/exist?link=... to check if link exists
app.get('/links/exist', async (req, res) => {
  try {
    const link = req.query.link;
    if (!link || !link.trim()) {
      return res.status(400).json({ error: "Missing link query parameter" });
    }
    const trimmedLink = link.trim();
    const exists = await Link.exists({ Links: trimmedLink });
    res.json({ exists: Boolean(exists) });
  } catch (error) {
    console.error("❌ Error checking link existence:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ GET paginated links
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

// ✅ POST to add/update Links
app.post('/add-links', async (req, res) => {
  try {
    const linksData = req.body;
    let added = 0, updated = 0;

    for (const entry of linksData) {
      if (!entry.Links || entry.Links.trim() === "") continue;

      const trimmedLink = entry.Links.trim();
      const existing = await Link.findOne({ Links: trimmedLink });

      if (existing) {
        const changed = Object.keys(entry).some(key => entry[key] !== existing[key]);
        if (changed) {
          await Link.updateOne({ Links: trimmedLink }, { $set: entry });
          updated++;
        }
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

// ✅ POST to add/update FB_Data
app.post('/FB_Data', async (req, res) => {
  try {
    // Fix: Handle both { data: [...] } and [...]
    const data = req.body.data || req.body;
    
    let added = 0, updated = 0;

    for (const entry of data) {
      if (!entry.Group_Link || entry.Group_Link.trim() === "") continue;

      const trimmedLink = entry.Group_Link.trim();
      const existing = await FBData.findOne({ Group_Link: trimmedLink });

      if (existing) {
        const changed = Object.keys(entry).some(key => entry[key] !== existing[key]);
        if (changed) {
          await FBData.updateOne({ Group_Link: trimmedLink }, { $set: entry });
          updated++;
        }
      } else {
        await FBData.create({ ...entry, Group_Link: trimmedLink });
        added++;
      }
    }

    res.json({ message: `✅ ${added} inserted, 🔁 ${updated} updated.` });
  } catch (error) {
    console.error("❌ Error in /FB_Data:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ POST to add dropdowns
app.post('/add-dropdowns', async (req, res) => {
  try {
    const data = req.body;
    let added = 0;
    let skipped = 0;

    for (const entry of data) {
      const exists = await Dropdown.findOne({ type: entry.type, value: entry.value });
      if (exists) {
        skipped++;
        continue;
      }
      await Dropdown.create(entry);
      added++;
    }

    res.json({ message: `✅ ${added} added, 🔁 ${skipped} skipped.` });
  } catch (err) {
    console.error("❌ Error saving dropdowns:", err);
    res.status(500).send("Server error");
  }
});

// ✅ GET dropdowns grouped by type
app.get('/dropdowns', async (req, res) => {
  try {
    const all = await Dropdown.find();
    const result = {};

    all.forEach(doc => {
      if (!result[doc.type]) result[doc.type] = [];
      result[doc.type].push(doc.value);
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching dropdowns:", err);
    res.status(500).send("Server error");
  }
});

// ✅ GET all dropdowns as flat array (for Apps Script deduplication)
app.get('/all-dropdowns', async (req, res) => {
  try {
    const all = await Dropdown.find({}, { type: 1, value: 1, _id: 0 });
    res.json(all); // Example: [{ type: "Country", value: "India" }]
  } catch (err) {
    console.error("❌ Error in /all-dropdowns:", err);
    res.status(500).send("Server Error");
  }
});

// ✅ PATCH individual link by ID
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

/* ------------------ SERVER START ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ POST /add-links → Links`);
  console.log(`✅ POST /FB_Data → FB_Data`);
  console.log(`✅ POST /add-dropdowns → All_Data`);
  console.log(`✅ GET /dropdowns → fetch grouped dropdowns`);
  console.log(`✅ GET /all-dropdowns → fetch flat dropdowns`);
  console.log(`✅ GET /links/exist → check link existence`);
});
