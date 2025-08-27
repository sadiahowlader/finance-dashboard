import React from "react";
import { useTx } from "../context/TransactionsContext";

export default function ClearAll() {
  const { clearAll } = useTx();
  return (
    <button onClick={clearAll} style={{ padding: "8px 12px", border: "1px solid #c33", borderRadius: 8 }}>
      Clear All Data
    </button>
  );
}
