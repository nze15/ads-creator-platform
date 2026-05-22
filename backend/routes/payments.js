// backend/routes/payments.js
const express = require("express");
const { createInvoice, confirmPayment } = require("../services/payments");
const router = express.Router();

// POST /api/payments/create-invoice
// Request: { amount, currency, userWallet }
// Response: { invoiceId, paymentUrl, ... }
router.post("/create-invoice", async (req, res) => {
  try {
    const { amount, currency, userWallet } = req.body;

    if (!amount || !currency || !userWallet) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const invoice = await createInvoice(amount, currency, userWallet);
    res.json({
      success: true,
      invoiceId: invoice.id,
      paymentUrl: invoice.pay_url,
      amount: invoice.price_amount,
      currency: invoice.price_currency
    });
  } catch (error) {
    console.error("Invoice creation error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// POST /api/payments/confirm
// Request: { invoiceId, userWallet }
// Response: { success, txHash, creditsAdded }
router.post("/confirm", async (req, res) => {
  try {
    const { invoiceId, userWallet } = req.body;

    if (!invoiceId || !userWallet) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await confirmPayment(invoiceId, userWallet);
    res.json({
      success: true,
      message: "Payment confirmed and credits minted on Monad"
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

module.exports = router;
