import { useState } from "react";
import { api } from "../api.js";
import { openRazorpayCheckout, isPayable, findOrderId } from "../razorpayCheckout.js";

export default function ChatPanel({ catalog, razorpayKeyId }) {
  const [messages, setMessages] = useState([]); // { role: 'user'|'agent', text, pending? }
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [payStatus, setPayStatus] = useState(null);
  const [rawResult, setRawResult] = useState(null);

  async function send() {
    const prompt = input.trim();
    if (!prompt || sending) return;

    setInput("");
    setPayStatus(null);
    setRawResult(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt },
      { role: "agent", text: "Thinking…", pending: true },
    ]);
    setSending(true);

    try {
      const result = await api.sendPrompt(prompt);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "agent", text: result.agentOutput };
        return next;
      });

      if (result.paymentResult) {
        setRawResult(result.paymentResult);
        if (isPayable(result.paymentResult) && findOrderId(result.paymentResult)) {
          openRazorpayCheckout({
            razorpayKeyId,
            result: result.paymentResult,
            description: "Agent-initiated purchase",
            onResult: setPayStatus,
          });
        } else if (!isPayable(result.paymentResult)) {
          setPayStatus({ type: "success", text: "Sent for approval — check the queue below." });
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "agent", text: `Error: ${err.message}` };
        return next;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="panel">
      <h2>Purchasing agent</h2>
      <p className="hint">
        Ask it to buy something from the catalog. Purchases above the approval threshold land in
        the queue below instead of going straight through.
      </p>

      {catalog?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {catalog.map((item) => (
            <div className="catalog-row" key={item.id}>
              <span>{item.name}</span>
              <span className="price">₹{item.price}</span>
            </div>
          ))}
        </div>
      )}

      <div className="chat-log">
        {messages.length === 0 && (
          <div className="chat-empty">Try: "Buy a developer monitor for the new hire"</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}${m.pending ? " pending" : ""}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the agent to buy something…"
          disabled={sending}
        />
        <button className="btn" onClick={send} disabled={sending || !input.trim()}>
          Send
        </button>
      </div>

      {payStatus && (
        <p className={payStatus.type === "error" ? "inline-error" : "inline-success"}>
          {payStatus.text}
        </p>
      )}

      {rawResult && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: "0.82rem", color: "var(--muted)", cursor: "pointer" }}>
            Raw payment result (paste this back if checkout didn't open)
          </summary>
          <pre style={{ fontSize: "0.76rem", overflowX: "auto", background: "var(--paper)", padding: 10, borderRadius: 6 }}>
            {JSON.stringify(rawResult, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}