require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const linkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
  },
  clicks: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Link = mongoose.model("Link", linkSchema);

app.use(cors());
app.use(express.json());

function generateShortCode() {
  let shortCode = "";

  for (let index = 0; index < 6; index += 1) {
    shortCode += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return shortCode;
}

app.post("/shorten", async (req, res) => {
  const { originalUrl, expiresInHours } = req.body || {};

  if (typeof originalUrl !== "string" || !originalUrl.trim()) {
    return res.status(400).json({ error: "originalUrl must be a valid HTTP or HTTPS URL." });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl.trim());
  } catch {
    return res.status(400).json({ error: "originalUrl must be a valid HTTP or HTTPS URL." });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return res.status(400).json({ error: "originalUrl must be a valid HTTP or HTTPS URL." });
  }

  if (
    expiresInHours !== undefined &&
    (typeof expiresInHours !== "number" || !Number.isFinite(expiresInHours) || expiresInHours <= 0)
  ) {
    return res.status(400).json({ error: "expiresInHours must be a positive number." });
  }

  const expiresAt =
    expiresInHours === undefined
      ? undefined
      : new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  if (expiresAt && !Number.isFinite(expiresAt.getTime())) {
    return res.status(400).json({ error: "expiresInHours is too large." });
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const link = await Link.create({
        originalUrl: originalUrl.trim(),
        shortCode: generateShortCode(),
        expiresAt,
      });

      return res.status(201).json({
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${link.shortCode}`,
        clicks: link.clicks,
        expiresAt: link.expiresAt,
      });
    } catch (error) {
      if (error.code === 11000 && attempt < 4) {
        continue;
      }

      console.error("Failed to save shortened URL:", error);
      return res.status(500).json({ error: "Failed to shorten URL." });
    }
  }
});

app.get("/", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });

    return res.json(
      links.map((link) => ({
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${link.shortCode}`,
        clicks: link.clicks,
        createdAt: link.createdAt,
      })),
    );
  } catch (error) {
    console.error("Failed to fetch shortened URLs:", error);
    return res.status(500).json({ error: "Failed to fetch links." });
  }
});

app.get("/api/links", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    return res.json(links);
  } catch (error) {
    console.error("Failed to fetch shortened URLs:", error);
    return res.status(500).json({ error: "Failed to fetch links." });
  }
});

app.get("/:shortCode", async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      {
        shortCode: req.params.shortCode,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
      { $inc: { clicks: 1 } },
      { new: true },
    );

    if (!link) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error("Failed to resolve shortened URL:", error);
    return res.status(500).json({ error: "Failed to resolve short URL." });
  }
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in the .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});