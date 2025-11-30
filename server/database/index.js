const mongoose = require("mongoose");

// constants
const { DB_URI } = require("../constants/index.js");

const initializeDatabase = async () => {
  const dbConnection = await mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return dbConnection;
};

const linksSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  userId: { type: String, required: false }, // Auth0 user ID
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
});

const links = mongoose.model("Link", linksSchema);

const getLinks = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await links.find({ userId });
};

const getLinkById = async (id, userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await links.findOne({ _id: id, userId });
};

const getLinkByShortCode = async (shortCode) => {
  return await links.findOne({ shortCode });
};

const createLink = async (linkData) => {
  const link = new links(linkData);
  return await link.save();
};

const updateLink = async (id, linkData, userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await links.findOneAndUpdate({ _id: id, userId }, linkData, {
    new: true,
  });
};

const deleteLink = async (id, userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await links.findOneAndDelete({ _id: id, userId });
};

const deleteAll = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await links.deleteMany({ userId });
};

const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = {
  initializeDatabase,
  closeDatabase,
  getLinks,
  getLinkById,
  getLinkByShortCode,
  createLink,
  updateLink,
  deleteLink,
  deleteAll,
};
