// backend/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const paymentsRouter = require("./routes/payments");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server running", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/payments", paymentsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Ads Creator Platform Backend running on port ${PORT}`);
  console.log(`✓ Monad RPC: ${process.env.MONADRPCURL}`);
  console.log(`✓ Contract Address: ${process.env.CONTRACT_ADDRESS}`);
});