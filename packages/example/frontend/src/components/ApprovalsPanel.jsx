import { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import { openRazorpayCheckout, isPayable } from "../razorpayCheckout.js";

export default function ApprovalsPanel({ razorpayKeyId }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [payStatus, setPayStatus] = useState(null); // { type, text }
  const [rawResult, setRawResult] = useState(null); // shown when auto-detection can't find an order id

  const refresh = useCallback(async () => {
    try {
      const result = await api.getPendingApprovals();
      setPending(result.pending || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  async function act(item, action) {
    const id = item.id || item.approvalId;
    setActingOn(id);
    setPayStatus(null);
    setRawResult(null);
    try {
      const result = await api.actOnApproval(id, action, `${action.toLowerCase()} via console`);
      await refresh();

      if (action === "APPROVE") {
        setRawResult(result);
        if (!isPayable(result)) {
          setPayStatus({ type: "success", text: "Approved." });
          return;
        }
        openRazorpayCheckout({
          razorpayKeyId,
          result,
          description: item.reason || item.description || "Approved purchase",
          onResult: setPayStatus,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="panel">
      <h2>Approvals queue</h2>
      <p className="hint">
        Transactions above your approval threshold wait here. Approving opens Razorpay's test
        checkout for that transaction.
      </p>

      {loading && <div className="empty-state">Loading…</div>}
      {!loading && error && <p className="inline-error">{error}</p>}
      {!loading && !error && pending.length === 0 && (
        <div className="empty-state">Nothing waiting on approval right now.</div>
      )}

      {!loading && pending.length > 0 && (
        <table className="approvals-table">
          <thead>
            <tr>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pending.map((p) => {
              const id = p.id || p.approvalId;
              return (
                <tr key={id}>
                  <td>{p.reason || p.description || "—"}</td>
                  <td className="amount">₹{p.amount}</td>
                  <td>
                    <span className="badge hold">HOLD</span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn small approve-btn"
                        disabled={actingOn === id}
                        onClick={() => act(p, "APPROVE")}
                      >
                        {actingOn === id ? "Approving…" : "Approve & pay"}
                      </button>
                      <button
                        className="btn small reject-btn"
                        disabled={actingOn === id}
                        onClick={() => act(p, "REJECT")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {payStatus && (
        <p className={payStatus.type === "error" ? "inline-error" : "inline-success"}>
          {payStatus.text}
        </p>
      )}

      {rawResult && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: "0.82rem", color: "var(--muted)", cursor: "pointer" }}>
            Raw PayGuard result (paste this back if checkout didn't open)
          </summary>
          <pre style={{ fontSize: "0.76rem", overflowX: "auto", background: "var(--paper)", padding: 10, borderRadius: 6 }}>
            {JSON.stringify(rawResult, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}