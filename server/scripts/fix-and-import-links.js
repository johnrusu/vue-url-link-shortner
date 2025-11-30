const mongoose = require("mongoose");
const fs = require("fs");

// MongoDB connection
const DB_URI = "mongodb://localhost:27017/link-shortener";

async function fixAndImport() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully");

    const db = mongoose.connection.db;
    const linksCollection = db.collection("links");

    // Get all indexes
    console.log("\nCurrent indexes:");
    const indexes = await linksCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic 'id_1' index if it exists
    try {
      console.log("\nAttempting to drop 'id_1' index...");
      await linksCollection.dropIndex("id_1");
      console.log("Successfully dropped 'id_1' index");
    } catch (error) {
      if (error.code === 27) {
        console.log(
          "Index 'id_1' does not exist (already dropped or never existed)"
        );
      } else {
        console.log("Error dropping index:", error.message);
      }
    }

    // Optional: Clear existing data
    console.log(
      "\nDo you want to clear existing links? (This script will clear them)"
    );
    const count = await linksCollection.countDocuments();
    console.log(`Current document count: ${count}`);

    if (count > 0) {
      console.log("Clearing existing documents...");
      await linksCollection.deleteMany({});
      console.log("Cleared existing documents");
    }

    // Import new data
    const importFilePath = "link-shortener-links-import.json";

    console.log(`\nReading import file: ${importFilePath}`);
    const data = JSON.parse(fs.readFileSync(importFilePath, "utf8"));
    console.log(`Found ${data.length} documents to import`);

    console.log("Importing documents...");
    const result = await linksCollection.insertMany(data, { ordered: false });
    console.log(`Successfully imported ${result.insertedCount} documents`);

    // Verify indexes after import
    console.log("\nFinal indexes:");
    const finalIndexes = await linksCollection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log("\n✅ Import completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}

fixAndImport();
