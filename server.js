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
    const linksData = req.body;
    let added = 0;
    let updated = 0;

    for (const entry of linksData) {
      // Skip if there's no link
      if (!entry.Links || entry.Links.trim() === "") continue;

      const existing = await Link.findOne({ Links: entry.Links });

      if (existing) {
        // Update all other fields based on link
        await Link.updateOne({ Links: entry.Links }, { $set: entry });
        updated++;
      } else {
        // Insert new unique link
        await Link.create(entry);
        added++;
      }
    }

    res.json({ message: `✅ ${added} added, 🔁 ${updated} updated.` });
  } catch (error) {
    console.error("❌ Error in /add-links:", error);
    res.status(500).send("Server Error");
  }
});


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


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/links`);
});
