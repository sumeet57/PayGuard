import { useEffect, useState } from "react";
import { api } from "./api.js";
import PolicyPanel from "./components/PolicyPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ApprovalsPanel from "./components/ApprovalsPanel.jsx";
import TestCheckoutPanel from "./components/TestCheckoutPanel.jsx";
import "./App.css";

export default function App() {
  const [config, setConfig] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    api
      .getConfig()
      .then(setConfig)
      .catch((err) => setConnectionError(err.message));
  }, []);

  return (
    <div className="shell">
      <header className="masthead">
        <div>
          <h1>PayGuard console</h1>
          <div className="sub">Autonomous purchasing agent, test-mode payments</div>
        </div>
        <span className={`status-pill ${connectionError ? "err" : config ? "ok" : ""}`}>
          {connectionError ? "Server unreachable" : config ? "Connected" : "Connecting…"}
        </span>
      </header>

      {connectionError && (
        <p className="inline-error">
          Couldn't reach the server at the configured API URL: {connectionError}. Check that the
          backend is running and VITE_API_BASE_URL is set correctly.
        </p>
      )}

      {config && (
        <div className="grid">
          <div>
            <PolicyPanel policy={config.policy} onPolicyUpdated={(p) => setConfig((c) => ({ ...c, policy: p }))} />
            <TestCheckoutPanel
              razorpayKeyId={config.razorpayKeyId}
              maxAmount={config.policy.maxTransactionAmount}
            />
          </div>
          <div>
            <ChatPanel catalog={config.catalog} razorpayKeyId={config.razorpayKeyId} />
            <ApprovalsPanel razorpayKeyId={config.razorpayKeyId} />
          </div>
        </div>
      )}
    </div>
  );
}