const express = require("express");
const router = express.Router();

const { pathOr } = require("ramda");

// Auth middleware
const { checkJwt } = require("../middleware/auth.js");

// utils
const { isNilOrEmpty } = require("../utils/index.js");

// Database functions
const {
  getLinks,
  getLinkById,
  getLinkByShortCode,
  createLink,
  updateLink,
  deleteLink,
  deleteAll,
} = require("../database/index.js");

// Root route - Public
router.get("/", async (req, res) => {
  res.json({ message: "Welcome to Link Shortener API" });
});

// Get all links - Protected
router.get("/api/links", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.payload?.sub;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const links = await getLinks(userId);
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific link - Protected
router.get("/api/links/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.payload?.sub;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }
    const link = await getLinkById(req.params.id, userId);
    if (isNilOrEmpty(link)) {
      return res.status(404).json({ error: "Link not found" });
    }
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new short link - Protected
router.post("/api/link", checkJwt, async (req, res) => {
  const urlValue = pathOr("", ["body", "url"], req);
  const shortCode = pathOr("", ["body", "shortCode"], req);

  if (isNilOrEmpty(urlValue)) {
    return res.status(400).json({ error: "URL is required" });
  }

  const userId = req.auth?.sub || req.auth?.payload?.sub;

  const newLink = {
    url: urlValue,
    shortCode: shortCode || Math.random().toString(36).substring(2, 8),
    clicks: 0,
    userId, // Store the Auth0 user ID
  };

  try {
    const createdLink = await createLink(newLink);
    res.status(201).json(createdLink);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get link by short code - Protected
router.get("/api/link/:shortCode", checkJwt, async (req, res) => {
  try {
    const link = await getLinkByShortCode(req.params.shortCode);
    if (isNilOrEmpty(link)) {
      return res.status(404).json({ error: "Short link not found" });
    }

    link.clicks++;
    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update link - Protected
router.put("/api/links/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.payload?.sub;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }
    const updatedLink = await updateLink(req.params.id, req.body, userId);
    if (isNilOrEmpty(updatedLink)) {
      return res.status(404).json({ error: "Link not found" });
    }
    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete link - Protected
router.delete("/api/links/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.payload?.sub;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }
    const deletedLink = await deleteLink(req.params.id, userId);
    if (isNilOrEmpty(deletedLink)) {
      return res.status(404).json({ error: "Link not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/links", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.sub || req.auth?.payload?.sub;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }
    await deleteAll(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
