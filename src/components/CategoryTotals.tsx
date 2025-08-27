import React, { useMemo, useState } from "react";
import { useTx } from "../context/TransactionsContext";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

function isoMonthToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CategoryTotals() {
  const { txns, search, typeFilter } = useTx();
  const [month, setMonth] = useState<string>(isoMonthToday()); // yyyy-MM

  const start = startOfMonth(new Date(`${month}-01T00:00:00`));
  const end = endOfMonth(start);
  // build a Set of yyyy-MM to test month quickly
  const days = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
  const inMonth = new Set(days);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byCat = new Map<string, { expense: number; income: number }>();

    for (const t of txns) {
      const key = format(new Date(t.date), "yyyy-MM-dd");
      if (!inMonth.has(key)) continue;

      if (typeFilter !== "all" && t.type !== typeFilter) continue;

      if (q) {
        const hay = `${t.category} ${t.note ?? ""}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      if (!byCat.has(t.category)) byCat.set(t.category, { expense: 0, income: 0 });
      const slot = byCat.get(t.category)!;
      if (t.type === "expense") slot.expense += t.amount;
      else slot.income += t.amount;
    }

    const arr = Array.from(byCat.entries()).map(([category, v]) => ({
      category,
      expense: v.expense,
      income: v.income,
      net: v.income - v.expense,
    }));

    // sort biggest absolute net first
    arr.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    return arr;
  }, [txns, month, search, typeFilter]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const totals = rows.reduce(
    (acc, r) => {
      acc.income += r.income;
      acc.expense += r.expense;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Category Totals</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#555" }}>
          Respects your search & type filters
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Category</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Expenses</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Income</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.category}>
                <td style={{ padding: 8 }}>{r.category}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{fmt(r.expense)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{fmt(r.income)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{fmt(r.net)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 12, color: "#777" }}>No data for this month.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th style={{ padding: 8, textAlign: "left" }}>Total</th>
              <th style={{ padding: 8, textAlign: "right" }}>{fmt(totals.expense)}</th>
              <th style={{ padding: 8, textAlign: "right" }}>{fmt(totals.income)}</th>
              <th style={{ padding: 8, textAlign: "right" }}>{fmt(totals.income - totals.expense)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
