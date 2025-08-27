import React, { useState } from "react";
import { useTx } from "../context/TransactionsContext";

export default function TransactionForm() {
  const { addTxn, categories, addCategory } = useTx();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Other");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const quickAddCategory = () => {
    const name = window.prompt("New category name:");
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    addCategory(clean);
    setCategory(clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    addTxn({
      type,
      amount: amt,
      category,
      note: note.trim() || undefined,
      date: new Date(date).toISOString(),
    });
    setAmount("");
    setNote("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 560, marginTop: 16 }}>
      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <div style={{ display: "flex", gap: 8 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="button" onClick={quickAddCategory} title="Add new category">+ Category</button>
      </div>

      <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}

