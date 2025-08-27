import { useMemo } from "react";
import { useTx } from "../context/TransactionsContext";

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) =>
    '"' + String(v ?? "").replaceAll('"', '""').replaceAll(/\r?\n/g, ' ') + '"';
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return lines.join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportCSV() {
  const { txns, search, typeFilter } = useTx();

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
  }, [txns, search, typeFilter]);

  const mapRow = (t: typeof txns[number]) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    note: t.note ?? "",
    date: new Date(t.date).toISOString(),
  });

  const exportAll = () => {
    const csv = toCSV(txns.map(mapRow));
    downloadCSV("transactions_all.csv", csv);
  };

  const exportFiltered = () => {
    const csv = toCSV(filtered.map(mapRow));
    downloadCSV("transactions_filtered.csv", csv);
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button onClick={exportAll}>Export CSV (all)</button>
      <button onClick={exportFiltered}>Export CSV (filtered)</button>
    </div>
  );
}
