import { useMemo, useState } from "react";
import { useTx } from "../context/TransactionsContext";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { eachDayOfInterval, startOfMonth, endOfMonth, format, parseISO } from "date-fns";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function isoMonthToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlyChart() {
  const { txns } = useTx();
  const [month, setMonth] = useState<string>(isoMonthToday()); // yyyy-MM

  const start = startOfMonth(new Date(`${month}-01T00:00:00`));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const { labels, expenses, incomes } = useMemo(() => {
    const byDay = new Map<string, { exp: number; inc: number }>();
    days.forEach(d => byDay.set(format(d, "yyyy-MM-dd"), { exp: 0, inc: 0 }));
    txns.forEach(t => {
      const key = format(parseISO(t.date), "yyyy-MM-dd");
      if (!byDay.has(key)) return; // ignore items outside selected month
      const bucket = byDay.get(key)!;
      if (t.type === "expense") bucket.exp += t.amount; else bucket.inc += t.amount;
    });
    return {
      labels: days.map(d => format(d, "d")),
      expenses: days.map(d => byDay.get(format(d, "yyyy-MM-dd"))!.exp),
      incomes: days.map(d => byDay.get(format(d, "yyyy-MM-dd"))!.inc),
    };
  }, [txns, month]);

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Monthly Spending</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <div style={{ height: 300 }}>
        <Bar
          data={{
            labels,
            datasets: [
              { label: "Expenses", data: expenses },
              { label: "Income", data: incomes },
            ],
          }}
          options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
        />
      </div>
    </section>
  );
}
