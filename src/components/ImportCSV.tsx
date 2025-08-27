import { useState } from "react";
import { useTx } from "../context/TransactionsContext";

// Small CSV parser that supports quoted fields and ""-escaped quotes.
// Assumes first line is headers.
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === `"` && next === `"`) {
        cell += `"`; // escaped quote
        i++;
      } else if (ch === `"`) {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === `"`) {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch === "\r") {
        // ignore CR (CRLF)
      } else {
        cell += ch;
      }
    }
  }
  // push last cell/row
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 1 && r[0] === "") continue; // skip blank lines
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    out.push(obj);
  }
  return out;
}

export default function ImportCSV() {
  const { addTxns, addCategory } = useTx();
  const [result, setResult] = useState<string>("");

  const onFile = async (file: File) => {
    const text = await file.text();
    const rows = parseCSV(text);

    // Map CSV rows to Transactions (id optional)
    const items = rows.map((r) => ({
      // keep id if present; context will dedupe/replace if needed
      id: r.id,
      type: r.type === "income" ? "income" : "expense",
      amount: Number(r.amount || 0),
      category: r.category || "Other",
      note: r.note || undefined,
      date: r.date || new Date().toISOString(),
    }));

    // seed categories that appear in CSV
    const uniqueCats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
    uniqueCats.forEach(addCategory);

    const { added, skipped } = addTxns(items as any);
    setResult(`Imported: ${added} rows • Skipped: ${skipped}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    // reset so the same file can be selected again
    e.currentTarget.value = "";
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
      <label style={{ display: "inline-block" }}>
        <input type="file" accept=".csv,text/csv" onChange={handleChange} style={{ display: "none" }} />
        <span style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8, cursor: "pointer" }}>
          Import CSV
        </span>
      </label>
      <span style={{ fontSize: 12, color: "#555" }}>
        CSV should have headers: id, type, amount, category, note, date
      </span>
      {result && <strong style={{ marginLeft: "auto" }}>{result}</strong>}
    </div>
  );
}
