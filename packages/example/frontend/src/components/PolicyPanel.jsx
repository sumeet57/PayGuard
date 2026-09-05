import { useState } from "react";
import { api } from "../api.js";

export default function PolicyPanel({ policy, onPolicyUpdated }) {
  const [maxAmount, setMaxAmount] = useState(policy.maxTransactionAmount);
  const [approvalAbove, setApprovalAbove] = useState(policy.requireApprovalAbove);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text }

  const dirty =
    Number(maxAmount) !== policy.maxTransactionAmount ||
    Number(approvalAbove) !== policy.requireApprovalAbove;

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await api.updatePolicy({
        maxTransactionAmount: Number(maxAmount),
        requireApprovalAbove: Number(approvalAbove),
      });
      onPolicyUpdated(result.policy);
      setMessage({ type: "success", text: "Limits updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <h2>Spending limits</h2>
      <p className="hint">
        The only PayGuard settings this console can change. Razorpay keys, storage, and the
        PayGuard API connection are fixed on the server.
      </p>

      <div className="field">
        <label htmlFor="max-amount">Max transaction amount</label>
        <div className="amount-input">
          <span>₹</span>
          <input
            id="max-amount"
            type="number"
            min="1"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="approval-above">Require approval above</label>
        <div className="amount-input">
          <span>₹</span>
          <input
            id="approval-above"
            type="number"
            min="1"
            value={approvalAbove}
            onChange={(e) => setApprovalAbove(e.target.value)}
          />
        </div>
        <div className="range-note">
          <span>Must be ≤ max amount</span>
          <span>
            currently ₹{policy.requireApprovalAbove} / ₹{policy.maxTransactionAmount}
          </span>
        </div>
      </div>

      <button className="btn" onClick={save} disabled={!dirty || saving}>
        {saving ? "Saving…" : "Save limits"}
      </button>

      {message && (
        <p className={message.type === "error" ? "inline-error" : "inline-success"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
