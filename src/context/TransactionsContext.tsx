import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Transaction } from "../types";

type Filters = "all" | "expense" | "income";

type Ctx = {
  // data
  txns: Transaction[];
  addTxn: (t: Omit<Transaction, "id">) => void;
  addTxns: (items: Omit<Transaction, "id">[] | Transaction[]) => { added: number; skipped: number };
  updateTxn: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  removeTxn: (id: string) => void;
  clearAll: () => void;

  // filters/search
  typeFilter: Filters;
  setTypeFilter: (t: Filters) => void;
  search: string;
  setSearch: (s: string) => void;

  // categories
  categories: string[];
  addCategory: (name: string) => void;

  // currency
  currency: string;
  setCurrency: (c: string) => void;
};

const TxContext = createContext<Ctx | null>(null);

const LS_TXNS = "pf_txns_v1";
const LS_CATS = "pf_categories_v1";
const LS_CURR = "pf_currency_v1";
const DEFAULT_CATS = ["Groceries", "Rent", "Utilities", "Transport", "Dining", "Salary", "Other"];
const DEFAULT_CURRENCY = "USD";

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [txns, setTxns] = useState<Transaction[]>(() => {
    const raw = localStorage.getItem(LS_TXNS);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const raw = localStorage.getItem(LS_CATS);
    return raw ? (JSON.parse(raw) as string[]) : DEFAULT_CATS.slice();
  });
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem(LS_CURR) || DEFAULT_CURRENCY);

  const [typeFilter, setTypeFilter] = useState<Filters>("all");
  const [search, setSearch] = useState("");

  useEffect(() => localStorage.setItem(LS_TXNS, JSON.stringify(txns)), [txns]);
  useEffect(() => localStorage.setItem(LS_CATS, JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem(LS_CURR, currency), [currency]);

  const ensureCategory = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setCategories((prev) => (prev.includes(n) ? prev : [...prev, n]));
  };

  const addTxn: Ctx["addTxn"] = (t) => {
    ensureCategory(t.category);
    setTxns((prev) => [{ id: crypto.randomUUID(), ...t }, ...prev]);
  };

  const addTxns: Ctx["addTxns"] = (items) => {
    const existing = new Set(txns.map((x) => x.id));
    let added = 0, skipped = 0;
    const next: Transaction[] = [];

    for (const raw of items) {
      const t = raw as Transaction;
      const record: Transaction = {
        id: "id" in t && t.id ? (existing.has(String(t.id)) ? crypto.randomUUID() : String(t.id)) : crypto.randomUUID(),
        type: t.type === "income" ? "income" : "expense",
        amount: Number(t.amount) || 0,
        category: String(t.category || "Other"),
        note: t.note ? String(t.note) : undefined,
        date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      };
      if (record.amount <= 0) { skipped++; continue; }
      ensureCategory(record.category);
      existing.add(record.id);
      next.push(record);
      added++;
    }
    if (next.length) setTxns((prev) => [...next, ...prev]);
    return { added, skipped };
  };

  const updateTxn: Ctx["updateTxn"] = (id, patch) => {
    if (patch.category) ensureCategory(patch.category);
    setTxns((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeTxn = (id: string) => setTxns((prev) => prev.filter((t) => t.id !== id));

  const clearAll = () => {
    if (!confirm("Delete ALL transactions and reset categories?")) return;
    setTxns([]);
    setCategories(DEFAULT_CATS.slice());
    // keep currency preference
    localStorage.removeItem(LS_TXNS);
    localStorage.setItem(LS_CATS, JSON.stringify(DEFAULT_CATS));
  };

  const value = useMemo(
    () => ({
      txns, addTxn, addTxns, updateTxn, removeTxn, clearAll,
      typeFilter, setTypeFilter, search, setSearch,
      categories, addCategory: ensureCategory,
      currency, setCurrency,
    }),
    [txns, typeFilter, search, categories, currency]
  );

  return <TxContext.Provider value={value}>{children}</TxContext.Provider>;
};

export const useTx = () => {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error("useTx must be used within TransactionsProvider");
  return ctx;
};
