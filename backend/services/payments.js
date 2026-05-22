// backend/services/payments.js
const { ethers } = require("ethers");
const NowPayments = require("nowpayments-api-js");

// Load contract ABI (compiled JSON from your Solidity contract)
const contractABI = require("../contracts/AdsCreatorPlatformABI.json");
const contractAddress = process.env.CONTRACT_ADDRESS;

// Connect to Monad RPC
const provider = new ethers.JsonRpcProvider(process.env.MONADRPCURL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Init NowPayments
const np = new NowPayments({ apiKey: process.env.NOWPAYMENTS_KEY });

// Create invoice for crypto funding
async function createInvoice(amount, currency, userWallet) {
  return await np.createInvoice({
    price_amount: amount,
    price_currency: currency,   // e.g. "USD"
    pay_currency: "USDT",       // crypto settlement
    order_id: `order-${Date.now()}`,
    order_description: "Ad Credits Top-up",
    success_url: "https://yourapp.com/success",
    cancel_url: "https://yourapp.com/cancel"
  });
}

// Handle payment confirmation → mint credits on Monad
async function confirmPayment(invoiceId, userWallet) {
  const status = await np.getPaymentStatus(invoiceId);
  if (status.payment_status === "finished") {
    const tx = await contract.addCredits(userWallet, status.price_amount);
    await tx.wait();
    console.log(`Credits minted: ${status.price_amount} for ${userWallet}`);
  }
}

module.exports = { createInvoice, confirmPayment };
