import React from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

export default function Insights() {
  const { transactions, monthlyBreakdown, byCategory, currMonthKey, prevMonthKey, savingsRate, totalIncome, totalExpenses } = useApp();

  const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = catEntries[0];
  const hasData = transactions.length > 0;
  const hasExpenses = Object.keys(byCategory).length > 0;

  // Fully dynamic observations
  const observations = [];
  if (currMonthKey && prevMonthKey) {
    const expDelta = currMonthKey.expenses - prevMonthKey.expenses;
    const expPct = Math.round(Math.abs(expDelta / prevMonthKey.expenses) * 100);
    if (expDelta < 0)
      observations.push({ icon: "✅", text: `Expenses dropped by ${expPct}% this month — ₹${Math.abs(expDelta).toLocaleString("en-IN")} less than ${prevMonthKey.month}.` });
    else if (expDelta > 0)
      observations.push({ icon: "⚠️", text: `Expenses rose ${expPct}% vs ${prevMonthKey.month} — ₹${expDelta.toLocaleString("en-IN")} more than last month.` });
    else
      observations.push({ icon: "ℹ️", text: `Spending held flat compared to ${prevMonthKey.month} — very consistent.` });
  }

  if (savingsRate >= 40) observations.push({ icon: "🏆", text: `${savingsRate}% savings rate — exceptional! You're keeping most of what you earn.` });
  else if (savingsRate >= 30) observations.push({ icon: "💪", text: `${savingsRate}% savings rate is excellent. Keep aiming upward!` });
  else if (savingsRate >= 20) observations.push({ icon: "👍", text: `${savingsRate}% savings rate is solid. Aim for 30%+ to build wealth faster.` });
  else if (savingsRate >= 10) observations.push({ icon: "📌", text: `${savingsRate}% savings rate — below the 20% benchmark. Review your top 2 expense categories.` });
  else if (savingsRate >= 0)  observations.push({ icon: "🚨", text: `Only ${savingsRate}% saved this period. Immediate budget review is recommended.` });
  else observations.push({ icon: "🔴", text: `Spending exceeds income by ₹${Math.abs(totalIncome - totalExpenses).toLocaleString("en-IN")}. Act now to prevent debt accumulation.` });

  if (topCategory) {
    const pct = Math.round((topCategory[1] / totalExpenses) * 100);
    if (pct > 40) observations.push({ icon: "🎯", text: `${CATEGORIES[topCategory[0]]?.icon} ${topCategory[0]} takes up ${pct}% of expenses (₹${topCategory[1].toLocaleString("en-IN")}). Setting a monthly cap could save you significantly.` });
    else observations.push({ icon: "📊", text: `Spending spread is healthy — top category ${CATEGORIES[topCategory[0]]?.icon} ${topCategory[0]} is ${pct}% of expenses.` });
  }

  if (currMonthKey && prevMonthKey) {
    const incDelta = currMonthKey.income - prevMonthKey.income;
    const incPct = Math.round(Math.abs(incDelta / prevMonthKey.income) * 100);
    if (incDelta > 0) observations.push({ icon: "📈", text: `Income grew ${incPct}% this month vs ${prevMonthKey.month}. Great momentum!` });
    else if (incDelta < 0) observations.push({ icon: "📉", text: `Income dipped ${incPct}% vs ${prevMonthKey.month}. Keep expenses lean this month.` });
  }

  if (monthlyBreakdown.length > 1) {
    const best = [...monthlyBreakdown].sort((a, b) => b.net - a.net)[0];
    observations.push({ icon: "⭐", text: `Best month: ${best.fullLabel} with a surplus of ₹${best.net.toLocaleString("en-IN")}.` });
  }

  const avgMonthlyExpense = monthlyBreakdown.length > 0
    ? Math.round(monthlyBreakdown.reduce((s, m) => s + m.expenses, 0) / monthlyBreakdown.length) : 0;

  if (!hasData) {
    return (
      <div className="empty-state" style={{ minHeight: "400px" }}>
        <div className="empty-icon">◎</div>
        <div className="empty-title">No data to analyse</div>
        <div className="empty-sub">Add transactions first. Insights are automatically generated from your real financial activity.</div>
      </div>
    );
  }

  return (
    <div className="insights-grid">
      {/* Top spending */}
      <div className="insight-card">
        <div className="ic-title">🏆 Top Spending Category</div>
        {hasExpenses ? (
          <>
            <div className="insight-big">{CATEGORIES[topCategory[0]]?.icon} {topCategory[0]}</div>
            <div className="insight-sub">
              ₹{topCategory[1].toLocaleString("en-IN")} total — {Math.round((topCategory[1] / totalExpenses) * 100)}% of all expenses
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: "1.5rem 0" }}>
            <div className="empty-icon" style={{ width: "40px", height: "40px", fontSize: "16px" }}>💸</div>
            <div className="empty-sub">No expense data recorded yet.</div>
          </div>
        )}
      </div>

      {/* Savings rate */}
      <div className="insight-card">
        <div className="ic-title">💰 Savings Rate</div>
        <div className="insight-big" style={{
          color: savingsRate >= 30 ? "var(--green)" : savingsRate >= 15 ? "var(--amber)" : "var(--red)"
        }}>
          {savingsRate}%
        </div>
        <div className="insight-sub">
          {savingsRate >= 40 ? "🏆 Exceptional — top-tier saver!"
            : savingsRate >= 30 ? "✅ Excellent! You're saving very well."
            : savingsRate >= 20 ? "👍 Good. Aim for 30%+ for faster growth."
            : savingsRate >= 10 ? "⚠️ Below average. Cut recurring costs."
            : savingsRate >= 0  ? "🚨 Very low. Budget review needed."
            : "🔴 Negative — spending exceeds income."}
        </div>
        {totalIncome > 0 && (
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "var(--bg-3)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-3)" }}>
            Saved ₹{(totalIncome - totalExpenses).toLocaleString("en-IN")} of ₹{totalIncome.toLocaleString("en-IN")} earned
          </div>
        )}
      </div>

      {/* Category breakdown */}
      <div className="insight-card">
        <div className="ic-title">📊 Spending by Category</div>
        {hasExpenses ? (
          <div className="progress-row">
            {catEntries.slice(0, 6).map(([cat, val]) => (
              <div className="prog-item" key={cat}>
                <div className="prog-header">
                  <span className="prog-name">{CATEGORIES[cat]?.icon} {cat}</span>
                  <span className="prog-val">₹{val.toLocaleString("en-IN")}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${(val / catEntries[0][1]) * 100}%`, background: CATEGORIES[cat]?.color || "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "1.5rem 0" }}>
            <div className="empty-icon" style={{ width: "40px", height: "40px", fontSize: "16px" }}>📊</div>
            <div className="empty-sub">Add expense transactions to see your category breakdown.</div>
          </div>
        )}
      </div>

      {/* Monthly comparison */}
      <div className="insight-card">
        <div className="ic-title">📅 Monthly Comparison</div>
        {monthlyBreakdown.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem 0" }}>
            <div className="empty-icon" style={{ width: "40px", height: "40px", fontSize: "16px" }}>📅</div>
            <div className="empty-sub">Transactions from multiple months will appear here.</div>
          </div>
        ) : (
          <div className="month-compare">
            {[...monthlyBreakdown].slice(-6).map(m => (
              <div className="mc-row" key={m.key}>
                <span className="mc-month">{m.fullLabel}</span>
                <div className="mc-vals">
                  <span className="mc-val inc">+₹{(m.income / 1000).toFixed(1)}k</span>
                  <span className="mc-val exp">-₹{(m.expenses / 1000).toFixed(1)}k</span>
                  <span className="mc-val" style={{ color: m.net >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
                    {m.net >= 0 ? "+" : ""}₹{(m.net / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Observations — fully dynamic */}
      <div className="insight-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ic-title">💡 Key Observations</div>
        {observations.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem 0" }}>
            <div className="empty-icon" style={{ width: "40px", height: "40px", fontSize: "16px" }}>💡</div>
            <div className="empty-sub">Add more transactions across multiple months to unlock personalised insights.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {observations.map((obs, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "var(--bg-3)", borderRadius: "var(--radius-sm)", alignItems: "flex-start" }}>
                <span style={{ fontSize: "15px", flexShrink: 0, marginTop: "1px" }}>{obs.icon}</span>
                <span style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6" }}>{obs.text}</span>
              </div>
            ))}
          </div>
        )}
        {avgMonthlyExpense > 0 && (
          <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-3)", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
            Average monthly spend across {monthlyBreakdown.length} month{monthlyBreakdown.length !== 1 ? "s" : ""}: ₹{avgMonthlyExpense.toLocaleString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}
