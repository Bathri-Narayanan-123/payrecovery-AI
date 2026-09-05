# PayRecover AI — Intelligent Revenue Recovery Agent

Built for the **Razorpay AI Buildathon**, **PayRecover AI** is an autonomous AI-powered Revenue Recovery Agent for merchants.

It detects failed or at-risk checkouts, analyzes root causes with Gemini AI, evaluates recovery probabilities, applies strict merchant safety policies, executes multi-rail recovery interventions, measures recovered money in real time, and logs every decision in an immutable compliance audit trail.

---

## The Core Autonomous Recovery Workflow

```
FAILED PAYMENT
      ↓
AI ANALYSIS (Gemini 3.8 Flash)
      ↓
RECOVERY PROBABILITY (0–100%)
      ↓
RECOVERY DECISION (Retry / Payment Link / Reminder / Escalate / Stop)
      ↓
SAFETY POLICY ENGINE (Caps, Risk Floors, Approval Thresholds)
      ↓
RECOVERY ACTION (Razorpay Test Mode / Alternative Rails)
      ↓
RECOVERY RESULT (Captured / Dispatched / Escalated / Stopped)
      ↓
REVENUE RECOVERED (+₹ Captured)
      ↓
AUDIT LOG (Full Decision Trace)
```

---

## Key Modules & Features

### 1. Real-Time Revenue Dashboard
- **6 Real-Time Merchant KPIs**: Total Revenue at Risk, Recovered Revenue, Recovery Success Rate (%), Failed Payments Count, High-Priority Opportunities, Average Win Probability.
- **4 Interactive Visualizations (Recharts)**:
  - *Revenue Impact Comparison* (At Risk vs. Recovered)
  - *Failed Payments by Reason* (Gateway Timeout, Bank Decline, Insufficient Balance, OTP Drop, Technical Error)
  - *AI Recovery Interventions Distribution*
  - *Recovery Rate by Payment Rail* (UPI, Card, Netbanking, Wallet)
- **Top Priority Candidates Table**: Instant visibility into high-value invoices and highest recovery probabilities.

### 2. Transaction Ledger & Ingestion (42 Realistic Orders)
- Complete filter bar with search by Payment ID, customer name, email.
- Multidimensional filters: Status, Payment Rail, Failure Reason, Sorting by Amount, Probability, or Time.
- Color-coded status badges (`Failed`, `At Risk`, `Recovered`, `Link Dispatched`, `Reminder Sent`, `Escalated`, `Stopped`).

### 3. Deep Transaction Inspection & Interactive Recovery Drawer
When any transaction is selected:
- **Customer Reliability Profile**: VIP / Regular / New tier, lifetime spend, successful orders count, historical default rate.
- **Gemini AI Recovery Diagnostics**:
  - Live Gemini 3.8 Flash analysis with merchant-friendly reasoning explaining why an intervention was chosen.
  - Interactive "Re-Evaluate with Gemini" button.
- **Safety Policy Validation**:
  - Displays triggered safety rules and approval checks.
- **Action Execution Panel**:
  - *Smart Retry*: Dispatches gateway retry with exponential backoff.
  - *Payment Link*: Generates a dynamic Razorpay Test payment link with copy functionality and a **"Simulate Customer Settlement"** test button.
  - *Smart Reminder*: Generates contextual SMS/WhatsApp notifications.
  - *Escalate Case*: Flags high-value B2B orders for manual account manager review.
  - *Stop Recovery*: Gracefully ceases recovery to prevent merchant fee waste or buyer irritation.

### 4. Autonomous Recovery Center & Batch Recovery
- Dedicated triage tabs: *Pending*, *High Probability (>70%)*, *Requires Sign-Off (>₹15,000)*, *Retries Eligible*, *Payment Links*, *Recovered*.
- **"Run AI Recovery" (Batch Demo)**: Processes 20+ transactions simultaneously through the full 5-stage pipeline, displaying an animated progress tracker and a detailed statistical outcome summary.

### 5. Compliance & Audit Trail
- Immutable log recording: Timestamp, Payment ID, Customer, Amount, Recovery Probability, AI Reasoning Trace, Policy Decision, Selected Action, Action Result, and Recovered Amount.
- Detail drawer providing an auditable snapshot for each intervention.

### 6. System & Policy Settings
- Configurable safety rules:
  - Maximum automatic retries (1 to 3, default: 2)
  - Minimum win probability floor (default: 40%)
  - High-value approval threshold (default: ₹15,000)
  - Preferred fallback rail (Payment Link, Reminder, Retry)
- **"Reset Demo Data" Button**: Restores initial baseline synthetic data for fresh evaluation.

---

## Safety Policy Engine (Deterministic Rules)

1. **Rule 1 & 7 (Retry Ceiling)**: Maximum 2 automatic retries. Retries beyond this cap are blocked to prevent triggering customer bank spam alerts.
2. **Rule 2 (Floor Check)**: If recovery probability < 40%, the policy blocks automated actions and mandates **STOP** to preserve merchant reputation.
3. **Rule 3 (Escalation Trigger)**: Payments failing twice mandate human escalation.
4. **Rule 4 (Duplicate Guard)**: Payments already marked `Recovered` block subsequent actions.
5. **Rule 5 (High-Value Sign-off)**: Transactions $\ge$ ₹15,000 require explicit merchant authorization before intervention is executed.
6. **Rule 6 (Traceability)**: Every action produces an immutable audit record.
7. **Rule 8 (Zero Real Money)**: Operates in test mode only; no real money transactions.
8. **Rule 9 (Explainability)**: Every decision includes a clear merchant justification.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express, Vite middleware in development, esbuild CommonJS bundling for production
- **AI Reasoning**: Gemini 3.8 Flash (`@google/genai` SDK) with a deterministic fallback engine
- **Payment Gateway Architecture**: Razorpay Test Mode integration abstraction
- **Persistence**: In-memory store with reset capability
