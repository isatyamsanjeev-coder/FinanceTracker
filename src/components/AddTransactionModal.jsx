import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

export default function AddTransactionModal({ onClose, existing }) {
  const { addTransaction, editTransaction } = useApp();
  const isEdit = !!existing;

  const [form, setForm] = useState({
    description: existing?.description || "",
    amount: existing ? Math.abs(existing.amount) : "",
    category: existing?.category || "Food",
    type: existing?.type || "expense",
    date: existing?.date || new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) { setError("Enter a valid amount."); return; }
    if (isEdit) {
      editTransaction(existing.id, { ...form, amount: parseFloat(form.amount) });
    } else {
      addTransaction({ ...form, amount: parseFloat(form.amount) });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? "Edit Transaction" : "Add Transaction"}</div>
        <div className="modal-form">
          <div className="form-row">
            <label className="form-label">Type</label>
            <div className="type-toggle">
              <button className={`type-btn income ${form.type === "income" ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, type: "income" }))}>↑ Income</button>
              <button className={`type-btn expense ${form.type === "expense" ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, type: "expense" }))}>↓ Expense</button>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="e.g. Swiggy Order"
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Amount (₹)</label>
            <input className="form-input" type="number" placeholder="0" min="1"
              value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          {error && <div style={{ fontSize: "12px", color: "var(--red)", padding: "4px 0" }}>⚠ {error}</div>}
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-submit" onClick={handleSubmit}>{isEdit ? "Save Changes" : "Add Transaction"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
