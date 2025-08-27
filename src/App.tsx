import React from "react";
import { TransactionsProvider } from "./context/TransactionsContext";
import TransactionForm from "./components/TransactionForm";
import Filters from "./components/Filters";
import ExportCSV from "./components/ExportCSV";
import ImportCSV from "./components/ImportCSV";
import CategoryTotals from "./components/CategoryTotals";
import MonthlyChart from "./components/MonthlyChart";
import TransactionList from "./components/TransactionList";
import CurrencyToggle from "./components/CurrencyToggle";
import ClearAll from "./components/ClearAll";

export default function App() {
  return (
    <TransactionsProvider>
      <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0 }}>Personal Finance Dashboard</h1>
            <p className="muted" style={{ marginTop: 4 }}>Track, filter, import/export, edit inline, and visualize by month.</p>
          </div>
          <CurrencyToggle />
          <ClearAll />
        </header>

        <TransactionForm />
        <Filters />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <ExportCSV />
          <ImportCSV />
        </div>
        <CategoryTotals />
        <MonthlyChart />
        <TransactionList />
      </main>
    </TransactionsProvider>
  );
}
