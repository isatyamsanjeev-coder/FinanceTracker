import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";
import AddTransactionModal from "./AddTransactionModal";

const CATS = ["all", ...Object.keys(CATEGORIES)];

export default function Transactions() {
  const { filteredTransactions, filters, setFilters, sortBy, setSortBy, role, deleteTransaction, transactions } = useApp();
  const [editingTxn, setEditingTxn] = useState(null);

  const hasActiveFilter = filters.search || filters.type !== "all" || filters.category !== "all" || filters.dateFrom || filters.dateTo;
  const clearFilters = () => setFilters({ search: "", type: "all", category: "all", dateFrom: "", dateTo: "" });

  const filteredIncome = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <>
      {/* Search + Filters */}
      <div className="txn-controls">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select className="filter-select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          {CATS.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : `${CATEGORIES[c]?.icon} ${c}`}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Date range + clear */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <label style={{ fontSize: "11px", color: "var(--text-3)", whiteSpace: "nowrap" }}>From</label>
          <input type="date" className="filter-select" value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <label style={{ fontSize: "11px", color: "var(--text-3)", whiteSpace: "nowrap" }}>To</label>
          <input type="date" className="filter-select" value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
        {hasActiveFilter && (
          <button className="del-btn" onClick={clearFilters} style={{ fontSize: "11px" }}>✕ Clear</button>
        )}
      </div>

      {/* Empty states */}
      {transactions.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "300px" }}>
          <div className="empty-icon">💸</div>
          <div className="empty-title">No transactions yet</div>
          <div className="empty-sub">Switch to Admin role using the sidebar toggle, then click "+ Add" to record your first transaction.</div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "300px" }}>
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No results found</div>
          <div className="empty-sub">No transactions match your current filters. Try broadening your search.</div>
          <button className="empty-action" onClick={clearFilters}>Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="chart-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-scroll">
              <table className="txn-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    {role === "admin" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="txn-row">
                      <td><div className="txn-desc">{t.description}</div></td>
                      <td><span className="cat-chip">{CATEGORIES[t.category]?.icon} {t.category}</span></td>
                      <td>
                        <div className="txn-date">
                          {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: "10px", padding: "3px 9px", borderRadius: "20px",
                          background: t.type === "income" ? "rgba(59,219,139,0.12)" : "rgba(255,92,122,0.12)",
                          color: t.type === "income" ? "var(--green)" : "var(--red)",
                          whiteSpace: "nowrap",
                        }}>{t.type}</span>
                      </td>
                      <td>
                        <div className={`txn-amount ${t.amount > 0 ? "pos" : "neg"}`}>
                          {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                        </div>
                      </td>
                      {role === "admin" && (
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button className="del-btn" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
                              onClick={() => setEditingTxn(t)}>✎</button>
                            <button className="del-btn" onClick={() => deleteTransaction(t.id)}>✕</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary bar */}
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
              {filteredTransactions.length} of {transactions.length} transactions
              {hasActiveFilter && " (filtered)"}
            </span>
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ fontSize: "12px", color: "var(--green)" }}>
                In: ₹{filteredIncome.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "12px", color: "var(--red)" }}>
                Out: ₹{filteredExpense.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "12px", color: filteredIncome - filteredExpense >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
                Net: {filteredIncome - filteredExpense >= 0 ? "+" : ""}₹{(filteredIncome - filteredExpense).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </>
      )}

      {editingTxn && <AddTransactionModal existing={editingTxn} onClose={() => setEditingTxn(null)} />}
    </>
  );
}
