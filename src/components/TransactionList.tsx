import { useMemo } from "react";
import { useTx } from "../context/TransactionsContext";

export default function TransactionList() {
  const { txns, removeTxn, typeFilter, search } = useTx();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return txns.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (q) {
        const hay = `${t.category} ${t.note ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [txns, typeFilter, search]);

  const totals = filtered.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <span>Income: <strong>{fmt(totals.income)}</strong></span>
        <span>Expenses: <strong>{fmt(totals.expense)}</strong></span>
        <span>Net: <strong>{fmt(totals.income - totals.expense)}</strong></span>
      </div>

      <h2 style={{ margin: "6px 0 10px" }}>Transactions</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {filtered.map((t) => (
          <li key={t.id}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12,
                       display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {t.category} — {fmt(t.amount)} {t.type === "expense" ? "🔻" : "🔺"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {new Date(t.date).toLocaleDateString()} · {t.note ?? "—"}
              </div>
            </div>
            <button onClick={() => removeTxn(t.id)} style={{ padding: "6px 10px" }}>Delete</button>
          </li>
        ))}
        {filtered.length === 0 && <li style={{ color: "#777" }}>No transactions match your filters.</li>}
      </ul>
    </section>
  );
}

