# Payment Integration Setup Guide

## Overview
This guide covers the Monad blockchain integration with NowPayments for fiat-to-crypto conversion and on-chain ad credit management.

## Architecture

### Components
1. **backend/services/payments.js** - Core payment logic
2. **backend/routes/payments.js** - API endpoints
3. **backend/contracts/AdsCreatorPlatformABI.json** - Smart contract interface
4. **backend/index.js** - Express server

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required:**
- `MONADRPCURL` - Monad testnet RPC endpoint
- `CONTRACT_ADDRESS` - Deployed contract address on Monad
- `PRIVATE_KEY` - Wallet private key for minting credits
- `NOWPAYMENTS_KEY` - NowPayments API key
- `PORT` - Backend server port (default: 3001)

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

Required packages:
- `ethers@^6.8.0` - Ethereum/EVM library
- `nowpayments-api-js@^1.2.0` - NowPayments SDK
- `express@^4.18.2` - Web framework
- `dotenv@^16.3.1` - Environment management
- `cors@^2.8.5` - CORS middleware

### 3. Deploy Smart Contract

Deploy `AdsCreatorPlatformABI.json` contract to Monad testnet with functions:
- `addCredits(address user, uint256 amount)` - Mint credits
- `getCredits(address user)` - View user credits
- `tipCreator(address creator, uint256 amount)` - Tip creators
- `getCreatorEarnings(address creator)` - View creator earnings

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### POST /api/payments/create-invoice
Create a NowPayments invoice for ad credit top-up.

**Request:**
```json
{
  "amount": 100,
  "currency": "USD",
  "userWallet": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "invoiceId": "123456",
  "paymentUrl": "https://nowpayments.io/pay/...",
  "amount": 100,
  "currency": "USD"
}
```

### POST /api/payments/confirm
Confirm payment and mint credits on Monad.

**Request:**
```json
{
  "invoiceId": "123456",
  "userWallet": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and credits minted on Monad"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "Server running",
  "timestamp": "2026-05-22T09:36:00.000Z"
}
```

## Workflow

1. **User initiates payment** → Calls `/api/payments/create-invoice`
2. **NowPayments generates invoice** → User redirected to payment page
3. **User pays in crypto (USDT)** → NowPayments processes
4. **Frontend confirms payment** → Calls `/api/payments/confirm`
5. **Backend mints credits** → Calls `contract.addCredits()` on Monad
6. **Credits appear in user account** → Ready for ad campaigns

## Error Handling

- Missing fields return 400 status
- Payment failures return 500 status with error message
- All errors logged to console

## Security Considerations

- Always use `.env` file for secrets (in `.gitignore`)
- Never commit private keys
- Validate all user inputs on backend
- Use HTTPS in production
- Implement rate limiting on payment endpoints
- Add authentication middleware to protect endpoints

## Testing

```bash
# Create invoice
curl -X POST http://localhost:3001/api/payments/create-invoice \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "currency": "USD", "userWallet": "0x..."}'

# Check health
curl http://localhost:3001/health
```

## Troubleshooting

**"PRIVATE_KEY not found"**
- Ensure `.env` file exists with `PRIVATE_KEY` set
- Format: `0x` followed by 64 hex characters

**"Contract call failed"**
- Verify contract is deployed at `CONTRACT_ADDRESS`
- Check ABI matches deployed contract
- Ensure wallet has sufficient balance on Monad

**"NowPayments API error"**
- Validate `NOWPAYMENTS_KEY` is correct
- Check NowPayments account is active
- Verify sandbox vs production mode

## Next Steps

1. Add authentication/authorization middleware
2. Implement payment webhooks from NowPayments
3. Add database for tracking transactions
4. Set up monitoring and logging
5. Create admin dashboard for payment management
6. Implement refund functionality