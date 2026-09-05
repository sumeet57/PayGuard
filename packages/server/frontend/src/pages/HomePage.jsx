import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiArrowRight,
  FiGithub,
  FiShield,
  FiLock,
  FiActivity,
  FiCode,
  FiTerminal,
  FiCpu,
  FiCopy,
  FiCheck,
  FiMenu,
  FiX,
  FiLayers,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";

import { BsRobot, BsCreditCard2Front } from "react-icons/bs";

/* =============================================================
   DOCUMENTATION NAVIGATION DATA
============================================================= */

const PLAYGROUND_URL = "https://payguardplayground.sumeet.app";

const docSections = [
  {
    title: "Getting Started",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Quick Start", href: "#quick-start" },
      { label: "Architecture", href: "#architecture" },
    ],
  },
  {
    title: "Core Concepts",
    links: [
      { label: "Policy Engine", href: "#policies" },
      { label: "Human Approvals", href: "#approvals" },
      { label: "Intelligence Modes", href: "#modes" },
    ],
  },
  {
    title: "Operations & Reliability",
    links: [
      { label: "Idempotency", href: "#idempotency" },
      { label: "Webhooks & Events", href: "#webhooks" },
      { label: "Reconciliation", href: "#reconciliation" },
    ],
  },
];

const codeExamples = {
  install: `npm install payguard`,
  init: `import { PayGuard } from "payguard";

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI,
    collectionName: "payguard_transactions",
  },
  policy: {
    maxTransactionAmount: 25000,
    requireApprovalAbove: 15000,
    allowedMerchants: ["merchant_prod_1", "merchant_prod_2"],
    allowedCurrencies: ["INR"],
  },
});

const agent = await payguard.agent({
  id: "shopping-agent-1",
  name: "Autonomous Purchasing Agent",
  capabilities: ["shopping", "payment"],
});

const result = await agent.pay({
  amount: 2000,
  currency: "INR",
  merchant: { id: "merchant_prod_1" },
  reason: "Procurement of cloud server credits",
  idempotencyKey: "txn_ord_994827",
});`,
  webhook: `// Express.js Webhook Handler
app.post("/webhooks/payguard", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-payguard-signature"];
  const isValid = payguard.webhooks.verifySignature(req.body, signature, process.env.PAYGUARD_WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body);

  switch (event.type) {
    case "payment.approval_required":
      sendSlackNotification(event.data);
      break;
    case "payment.executed":
      updateLocalLedger(event.data);
      break;
    case "payment.blocked":
      logSecurityAlert(event.data);
      break;
  }

  res.status(200).send("OK");
});`,
  reconciliation: `import { PayGuard, ReconciliationWorker, PayGuardAIProvider } from "payguard";

const payguard = new PayGuard({
  razorpay: { keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET },
  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI,
    collectionName: "payguard_transactions",
  },
  policy, // mutated in place by PUT /api/policy
  ai: new PayGuardAIProvider({
    apiKey: process.env.PAYGUARD_API_KEY,
  }),
});

const worker = new ReconciliationWorker(payguard);

// Run background worker periodically
setInterval(async () => {
  const summary = await worker.runReconciliation(15); // Expiry threshold in minutes
  console.log(\`Reconciled \${summary.reconciledCount} transactions.\`);
}, 2 * 60 * 1000); // every 2 minutes`,
};

/* =============================================================
   MAIN DOCUMENTATION COMPONENT
============================================================= */

export default function PayGuardDocsPage() {
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText(codeExamples.install);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] font-sans antialiased selection:bg-orange-500/20 selection:text-orange-400">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#18181b]"
            >
              {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>

            <Link to="/" className="flex items-center gap-2 font-bold text-sm tracking-tight text-white">
              <span className="p-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <FiShield size={16} />
              </span>
              PayGuard
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-[#27272a] font-normal">
                Docs
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
           

            <a
              href="https://github.com/sumeet57/PayGuard"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-[#18181b] transition"
            >
              <FiGithub size={16} />
            </a>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">

        {/* SIDEBAR */}
        <aside
          className={`
            fixed lg:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-64 shrink-0 
            border-r border-[#27272a] bg-[#09090b] overflow-y-auto p-5 transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="space-y-6">
            {docSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-mono text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className="block px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-[#18181b] transition font-mono"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 lg:py-10 max-w-4xl">

          {/* OVERVIEW */}
          <section id="overview" className="pb-10 border-b border-[#27272a]">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 font-mono text-[11px] text-orange-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              v0.1.1 Documentation
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              PayGuard Runtime
            </h1>

            <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-2xl">
              PayGuard acts as a deterministic security boundary and orchestration layer sitting directly 
              between autonomous AI agents and payment gateways (like Razorpay). It prevents unauthorized agent capital flight through hard-coded policy constraints, real-time risk checks, and human approval workflows.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] font-mono text-xs text-zinc-300">
                <FiTerminal className="text-orange-500" />
                <code>{codeExamples.install}</code>
                <button
                  onClick={copyCommand}
                  className="ml-2 text-zinc-500 hover:text-white transition"
                >
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                </button>
              </div>

              <a
                href={PLAYGROUND_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
              >
                Launch Playground
                <FiExternalLink size={13} />
              </a>

              {/* get api key naviagte toi /dashboard */}
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
              >
                Get API Key
              </button>
            </div>
          </section>

          {/* ARCHITECTURE DIAGRAM */}
          <section id="architecture" className="py-10 border-b border-[#27272a]">
            <div className="mb-6">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Execution Pipeline
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Architecture Flow</h2>
              <p className="mt-2 text-sm text-zinc-400">
                A single control plane where payment requests are intercepted, evaluated against business rules, and conditionally authorized.
              </p>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#121215] p-6 sm:p-8 space-y-4">
              
              {/* Step 1: Agent Request */}
              <div className="flex items-center gap-4 p-3.5 rounded-lg border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <BsRobot size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1. Autonomous AI Agent</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Issues payment intent with payload (amount, merchant, idempotencyKey)</p>
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-orange-500/40 relative">
                  <div className="absolute -bottom-1 -left-[3px] border-x-4 border-x-transparent border-t-4 border-t-orange-500/60" />
                </div>
              </div>

              {/* Step 2: PayGuard Engine */}
              <div className="flex items-center gap-4 p-3.5 rounded-lg border border-orange-500/30 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
                <div className="w-10 h-10 rounded-md bg-orange-500 text-black flex items-center justify-center shrink-0 font-bold">
                  <FiShield size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono">2. PayGuard Runtime</h4>
                  <p className="text-xs text-zinc-300 mt-0.5">Evaluates policy rules, idempotency cache, agent scopes, & risk parameters</p>
                </div>
              </div>

              {/* Connecting Branching Arrow */}
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-orange-500/40 relative">
                  <div className="absolute -bottom-1 -left-[3px] border-x-4 border-x-transparent border-t-4 border-t-orange-500/60" />
                </div>
              </div>

              {/* Decision Branches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Branch ALLOW */}
                <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-green-400">
                    <FiCheckCircle size={14} /> ALLOW
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Directly forwarded to Razorpay gateway execution</p>
                </div>

                {/* Branch APPROVAL */}
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-amber-400">
                    <FiClock size={14} /> APPROVAL
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Halted in pending state; triggers human webhook notification</p>
                </div>

                {/* Branch BLOCK */}
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-red-400">
                    <FiXCircle size={14} /> BLOCK
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Execution rejected immediately with security exception log</p>
                </div>

              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-6 bg-zinc-700 relative">
                  <div className="absolute -bottom-1 -left-[3px] border-x-4 border-x-transparent border-t-4 border-t-zinc-500" />
                </div>
              </div>

              {/* Step 3: Gateway */}
              <div className="flex items-center gap-4 p-3.5 rounded-lg border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <BsCreditCard2Front size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">3. Razorpay Gateway</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Executes actual fund movement upon valid authorization</p>
                </div>
              </div>

            </div>
          </section>

          {/* QUICK START CODE */}
          <section id="quick-start" className="py-10 border-b border-[#27272a]">
            <div className="mb-6">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Integration Guide
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Quick Start</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Initialize the runtime with your gateway secrets and database string, attach a policy, and register your agent.
              </p>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400">server.ts</span>
                <span className="font-mono text-[10px] text-zinc-500">TypeScript</span>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.init}</code>
              </pre>
            </div>
          </section>

          {/* FEATURE 1: POLICY ENGINE */}
          <section id="policies" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Deterministic Security
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Policy Rules Engine</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              PayGuard enforces strict non-bypassable constraints. When an agent requests a payment, the policy engine verifies the request against hard limits before triggering LLM evaluations.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Max Transaction Cap</h3>
                <p className="text-xs text-zinc-400 mt-1">Hard ceilings on individual payments. Any request exceeding this limit is immediately blocked with zero gateway contact.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Merchant Whitelisting</h3>
                <p className="text-xs text-zinc-400 mt-1">Restrict agents to pre-approved merchant IDs, preventing money transfers to unverified endpoints.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Velocity Limits</h3>
                <p className="text-xs text-zinc-400 mt-1">Specify maximum allowable aggregate spend within hourly or daily sliding windows.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Currency Guardrails</h3>
                <p className="text-xs text-zinc-400 mt-1">Enforce allowed ISO currency codes to avoid cross-currency conversion exploits.</p>
              </div>
            </div>
          </section>

          {/* FEATURE 2: HUMAN APPROVALS */}
          <section id="approvals" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Human-In-The-Loop
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Human Approval Workflows</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              High-value or ambiguous transactions shouldn't execute automatically. Setting <code className="text-orange-400 font-mono">requireApprovalAbove</code> pauses payments and emits an authorization ticket.
            </p>

            <div className="p-5 rounded-xl border border-[#27272a] bg-[#121215] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-[#27272a] pb-2">
                <span>Approval Flow Lifecycle</span>
                <span className="text-amber-400">STATUS: PENDING_HUMAN_REVIEW</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 leading-relaxed">
                <li>Agent submits a payment request exceeding the instant-execution threshold.</li>
                <li>PayGuard creates a pending payment intent record and generates a signed approval payload.</li>
                <li>A webhook notification fires to your admin application, Slack bot, or internal dashboard.</li>
                <li>An authorized admin calls <code className="text-orange-400 font-mono">payguard.approvals.approve(intentId)</code> or rejects the request.</li>
                <li>Upon approval, PayGuard unlocks the intent and sends it to Razorpay for processing.</li>
              </ol>
            </div>
          </section>

          {/* FEATURE 3: INTELLIGENCE MODES */}
          <section id="modes" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Flexibility
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Supported Intelligence Modes</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              PayGuard allows choosing how secondary risk evaluations are calculated. The engine stays independent of individual LLM providers.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">No AI Mode</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-[#27272a]">
                      Deterministic
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">Zero reliance on LLMs. Pure, high-speed rule-based evaluation suitable for low-latency pipelines.</p>
                </div>
                <code className="mt-4 font-mono text-[10px] text-orange-400">mode: "NO_AI"</code>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Developer AI</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-[#27272a]">
                      BYO Credentials
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">Pass your own OpenAI, Anthropic, or custom endpoint credentials with tailored prompts.</p>
                </div>
                <code className="mt-4 font-mono text-[10px] text-orange-400">mode: "BYO_AI"</code>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Managed AI</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-[#27272a]">
                      Turnkey
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">Managed investigation and anomaly detection directly backed by PayGuard Intelligence engines.</p>
                </div>
                <code className="mt-4 font-mono text-[10px] text-orange-400">mode: "PAYGUARD_INTELLIGENCE"</code>
              </div>
            </div>
          </section>

          {/* FEATURE 4: IDEMPOTENCY */}
          <section id="idempotency" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Financial Guardrails
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Idempotency Execution</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Autonomous agents operating inside retry loops can inadvertently trigger duplicate payments. PayGuard enforces idempotency keys at the runtime level.
            </p>
            <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215] space-y-2 text-xs text-zinc-300">
              <p>• Every payment request must specify a unique <code className="text-orange-400 font-mono">idempotencyKey</code>.</p>
              <p>• PayGuard checks state store before executing any operation.</p>
              <p>• If an operational attempt with the same key was already processed, PayGuard returns the cached result without re-executing against Razorpay.</p>
            </div>
          </section>

          {/* FEATURE 5: WEBHOOKS */}
          <section id="webhooks" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Event Subscriptions
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Webhooks & Event Handlers</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              PayGuard dispatches real-time HMAC-SHA256 signed webhooks to inform backend applications of transaction state transitions.
            </p>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden mb-4">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] font-mono text-xs text-zinc-400">
                webhookHandler.ts
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.webhook}</code>
              </pre>
            </div>
          </section>

          {/* FEATURE 6: RECONCILIATION */}
          <section id="reconciliation" className="py-10 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Auditability & Background Workers
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Reconciliation Engine</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              PayGuard provides a dedicated <code className="text-orange-400 font-mono">ReconciliationWorker</code> that periodically cleans up stale, expired transactions and synchronizes pending database states with actual gateway records.
            </p>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden mb-6">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] font-mono text-xs text-zinc-400 flex items-center justify-between">
                <span>reconciliationWorker.ts</span>
                <span className="text-orange-400 text-[10px]">Background Worker</span>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.reconciliation}</code>
              </pre>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <FiRefreshCw className="text-orange-500" /> Periodic State Polling
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5">Background execution resolves pending payment states and syncs with MongoDB collection records.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                  <FiClock className="text-orange-500" /> Expiry Threshold Enforcement
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5">Automatically handles unapproved or hung authorization requests exceeding configured timeout thresholds.</p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <div>
              PayGuard Runtime v0.1.1 &bull; Open-Source Documentation
            </div>
            <div className="flex items-center gap-4">
              <a href={PLAYGROUND_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-300">
                Playground
              </a>
              <a href="https://github.com/sumeet57/PayGuard" target="_blank" rel="noreferrer" className="hover:text-zinc-300">
                GitHub Repository
              </a>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}