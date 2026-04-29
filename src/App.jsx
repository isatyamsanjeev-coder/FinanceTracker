import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import Budgets from "./components/Budgets";
import AddTransactionModal from "./components/AddTransactionModal";
import "./App.css";

const NAV = [
  { id: "dashboard", label: "Overview",      icon: "◈" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "budgets",  label: "Budgets",        icon: "◻" },
  { id: "insights", label: "Insights",       icon: "◎" },
];

/* ── Sidebar content shared between full and collapsed ── */
function SidebarContent({ page, setPage, role, setRole, darkMode, setDarkMode,
  totalBalance, totalIncome, totalExpenses, savingsRate, resetData, collapsed }) {
  return (
    <>
      <div className={`sidebar-logo ${collapsed ? "logo-collapsed" : ""}`}>
        <span className="logo-mark">₹</span>
        {!collapsed && <span className="logo-text">Findex</span>}
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-balance">
            <div className="sb-label">Net Balance</div>
            <div className="sb-amount">₹{Math.abs(totalBalance).toLocaleString("en-IN")}</div>
            <div className={`sb-badge ${totalBalance >= 0 ? "pos" : "neg"}`}>
              {totalBalance >= 0 ? "▲ Surplus" : "▼ Deficit"}
            </div>
          </div>

          <div className="sidebar-mini-stats">
            <div className="sms-item">
              <span className="sms-label">Savings</span>
              <span className="sms-val" style={{ color: savingsRate >= 30 ? "var(--green)" : savingsRate >= 15 ? "var(--amber)" : "var(--red)" }}>
                {savingsRate}%
              </span>
            </div>
            <div className="sms-item">
              <span className="sms-label">Income</span>
              <span className="sms-val" style={{ color: "var(--green)" }}>₹{(totalIncome/1000).toFixed(0)}k</span>
            </div>
            <div className="sms-item">
              <span className="sms-label">Spent</span>
              <span className="sms-val" style={{ color: "var(--red)" }}>₹{(totalExpenses/1000).toFixed(0)}k</span>
            </div>
          </div>
        </>
      )}

      <nav className="sidebar-nav">
        {NAV.map(n => (
          <button key={n.id}
            className={`nav-item ${page === n.id ? "active" : ""} ${collapsed ? "nav-item-collapsed" : ""}`}
            onClick={() => setPage(n.id)}
            title={collapsed ? n.label : ""}
          >
            <span className="nav-icon">{n.icon}</span>
            {!collapsed && <span>{n.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`sidebar-footer ${collapsed ? "footer-collapsed" : ""}`}>
        {!collapsed && (
          <div className="role-switcher">
            <div className="sf-label">Role</div>
            <div className="role-toggle">
              <button className={`rt-btn ${role === "viewer" ? "active" : ""}`} onClick={() => setRole("viewer")}>Viewer</button>
              <button className={`rt-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>Admin</button>
            </div>
          </div>
        )}

        {collapsed ? (
          /* Icon-only footer for collapsed sidebar */
          <div className="collapsed-footer-btns">
            <button className="icon-btn" onClick={() => setRole(role === "admin" ? "viewer" : "admin")}
              title={`Switch to ${role === "admin" ? "Viewer" : "Admin"}`}
              style={{ color: role === "admin" ? "var(--accent)" : "var(--text-3)" }}>
              {role === "admin" ? "⚙" : "◉"}
            </button>
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? "☀" : "◐"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="theme-toggle" style={{ flex: 1 }} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀ Light" : "◐ Dark"}
            </button>
            {role === "admin" && (
              <button className="theme-toggle" style={{ padding: "8px 10px", fontSize: "11px" }} onClick={resetData} title="Reset sample data">↺</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Shell() {
  const ctx = useApp();
  const { role, setRole, darkMode, setDarkMode, totalBalance, totalIncome, totalExpenses,
    savingsRate, exportCSV, resetData } = ctx;
  const [page, setPage]       = useState("dashboard");
  const [showAdd, setShowAdd] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPage = NAV.find(n => n.id === page);

  const sharedProps = { page, setPage, role, setRole, darkMode, setDarkMode,
    totalBalance, totalIncome, totalExpenses, savingsRate, resetData };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>

      {/* ── Full sidebar (≥1100px) ── */}
      <aside className="sidebar sidebar-full">
        <SidebarContent {...sharedProps} collapsed={false} />
      </aside>

      {/* ── Collapsed icon sidebar (900–1099px) ── */}
      <aside className="sidebar sidebar-collapsed">
        <SidebarContent {...sharedProps} collapsed={true} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="drawer" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"0.5rem" }}>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} style={{ fontSize:"18px" }}>✕</button>
            </div>
            <SidebarContent {...sharedProps} collapsed={false} />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <main className="main-content">
        <header className="topbar">
          {/* Hamburger — mobile only */}
          <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>

          <div className="topbar-left">
            <h1 className="page-title">{currentPage?.label}</h1>
            <p className="page-sub">
              {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>

          <div className="topbar-right">
            {/* Always-visible role badge */}
            <div className={`role-badge ${role}`}>{role === "admin" ? "⚙ Admin" : "◉ Viewer"}</div>

            {/* Mobile role switcher — shown < 900px */}
            <div className="mob-role-toggle">
              <button className={`rt-btn ${role==="viewer"?"active":""}`} onClick={() => setRole("viewer")}>V</button>
              <button className={`rt-btn ${role==="admin" ?"active":""}`} onClick={() => setRole("admin")}>A</button>
            </div>

            <button className="export-btn" onClick={exportCSV}>↓ CSV</button>

            {/* Theme toggle — always visible on mobile */}
            <button className="theme-btn-topbar" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀" : "◐"}
            </button>

            {role === "admin" && (
              <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add</button>
            )}
          </div>
        </header>

        <div className="page-body">
          {page === "dashboard"    && <Dashboard onNavigate={setPage} />}
          {page === "transactions" && <Transactions />}
          {page === "budgets"      && <Budgets />}
          {page === "insights"     && <Insights />}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav">
        {NAV.map(n => (
          <button key={n.id} className={`mob-nav-btn ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
            <span className="mnb-icon">{n.icon}</span>
            <span className="mnb-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

export default function App() {
  return <AppProvider><Shell /></AppProvider>;
}
