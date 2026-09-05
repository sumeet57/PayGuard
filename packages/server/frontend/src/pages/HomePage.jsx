import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiShield,
  FiGithub,
  FiTerminal,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiStar,
  FiUser,
  FiKey,
} from "react-icons/fi";

const PLAYGROUND_URL = "https://payguardplayground.sumeet.app";
const GITHUB_URL = "https://github.com/sumeet57/PayGuard";
const PORTFOLIO_URL = "https://sumeet.app";

const docSections = [
  {
    title: "Getting Started",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Get API Key", href: "#get-api-key" },
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
  init: `import { PayGuard, PayGuardAIProvider } from "payguard";

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  storage: {
    database: "mongodb", // Currently active: MongoDB
    connectionString: process.env.MONGO_URI,
    collectionName: "payguard_transactions", // Optional (Defaults to "payguard_transactions")
  },
  policy: {
    maxTransactionAmount: 30000,   // Hard block for amounts > ₹30,000
    requireApprovalAbove: 10000,   // Triggers human review for amounts > ₹10,000
  },
  // Optional: Omit 'ai' property to run in Mode 1 (No AI / Deterministic Rules)
  ai: new PayGuardAIProvider({
    apiKey: process.env.PAYGUARD_API_KEY, // PayGuard AI API Key
  }),
});

// Register Agent Identity
const shoppingAgent = await payguard.agent({
  id: "shopping-agent-01",
  name: "Autonomous E-Commerce Agent",
  capabilities: ["e-commerce", "procurement", "payment"],
});

// Execute Secured Payment Intent
const result = await shoppingAgent.pay({
  amount: 8500,
  currency: "INR",
  merchant: { id: "merchant_electronics_01" },
  reason: "Procurement of development hardware (Catalog price: ₹8500 INR)",
  idempotencyKey: \`idemp_\${Date.now()}_\${Math.random().toString(36).slice(2)}\`,
});`,
  approvals: `// 1. Fetch pending approvals queue
const pending = await payguard.approvals.listPending();

// 2. Approve transaction (Unlocks execution & creates Razorpay Order)
await payguard.approvals.approve(approvalId);

// 3. Reject transaction (Halts execution and marks BLOCKED)
await payguard.approvals.reject(approvalId);`,
  webhook: `import express from "express";
import { RazorpayWebhookHandler } from "payguard";

const app = express();
const webhookHandler = new RazorpayWebhookHandler(payguard);

// NOTE: Use express.raw to preserve exact raw body buffer for signature verification
app.post(
  "/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const result = await webhookHandler.handleWebhook({
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
        rawBody: req.body,
        signature,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);`,
  reconciliation: `import { ReconciliationWorker } from "payguard";

const worker = new ReconciliationWorker(payguard);

// Run background worker periodically to sync stuck/UNKNOWN states
setInterval(async () => {
  const summary = await worker.runReconciliation(15); // Expiry threshold in minutes
  console.log(\`Reconciled \${summary.reconciledCount} pending transactions.\`);
}, 15 * 60 * 1000);`,
};

export default function PayGuardDocsPage() {
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
              
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-zinc-300 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] hover:text-white transition"
            >
              <FiStar className="text-amber-400" size={14} />
              <span>Star on GitHub</span>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 lg:py-10 max-w-4xl space-y-12">
          
          {/* OVERVIEW */}
          <section id="overview" className="pb-8 border-b border-[#27272a]">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 font-mono text-[11px] text-orange-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              PayGuard Security Runtime
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Agentic Payment Runtime
            </h1>

            <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-2xl">
              An open-source security runtime layer that enables autonomous AI agents to execute transactions on Razorpay safely. Enforces deterministic spending limits, behavioral risk checks, human approval workflows, idempotency locks, and background reconciliation.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] font-mono text-xs text-zinc-300">
                <FiTerminal className="text-orange-500" />
                <code>{codeExamples.install}</code>
                <button onClick={copyCommand} className="ml-2 text-zinc-500 hover:text-white transition">
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

              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
              >
                <FiKey size={13} />
                Get API Key for PayGuard AI
              </button>
            </div>
          </section>

          {/* GET API KEY INSTRUCTIONS */}
          <section id="get-api-key" className="pb-8 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-blue-400 font-medium">
                PayGuard Intelligence
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Get an API Key</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                To enable Mode 3 (PayGuard AI behavioral risk checks), obtain a free API key from the dashboard. Every account gets <strong className="text-white">100 free requests</strong> to test risk evaluation.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#27272a] bg-[#121215] space-y-4">
              <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2.5 font-mono">
                <li>Click the <strong className="text-blue-400">Get API Key</strong> button below to go to the dashboard.</li>
                <li>Create an account or sign in to your PayGuard developer portal.</li>
                <li>Click <strong className="text-white">"Create API Key"</strong> in your API settings tab.</li>
                <li>Copy your key and set it as <code className="text-orange-400">PAYGUARD_API_KEY</code> in your environment variables.</li>
              </ol>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
                >
                  <FiKey size={13} />
                  Go to Dashboard & Get Key
                </button>
              </div>
            </div>
          </section>

          {/* ARCHITECTURE FLOW */}
          <section id="architecture" className="pb-8 border-b border-[#27272a]">
            <div className="mb-6">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Execution Pipeline
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Architecture Flow</h2>
            </div>

            {/* CORE PIPELINE */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-semibold">Core Request Pipeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                  <div className="font-mono text-[10px] text-orange-500 font-bold uppercase mb-1">Step 1</div>
                  <h4 className="text-sm font-bold text-white mb-1">Payment Intent</h4>
                  <p className="text-xs text-zinc-400">Agent calls <code className="text-orange-400 font-mono">agent.pay()</code> with amount, merchant, and context.</p>
                </div>

                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                  <div className="font-mono text-[10px] text-orange-400 font-bold uppercase mb-1">Step 2</div>
                  <h4 className="text-sm font-bold text-orange-400 mb-1">PayGuard Security Check</h4>
                  <p className="text-xs text-zinc-300">Evaluates hard spending rules and runs contextual AI risk analysis.</p>
                </div>

                <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                  <div className="font-mono text-[10px] text-blue-400 font-bold uppercase mb-1">Step 3</div>
                  <h4 className="text-sm font-bold text-white mb-1">Razorpay Gateway</h4>
                  <p className="text-xs text-zinc-400">Creates Razorpay order upon valid authorization.</p>
                </div>
              </div>
            </div>

            {/* DECISION OUTCOMES - SEPARATED SECTION */}
            <div className="mt-8 space-y-3">
              <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-semibold">PayGuard Decision Outcomes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-green-400 mb-1">
                    <FiCheckCircle size={14} /> ALLOW
                  </div>
                  <p className="text-[11px] text-zinc-400">Passes all checks. Generates Razorpay Order instantly.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400 mb-1">
                    <FiClock size={14} /> REQUIRE_APPROVAL
                  </div>
                  <p className="text-[11px] text-zinc-400">Exceeds soft threshold. Pauses and waits for human operator.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-red-400 mb-1">
                    <FiXCircle size={14} /> BLOCK
                  </div>
                  <p className="text-[11px] text-zinc-400">Violates hard limits. Stops transaction before reaching gateway.</p>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK START CODE */}
          <section id="quick-start" className="pb-8 border-b border-[#27272a]">
            <div className="mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Integration
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Quick Start</h2>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between font-mono text-xs text-zinc-400">
                <span>server.js</span>
                <span className="text-[10px] text-zinc-500">Node.js</span>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.init}</code>
              </pre>
            </div>
          </section>

          {/* POLICY ENGINE */}
          <section id="policies" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Deterministic Security
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Policy Engine</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">maxTransactionAmount</h3>
                <p className="text-xs text-zinc-400 mt-1">Hard spending cap in INR. Purchases above this value trigger an immediate BLOCK decision.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <h3 className="text-xs font-bold text-white font-mono uppercase">requireApprovalAbove</h3>
                <p className="text-xs text-zinc-400 mt-1">Soft review limit in INR. Purchases between this value and max limit go to human approval.</p>
              </div>
            </div>
          </section>

          {/* HUMAN APPROVALS */}
          <section id="approvals" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Human-In-The-Loop
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Human Approval Workflow</h2>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden mt-4">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] font-mono text-xs text-zinc-400">
                approvals.js
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.approvals}</code>
              </pre>
            </div>
          </section>

          {/* INTELLIGENCE MODES */}
          <section id="modes" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Modes
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">3 AI Operating Modes</h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white font-mono">Mode 1: No AI</h3>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Active</span>
                </div>
                <p className="text-xs text-zinc-400">Omit 'ai' property. Evaluates transactions purely on spending rules.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white font-mono">Mode 2: BYO-AI</h3>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Roadmap</span>
                </div>
                <p className="text-xs text-zinc-400">Planned custom keys for OpenAI, Gemini, or local models.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#27272a] bg-[#121215]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white font-mono">Mode 3: Managed AI</h3>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Active</span>
                </div>
                <p className="text-xs text-zinc-400">Uses PayGuardAIProvider for remote behavioral risk analysis.</p>
              </div>
            </div>
          </section>

          {/* IDEMPOTENCY */}
          <section id="idempotency" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Reliability
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Idempotency Locks</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pass a unique <code className="text-orange-400 font-mono">idempotencyKey</code> in every <code className="text-orange-400 font-mono">agent.pay()</code> call to prevent duplicate charges from retry loops.
            </p>
          </section>

          {/* WEBHOOKS */}
          <section id="webhooks" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Events
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Razorpay Webhook Handler</h2>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] font-mono text-xs text-zinc-400">
                webhookHandler.js
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.webhook}</code>
              </pre>
            </div>
          </section>

          {/* RECONCILIATION */}
          <section id="reconciliation" className="pb-8 border-b border-[#27272a]">
            <div className="mb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-medium">
                Background Worker
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Reconciliation Engine</h2>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden">
              <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] font-mono text-xs text-zinc-400">
                reconciliationWorker.js
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{codeExamples.reconciliation}</code>
              </pre>
            </div>
          </section>

          {/* OPEN SOURCE & DEVELOPER INFO */}
          <section className="p-6 rounded-2xl border border-[#27272a] bg-[#121215] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Open Source & Contributions</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  PayGuard is open-source software under the MIT license. Pull requests, bug reports, and feature ideas are always welcome!
                </p>
              </div>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-orange-500 hover:bg-orange-600 transition shrink-0"
              >
                <FiStar size={14} />
                Star Project on GitHub
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400 pt-1">
              <div className="flex items-center gap-2">
                <FiUser className="text-orange-500" />
                <span>Created by <strong className="text-white">Sumeet</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
                  <FiExternalLink size={12} /> sumeet.app
                </a>
                <a href="https://github.com/sumeet57" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
                  <FiGithub size={12} /> @sumeet57
                </a>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="pt-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <div>PayGuard Core &bull; MIT License</div>
            <div className="flex items-center gap-4">
              <a href={PLAYGROUND_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-300">Playground</a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-300">GitHub</a>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}