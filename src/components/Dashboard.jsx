import React from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

function EmptyChart({ message }) {
  return (
    <div className="empty-state" style={{ padding: "2rem 1rem" }}>
      <div className="empty-icon">📊</div>
      <div className="empty-title">No data yet</div>
      <div className="empty-sub">{message}</div>
    </div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart message="Add transactions to see your monthly overview." />;
  const max = Math.max(...data.map(m => Math.max(m.income, m.expenses)), 1);
  return (
    <div>
      <div className="chart-legend">
        <div className="leg"><div className="leg-dot" style={{ background: "var(--green)" }} />Income</div>
        <div className="leg"><div className="leg-dot" style={{ background: "var(--red)" }} />Expenses</div>
      </div>
      <div className="bar-chart">
        {data.slice(-6).map(m => (
          <div className="bar-group" key={m.key}>
            <div className="bar-pair">
              <div className="bar income" style={{ height: `${(m.income / max) * 130}px` }} title={`Income: ₹${m.income.toLocaleString("en-IN")}`} />
              <div className="bar expense" style={{ height: `${(m.expenses / max) * 130}px` }} title={`Expenses: ₹${m.expenses.toLocaleString("en-IN")}`} />
            </div>
            <div className="bar-label">{m.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart message="Add expense transactions to see your spending breakdown." />;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const slices = data.map(d => {
    const pct = d.value / total, dash = pct * circ;
    const s = { ...d, pct, dash, offset };
    offset += dash;
    return s;
  });
  return (
    <div className="donut-wrap">
      <svg className="donut-svg" width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-4)" strokeWidth="18" />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset + circ * 0.25} />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-3)" fontSize="9" fontFamily="DM Mono">Total</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="600" fontFamily="DM Mono">
          ₹{total >= 1000 ? (total / 1000).toFixed(0) + "k" : total}
        </text>
      </svg>
      <div className="cat-list">
        {slices.slice(0, 5).map((s, i) => (
          <div className="cat-row" key={i}>
            <div className="cat-dot" style={{ background: s.color }} />
            <div className="cat-name">{s.name}</div>
            <div className="cat-pct">{Math.round(s.pct * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { totalBalance, totalIncome, totalExpenses, savingsRate, monthlyBreakdown, byCategory, transactions, currMonthKey, prevMonthKey } = useApp();

  const expenseByCategory = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, color: CATEGORIES[name]?.color || "#888" }))
    .sort((a, b) => b.value - a.value);

  const recentTxns = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const incomeChange = currMonthKey && prevMonthKey && prevMonthKey.income > 0
    ? Math.round(((currMonthKey.income - prevMonthKey.income) / prevMonthKey.income) * 100) : null;
  const expenseChange = currMonthKey && prevMonthKey && prevMonthKey.expenses > 0
    ? Math.round(((currMonthKey.expenses - prevMonthKey.expenses) / prevMonthKey.expenses) * 100) : null;

  return (
    <>
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="stat-card">
          <div className="sc-label">Net Balance</div>
          <div className={`sc-amount ${totalBalance >= 0 ? "income" : "expense"}`}>
            ₹{Math.abs(totalBalance).toLocaleString("en-IN")}
          </div>
          <div className="sc-trend">
            <span style={{ color: savingsRate >= 20 ? "var(--green)" : "var(--amber)" }}>◉ {savingsRate}% savings rate</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Total Income</div>
          <div className="sc-amount income">₹{totalIncome.toLocaleString("en-IN")}</div>
          <div className="sc-trend">
            {incomeChange !== null
              ? <span style={{ color: incomeChange >= 0 ? "var(--green)" : "var(--red)" }}>
                  {incomeChange >= 0 ? "↑" : "↓"} {Math.abs(incomeChange)}% vs {prevMonthKey?.month}
                </span>
              : <span style={{ color: "var(--text-3)" }}>All-time total</span>}
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Total Expenses</div>
          <div className="sc-amount expense">₹{totalExpenses.toLocaleString("en-IN")}</div>
          <div className="sc-trend">
            {expenseChange !== null
              ? <span style={{ color: expenseChange <= 0 ? "var(--green)" : "var(--red)" }}>
                  {expenseChange <= 0 ? "↓" : "↑"} {Math.abs(expenseChange)}% vs {prevMonthKey?.month}
                </span>
              : <span style={{ color: "var(--text-3)" }}>All-time total</span>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Monthly Overview</div>
          <BarChart data={monthlyBreakdown} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Spending Breakdown</div>
          <DonutChart data={expenseByCategory} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="chart-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Recent Transactions</div>
          <button onClick={() => onNavigate("transactions")} style={{
            fontSize: "12px", color: "var(--accent)", background: "none", border: "none",
            cursor: "pointer", fontFamily: "var(--font-mono)"
          }}>View all →</button>
        </div>
        {recentTxns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-sub">Switch to Admin role and add your first transaction to get started.</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map(t => (
                  <tr key={t.id} className="txn-row">
                    <td><div className="txn-desc">{t.description}</div></td>
                    <td><span className="cat-chip">{CATEGORIES[t.category]?.icon} {t.category}</span></td>
                    <td><div className="txn-date">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div></td>
                    <td>
                      <div className={`txn-amount ${t.amount > 0 ? "pos" : "neg"}`}>
                        {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
