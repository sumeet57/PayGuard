
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FiArrowRight,
  FiGithub,
  FiShield,
  FiLock,
  FiActivity,
  FiCode,
  FiChevronRight,
  FiXCircle,
} from "react-icons/fi";

import {
  BsRobot,
  BsCreditCard2Front,
} from "react-icons/bs";


/* =============================================================
   DATA
============================================================= */

const features = [
  {
    icon: FiShield,
    title: "Policy enforcement",
    text: "Set transaction limits, approval thresholds and agent capabilities.",
  },
  {
    icon: FiActivity,
    title: "Behavior protection",
    text: "Detect unusual spending, velocity and merchant behavior.",
  },
  {
    icon: FiLock,
    title: "Controlled execution",
    text: "AI recommends. PayGuard decides. Razorpay executes.",
  },
  {
    icon: FiCode,
    title: "Idempotent payments",
    text: "Protect financial operations from duplicate requests and retries.",
  },
];


const modes = [
  {
    name: "No AI",
    code: "NO_AI",
    text: "Deterministic security without an LLM.",
  },
  {
    name: "Developer AI",
    code: "BYO_AI",
    text: "Use your own AI provider and credentials.",
  },
  {
    name: "PayGuard AI",
    code: "PAYGUARD_INTELLIGENCE",
    text: "Use managed AI investigation through PayGuard.",
  },
];


/* =============================================================
   PAGE
============================================================= */

export default function PayGuardHomePage() {
  return (
    <main className="min-h-screen text-primary">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >

            {/* eyebrow */}

            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono text-muted mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-highlight)",
                }}
              />

              open-source agentic payment security
            </div>


            {/* heading */}

            <h1 className="font-display font-black tracking-tight leading-[1.05] text-[2.8rem] sm:text-6xl lg:text-[4.5rem]">
              Let AI agents
              <br />

              <span
                style={{
                  color: "var(--color-highlight)",
                }}
              >
                move money safely.
              </span>
            </h1>


            {/* description */}

            <p className="mt-5 mx-auto max-w-2xl text-sm sm:text-base text-muted leading-6">
              PayGuard is a security and orchestration runtime between
              autonomous agents and payment infrastructure.
            </p>


            {/* actions */}

            <div className="flex justify-center flex-wrap gap-2.5 mt-7">

              <Link
                to="/playground"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-lg
                  text-sm
                  font-mono
                  font-semibold
                  text-white
                "
                style={{
                  backgroundColor: "var(--color-highlight)",
                }}
              >
                Try Playground

                <FiArrowRight size={14} />
              </Link>


              <Link
                to="/dashboard"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-lg
                  text-sm
                  font-mono
                  border
                  border-surface
                  text-muted
                  hover:text-primary
                  transition
                "
              >
                Get API Key
              </Link>


              <a
                href="https://github.com/YOUR_USERNAME/payguard"
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  font-mono
                  text-muted
                  hover:text-primary
                  transition
                "
              >
                <FiGithub size={15} />

                GitHub
              </a>

            </div>


            {/* install */}

            <div
              className="
                inline-flex
                items-center
                mt-5
                px-3
                py-2
                rounded-md
                border
                border-surface
                bg-surface/20
                font-mono
                text-[11px]
                sm:text-xs
                text-muted
              "
            >
              npm install payguard-core
            </div>

          </motion.div>

        </div>
      </section>



      {/* =====================================================
          PAYMENT FLOW
      ===================================================== */}

      <section className="px-4 sm:px-6 py-12 sm:py-16 border-y border-surface">

        <div className="max-w-5xl mx-auto">

          {/* heading */}

          <div className="mb-8">

            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              payment flow
            </span>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-display">
              AI proposes. PayGuard controls.
            </h2>

            <p className="mt-2 text-sm text-muted max-w-xl">
              Every payment passes through a security boundary before
              reaching the payment infrastructure.
            </p>

          </div>


          {/* diagram container */}

          <div
            className="
              rounded-xl
              border
              border-surface
              bg-surface/10
              p-4
              sm:p-8
            "
          >

            <div className="flex flex-col items-center">


              {/* =================================================
                  AI AGENT
              ================================================= */}

              <FlowItem
                icon={<BsRobot />}
                title="AI Agent"
                text="payment intent"
              />


              {/* connector */}

              <FlowLine />



              {/* =================================================
                  PAYGUARD
              ================================================= */}

              <FlowItem
                icon={<FiShield />}
                title="PayGuard Core"
                text="identity · policy · risk"
                active
              />



              {/* =================================================
                  DECISION BRANCH
              ================================================= */}

              <DecisionFlow />



              {/* =================================================
                  RAZORPAY
              ================================================= */}

              <FlowItem
                icon={<BsCreditCard2Front />}
                title="Razorpay"
                text="authorized execution"
              />


              {/* connector */}

              <FlowLine />


              {/* =================================================
                  VERIFICATION
              ================================================= */}

              <FlowItem
                icon={<FiActivity />}
                title="Verification"
                text="webhooks · reconciliation"
              />

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          SIMPLE EXPLANATION
      ===================================================== */}

      <section className="px-4 sm:px-6 py-10 border-y border-surface">

        <div className="max-w-5xl mx-auto">

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-8">

            <SimplePoint
              number="01"
              title="Agent requests"
              text="Your AI agent asks PayGuard to perform a payment."
            />

            <SimplePoint
              number="02"
              title="PayGuard evaluates"
              text="Identity, policies and risk are checked before execution."
            />

            <SimplePoint
              number="03"
              title="Payment executes"
              text="Only an authorized operation reaches Razorpay."
            />

          </div>

        </div>

      </section>



      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="px-4 sm:px-6 py-12 sm:py-16">

        <div className="max-w-5xl mx-auto">

          <div className="mb-7">

            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              core runtime
            </span>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-display">
              Security without giving AI the keys.
            </h2>

          </div>


          <div className="divide-y divide-[var(--color-surface)] border-y border-surface">

            {features.map((feature, index) => {

              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                  }}
                  whileInView={{
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="
                    py-4
                    sm:py-5
                    flex
                    gap-4
                    items-start
                  "
                >

                  <div
                    className="
                      shrink-0
                      w-8
                      h-8
                      rounded-lg
                      border
                      border-surface
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      color: "var(--color-highlight)",
                    }}
                  >
                    <Icon size={15} />
                  </div>


                  <div className="min-w-0">

                    <h3 className="text-sm sm:text-[15px] font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-1 text-xs sm:text-sm text-muted leading-5">
                      {feature.text}
                    </p>

                  </div>

                </motion.div>
              );

            })}

          </div>

        </div>

      </section>



      {/* =====================================================
          CODE
      ===================================================== */}

      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-surface/10">

        <div className="max-w-5xl mx-auto">

          <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-7 lg:gap-10 items-start">


            {/* left */}

            <div>

              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                quick start
              </span>

              <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-display">
                Three steps to protect a payment agent.
              </h2>

              <p className="mt-3 text-sm text-muted leading-5">
                Install the SDK, configure your payment infrastructure and
                register your agent.
              </p>


              <Link
                to="/playground"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-mono
                  font-semibold
                "
                style={{
                  color: "var(--color-highlight)",
                }}
              >
                Open interactive playground

                <FiChevronRight size={13} />
              </Link>

            </div>



            {/* code */}

            <div
              className="
                rounded-xl
                border
                border-surface
                overflow-hidden
                bg-[#0b0b0b]
              "
            >

              <div
                className="
                  px-4
                  py-2.5
                  border-b
                  border-white/10
                  text-[10px]
                  font-mono
                  text-gray-500
                "
              >
                example.ts
              </div>


              <pre
                className="
                  p-4
                  overflow-x-auto
                  text-[11px]
                  sm:text-xs
                  leading-5
                  text-gray-300
                  font-mono
                "
              >
                <code>{`import { PayGuard } from "payguard-core";

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI,
  },

  policy: {
    maxTransactionAmount: 25000,
    requireApprovalAbove: 15000,
  },
});

const agent = await payguard.agent({
  id: "shopping-agent-1",
  name: "Shopping Agent",
  capabilities: ["shopping", "payment"],
});

await agent.pay({
  amount: 200,
  currency: "INR",
  merchant: { id: "merchant-123" },
  reason: "Purchase of electronics",
  idempotencyKey: "txn-002",
});`}</code>
              </pre>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          AI MODES
      ===================================================== */}

      <section className="px-4 sm:px-6 py-12 sm:py-16">

        <div className="max-w-5xl mx-auto">

          <div className="mb-7">

            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              intelligence
            </span>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold font-display">
              Use AI your way.
            </h2>

            <p className="mt-2 text-sm text-muted max-w-xl">
              PayGuard Core stays independent from the intelligence provider.
            </p>

          </div>



          <div className="grid md:grid-cols-3 border border-surface rounded-xl overflow-hidden">

            {modes.map((mode, index) => (

              <div
                key={mode.code}
                className={`
                  p-4
                  sm:p-5
                  ${
                    index !== modes.length - 1
                      ? "border-b md:border-b-0 md:border-r border-surface"
                      : ""
                  }
                `}
              >

                <div className="flex items-center justify-between">

                  <h3 className="text-sm font-semibold">
                    {mode.name}
                  </h3>

                  <span className="font-mono text-[9px] text-muted">
                    0{index + 1}
                  </span>

                </div>


                <p className="mt-2 text-xs text-muted leading-5 min-h-[40px]">
                  {mode.text}
                </p>


                <div
                  className="
                    mt-4
                    px-2.5
                    py-1.5
                    rounded-md
                    bg-surface/30
                    border
                    border-surface
                    font-mono
                    text-[9px]
                    text-muted
                    overflow-hidden
                    text-ellipsis
                  "
                >
                  {mode.code}
                </div>

              </div>

            ))}

          </div>



          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted font-mono">

            <FiShield
              size={12}
              style={{
                color: "var(--color-highlight)",
              }}
            />

            The payment-security boundary remains active in every mode.

          </div>

        </div>

      </section>



      {/* =====================================================
          PLAYGROUND CTA
      ===================================================== */}

      <section className="px-4 sm:px-6 pb-12 sm:pb-16">

        <div className="max-w-5xl mx-auto">

          <div
            className="
              rounded-xl
              border
              border-surface
              p-6
              sm:p-8
              flex
              flex-col
              sm:flex-row
              items-start
              sm:items-center
              justify-between
              gap-5
            "
          >

            <div>

              <h2 className="text-xl sm:text-2xl font-bold font-display">
                See PayGuard in action.
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-muted">
                Test policies, payment requests and agent behavior in the
                playground.
              </p>

            </div>


            <Link
              to="/playground"
              className="
                shrink-0
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-lg
                text-xs
                font-mono
                font-semibold
                text-white
              "
              style={{
                backgroundColor: "var(--color-highlight)",
              }}
            >
              Launch Playground

              <FiArrowRight size={13} />
            </Link>

          </div>

        </div>

      </section>



      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-surface px-4 sm:px-6 py-7">

        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div>

            <div className="font-display font-bold text-sm">
              PayGuard
            </div>

            <div className="mt-1 text-[11px] text-muted font-mono">
              Agentic Payment Security & Orchestration Runtime
            </div>

          </div>


          <div className="flex items-center gap-4 text-xs font-mono text-muted">

            <Link
              to="/playground"
              className="hover:text-primary transition"
            >
              Playground
            </Link>


            <Link
              to="/dashboard"
              className="hover:text-primary transition"
            >
              API Key
            </Link>


            <a
              href="https://github.com/YOUR_USERNAME/payguard"
              target="_blank"
              rel="noreferrer"
              className="
                flex
                items-center
                gap-1.5
                hover:text-primary
                transition
              "
            >
              <FiGithub size={13} />

              GitHub
            </a>

          </div>

        </div>

      </footer>

    </main>
  );
}



/* =============================================================
   PAYMENT FLOW
============================================================= */

function DecisionFlow() {
  return (
    <div className="w-full max-w-3xl">


      {/* =======================================================
          PAYGUARD → BRANCH
      ======================================================= */}

      <div className="flex justify-center">

        <div
          className="w-[2px] h-8"
          style={{
            backgroundColor: "rgba(255,255,255,0.22)",
          }}
        />

      </div>



      {/* =======================================================
          MOBILE DECISIONS
      ======================================================= */}

      <div className="sm:hidden flex flex-col items-center gap-0">

        <DecisionConnectorMobile />

        <Decision
          label="ALLOW"
          description="execute automatically"
          type="allow"
        />

        <DecisionConnectorMobile />

        <Decision
          label="APPROVAL"
          description="requires authorization"
          type="approval"
        />

        <DecisionConnectorMobile />

        <Decision
          label="BLOCK"
          description="payment rejected"
          type="block"
        />

        <div className="flex justify-center">

          <div
            className="w-[2px] h-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

        </div>

      </div>



      {/* =======================================================
          DESKTOP DECISIONS
      ======================================================= */}

      <div className="hidden sm:block">

        {/* horizontal branch line */}

        <div className="relative h-8">

          {/* center vertical */}

          <div
            className="
              absolute
              left-1/2
              top-0
              bottom-0
              w-[2px]
              -translate-x-1/2
            "
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />


          {/* horizontal */}

          <div
            className="
              absolute
              left-[16.66%]
              right-[16.66%]
              top-1/2
              h-[2px]
            "
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

        </div>



        {/* decision cards */}

        <div className="grid grid-cols-3 gap-4">

          <div className="flex flex-col items-center">

            <div
              className="w-[2px] h-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />

            <Decision
              label="ALLOW"
              description="execute automatically"
              type="allow"
            />

          </div>


          <div className="flex flex-col items-center">

            <div
              className="w-[2px] h-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />

            <Decision
              label="APPROVAL"
              description="requires authorization"
              type="approval"
            />

          </div>


          <div className="flex flex-col items-center">

            <div
              className="w-[2px] h-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />

            <Decision
              label="BLOCK"
              description="payment rejected"
              type="block"
            />

          </div>

        </div>



        {/* =====================================================
            RECONNECT
        ===================================================== */}

        <div className="relative h-10">


          {/* left decision → center */}

          <div
            className="
              absolute
              left-[16.66%]
              top-0
              w-[16.67%]
              h-[2px]
            "
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />


          {/* center → approval */}

          <div
            className="
              absolute
              left-1/2
              top-0
              w-[16.67%]
              h-[2px]
            "
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />


          {/* center vertical */}

          <div
            className="
              absolute
              left-1/2
              top-0
              bottom-0
              w-[2px]
              -translate-x-1/2
            "
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

        </div>


        {/* final vertical */}

        <div className="flex justify-center">

          <div
            className="w-[2px] h-6"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

        </div>

      </div>

    </div>
  );
}



/* =============================================================
   MOBILE DECISION CONNECTOR
============================================================= */

function DecisionConnectorMobile() {
  return (
    <div className="flex justify-center">

      <div
        className="w-[2px] h-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />

    </div>
  );
}



/* =============================================================
   FLOW ITEM
============================================================= */

function FlowItem({
  icon,
  title,
  text,
  active = false,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        w-full
        max-w-md
        flex
        items-center
        gap-3
        rounded-lg
        border
        px-3
        py-3
      "
      style={{
        borderColor: active
          ? "var(--color-highlight)"
          : "var(--color-surface)",

        background: active
          ? "rgba(249,115,22,0.055)"
          : "transparent",

        boxShadow: active
          ? "0 0 0 1px rgba(249,115,22,0.08)"
          : "none",
      }}
    >

      {/* icon */}

      <div
        className="
          w-8
          h-8
          shrink-0
          rounded-md
          border
          border-surface
          flex
          items-center
          justify-center
        "
        style={{
          color: "var(--color-highlight)",
        }}
      >
        {icon}
      </div>


      {/* content */}

      <div className="min-w-0">

        <div className="text-xs font-semibold">
          {title}
        </div>

        <div className="text-[9px] text-muted font-mono mt-0.5 truncate">
          {text}
        </div>

      </div>

    </motion.div>
  );
}



/* =============================================================
   FLOW LINE
============================================================= */

function FlowLine() {
  return (
    <div className="flex justify-center">

      <div
        className="w-[2px] h-8"
        style={{
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />

    </div>
  );
}



/* =============================================================
   DECISION
============================================================= */

function Decision({
  label,
  description,
  type = "allow",
}) {

  const isBlock = type === "block";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        w-full
        text-center
        rounded-lg
        border
        px-3
        py-3
        bg-surface/10
      "
      style={{
        borderColor: isBlock
          ? "rgba(255,255,255,0.12)"
          : "var(--color-surface)",
      }}
    >

      <div
        className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-semibold"
        style={{
          color: isBlock
            ? "var(--color-muted)"
            : "var(--color-primary)",
        }}
      >

        {isBlock && (
          <FiXCircle size={11} />
        )}

        {label}

      </div>


      <div className="mt-1 text-[8px] sm:text-[9px] text-muted leading-4">
        {description}
      </div>

    </motion.div>
  );
}



/* =============================================================
   SIMPLE POINT
============================================================= */

function SimplePoint({
  number,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">

      <span
        className="
          shrink-0
          font-mono
          text-[10px]
          pt-0.5
        "
        style={{
          color: "var(--color-highlight)",
        }}
      >
        {number}
      </span>


      <div>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-xs text-muted leading-5">
          {text}
        </p>

      </div>

    </div>
  );
}

