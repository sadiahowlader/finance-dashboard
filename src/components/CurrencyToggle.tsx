import React from "react";
import { useTx } from "../context/TransactionsContext";

const CODES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useTx();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label style={{ fontSize: 12, color: "#666" }}>Currency</label>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: 6 }}>
        {CODES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}
