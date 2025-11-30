const DB_URI =
  process.env.MONGO_URI ||
  process.env.DB_URI ||
  "mongodb://localhost:27017/link-shortener";
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "your-api-identifier";
const AUTH0_ISSUER =
  process.env.AUTH0_ISSUER ||
  process.env.AUTH0_ISSUER_BASE_URL ||
  "https://your-domain.auth0.com/";

module.exports = { DB_URI, AUTH0_AUDIENCE, AUTH0_ISSUER };
