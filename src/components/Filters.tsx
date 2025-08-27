// ...existing code...
import { useTx } from "../context/TransactionsContext";

export default function Filters() {
  const { search, setSearch, typeFilter, setTypeFilter } = useTx();

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16, maxWidth: 520 }}>
      <input
        placeholder="Search note or category…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ flex: 1, padding: 8 }}
      />
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value as any)}
        style={{ padding: 8 }}
      >
        <option value="all">All</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
    </div>
  );
}
