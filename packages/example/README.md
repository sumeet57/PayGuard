# PayGuard Buildathon Demo — server + console

## Project layout
```
server/     Express + LangChain + PayGuard backend (based on your file, with two small additions)
frontend/   Vite + React console
```

### What was added to the server
- `GET /api/config` — returns the public Razorpay key id, the product catalog, and current policy.
- `PUT /api/policy` — updates `maxTransactionAmount` / `requireApprovalAbove` at runtime, with
  validation (positive numbers, approval threshold ≤ max amount).
- `POST /api/payment/order` / `POST /api/payment/verify` — a direct (non-agent) Razorpay test-mode
  checkout flow for the "Manual test payment" panel, using the official `razorpay` SDK order
  creation + signature verification. Amounts are capped by the current `maxTransactionAmount`.

  Note: the policy object is passed by reference into `new PayGuard({ policy, ... })`, so updating
  it in place should flow through automatically. If your installed PayGuard SDK snapshots the
  policy internally instead of reading it live, swap that section for whichever official
  `payguard.updatePolicy(...)` (or similar) method the SDK provides.

## Setup

### 1. Server
```bash
cd server
npm install
cp .env.example .env   # fill in your real, rotated test-mode keys
npm start
```
Runs on `http://localhost:3000` by default.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your server if not localhost:3000
npm run dev
```
Runs on `http://localhost:5173` by default.

## Using it
1. **Spending limits** — set the max transaction amount and approval threshold. Saved instantly to
   the running server (in memory; resets on server restart — wire it to persistent storage if you
   need it to survive restarts).
2. **Manual test payment** — pay any amount up to the max limit through Razorpay's real Checkout
   widget in **test mode**. Use card `4111 1111 1111 1111`, any future expiry, any CVV. No real
   money moves. Make sure your `.env` has `rzp_test_...` keys, not live ones.
3. **Purchasing agent** — type a request like "buy a developer monitor"; the LLM picks a catalog
   item and calls PayGuard's payment tool. Anything above the approval threshold should land in
   the queue below instead of completing immediately.
4. **Approvals queue** — approve or reject anything waiting, polls every 8 seconds.

