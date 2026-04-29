import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

const EXPENSE_CATS = ["Food","Transport","Shopping","Health","Entertainment","Utilities","Rent"];

export default function Budgets() {
  const { budgets, setBudgets, currMonthCatSpend, role, currMonthKey } = useApp();
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const overBudgetCount = EXPENSE_CATS.filter(c => budgets[c] && (currMonthCatSpend[c] || 0) > budgets[c]).length;
  const totalBudgeted = EXPENSE_CATS.reduce((s, c) => s + (budgets[c] || 0), 0);
  const totalSpent = EXPENSE_CATS.reduce((s, c) => s + (currMonthCatSpend[c] || 0), 0);

  const startEdit = (cat) => { setEditing(cat); setEditVal(budgets[cat] || ""); };
  const saveEdit = (cat) => {
    const val = parseInt(editVal);
    if (!isNaN(val) && val > 0) setBudgets(prev => ({ ...prev, [cat]: val }));
    setEditing(null);
  };

  const noBudgetsSet = EXPENSE_CATS.every(c => !budgets[c]);
  const noSpendingData = EXPENSE_CATS.every(c => !currMonthCatSpend[c]);

  return (
    <div>
      {/* Header summary */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div className="stat-card" style={{ flex: "1", minWidth: "140px" }}>
          <div className="sc-label">Total Budgeted</div>
          <div className="sc-amount balance" style={{ fontSize: "20px" }}>₹{totalBudgeted.toLocaleString("en-IN")}</div>
          <div className="sc-trend">{currMonthKey?.fullLabel || "This month"}</div>
        </div>
        <div className="stat-card" style={{ flex: "1", minWidth: "140px" }}>
          <div className="sc-label">Total Spent</div>
          <div className="sc-amount" style={{ fontSize: "20px", color: totalSpent > totalBudgeted ? "var(--red)" : "var(--text)" }}>
            ₹{totalSpent.toLocaleString("en-IN")}
          </div>
          <div className="sc-trend" style={{ color: totalSpent > totalBudgeted ? "var(--red)" : "var(--text-3)" }}>
            {totalBudgeted > 0 ? `${Math.round((totalSpent/totalBudgeted)*100)}% of budget used` : "Set budgets below"}
          </div>
        </div>
        <div className="stat-card" style={{ flex: "1", minWidth: "140px" }}>
          <div className="sc-label">Remaining</div>
          <div className="sc-amount" style={{ fontSize: "20px", color: totalBudgeted - totalSpent >= 0 ? "var(--green)" : "var(--red)" }}>
            ₹{Math.abs(totalBudgeted - totalSpent).toLocaleString("en-IN")}
          </div>
          <div className="sc-trend" style={{ color: overBudgetCount > 0 ? "var(--red)" : "var(--text-3)" }}>
            {overBudgetCount > 0 ? `${overBudgetCount} categor${overBudgetCount > 1 ? "ies" : "y"} over budget` : "All within budget"}
          </div>
        </div>
      </div>

      {/* Role hint */}
      {role === "viewer" && (
        <div style={{ padding: "10px 14px", background: "var(--bg-3)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-3)", marginBottom: "1rem", border: "1px solid var(--border)" }}>
          ℹ Viewing budget summary. Switch to <strong style={{ color: "var(--accent)" }}>Admin</strong> role to edit budget limits.
        </div>
      )}
      {role === "admin" && noBudgetsSet && (
        <div style={{ padding: "10px 14px", background: "rgba(123,97,255,0.08)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--accent)", marginBottom: "1rem", border: "1px solid rgba(123,97,255,0.2)" }}>
          ✎ Click any budget amount to set a monthly limit for that category.
        </div>
      )}

      {/* Empty state: no spending data */}
      {noSpendingData && !noBudgetsSet && (
        <div className="empty-state" style={{ marginBottom: "1.25rem", padding: "1.5rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <div className="empty-icon">📋</div>
          <div className="empty-title">No spending this month</div>
          <div className="empty-sub">Add expense transactions for {currMonthKey?.fullLabel || "this month"} to track against your budgets.</div>
        </div>
      )}

      <div className="budgets-grid">
        {EXPENSE_CATS.map(cat => {
          const budget = budgets[cat] || 0;
          const spent = currMonthCatSpend[cat] || 0;
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const over = spent > budget && budget > 0;
          const barColor = pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--amber)" : "var(--green)";
          const remaining = budget - spent;
          const noBudget = budget === 0;
          const noSpend = spent === 0;

          return (
            <div className="budget-card" key={cat} style={{ opacity: noBudget && noSpend ? 0.6 : 1 }}>
              <div className="bc-header">
                <div className="bc-cat">
                  <span style={{ fontSize: "20px" }}>{CATEGORIES[cat]?.icon}</span>
                  <span className="bc-name">{cat}</span>
                </div>
                {editing === cat && role === "admin" ? (
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-3)" }}>₹</span>
                    <input className="budget-input" type="number" value={editVal} autoFocus
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={() => saveEdit(cat)}
                      onKeyDown={e => e.key === "Enter" && saveEdit(cat)} />
                  </div>
                ) : (
                  <div
                    className={`bc-budget-val ${role === "admin" ? "editable" : ""}`}
                    onClick={() => role === "admin" && startEdit(cat)}
                    title={role === "admin" ? "Click to set budget" : ""}
                  >
                    {noBudget
                      ? <span style={{ color: "var(--text-3)", fontSize: "12px" }}>{role === "admin" ? "+ Set limit" : "No limit"}</span>
                      : `₹${budget.toLocaleString("en-IN")}`}
                    {role === "admin" && !noBudget && <span style={{ fontSize: "10px", color: "var(--text-3)", marginLeft: "4px" }}>✎</span>}
                  </div>
                )}
              </div>

              {noBudget ? (
                <div style={{ height: "8px", background: "var(--bg-4)", borderRadius: "4px", marginBottom: "10px", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.5px" }}>NO BUDGET SET</span>
                  </div>
                </div>
              ) : (
                <div className="bc-bar-wrap">
                  <div className="bc-bar">
                    <div className="bc-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <span className="bc-pct" style={{ color: barColor }}>{Math.round(pct)}%</span>
                </div>
              )}

              <div className="bc-footer">
                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  Spent: <strong style={{ color: noSpend ? "var(--text-3)" : "var(--text-2)" }}>
                    {noSpend ? "—" : `₹${spent.toLocaleString("en-IN")}`}
                  </strong>
                </span>
                {!noBudget && (
                  <span style={{ fontSize: "12px", color: over ? "var(--red)" : "var(--text-3)" }}>
                    {over ? `Over ₹${(spent - budget).toLocaleString("en-IN")}` : `₹${remaining.toLocaleString("en-IN")} left`}
                  </span>
                )}
              </div>

              {over && <div className="bc-alert">⚠ Over budget this month</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
