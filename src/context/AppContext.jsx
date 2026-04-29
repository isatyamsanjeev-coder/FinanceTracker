import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { generateTransactions } from "../data/mockData";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const DEFAULT_BUDGETS = {
  Food: 8000,
  Transport: 3000,
  Shopping: 6000,
  Health: 4000,
  Entertainment: 2000,
  Utilities: 4000,
  Rent: 25000,
};

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("findex_transactions");
      return saved ? JSON.parse(saved) : generateTransactions();
    } catch { return generateTransactions(); }
  });

  const [role, setRole] = useState("viewer");
  const [filters, setFilters] = useState({ search: "", type: "all", category: "all", dateFrom: "", dateTo: "" });
  const [sortBy, setSortBy] = useState("date-desc");
  const [darkMode, setDarkMode] = useState(true);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [activePage, setActivePage] = useState("dashboard");

  const saveTransactions = (txns) => {
    setTransactions(txns);
    try { localStorage.setItem("findex_transactions", JSON.stringify(txns)); } catch {}
  };

  const addTransaction = useCallback((txn) => {
    const newTxn = {
      ...txn,
      id: Date.now(),
      amount: txn.type === "expense" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
    };
    setTransactions((prev) => {
      const next = [newTxn, ...prev];
      try { localStorage.setItem("findex_transactions", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try { localStorage.setItem("findex_transactions", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const editTransaction = useCallback((id, updated) => {
    setTransactions((prev) => {
      const next = prev.map((t) => t.id === id ? {
        ...t, ...updated,
        amount: updated.type === "expense" ? -Math.abs(updated.amount) : Math.abs(updated.amount)
      } : t);
      try { localStorage.setItem("findex_transactions", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchSearch = !filters.search ||
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase());
        const matchType = filters.type === "all" || t.type === filters.type;
        const matchCat = filters.category === "all" || t.category === filters.category;
        const matchFrom = !filters.dateFrom || t.date >= filters.dateFrom;
        const matchTo = !filters.dateTo || t.date <= filters.dateTo;
        return matchSearch && matchType && matchCat && matchFrom && matchTo;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
        if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
        if (sortBy === "amount-desc") return Math.abs(b.amount) - Math.abs(a.amount);
        if (sortBy === "amount-asc") return Math.abs(a.amount) - Math.abs(b.amount);
        return 0;
      });
  }, [transactions, filters, sortBy]);

  const stats = useMemo(() => {
    const totalBalance = transactions.reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const monthMap = {};
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
      if (t.amount > 0) monthMap[key].income += t.amount;
      else monthMap[key].expenses += Math.abs(t.amount);
    });
    const monthlyBreakdown = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        key,
        month: new Date(key + "-01").toLocaleDateString("en-IN", { month: "short" }),
        fullLabel: new Date(key + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        ...v,
        net: v.income - v.expenses,
      }));

    const byCategory = {};
    transactions.filter((t) => t.amount < 0).forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
    });

    const currMonthKey = monthlyBreakdown.length > 0 ? monthlyBreakdown[monthlyBreakdown.length - 1] : null;
    const prevMonthKey = monthlyBreakdown.length > 1 ? monthlyBreakdown[monthlyBreakdown.length - 2] : null;

    const currMonthCatSpend = {};
    if (currMonthKey) {
      transactions
        .filter((t) => t.amount < 0 && t.date.startsWith(currMonthKey.key))
        .forEach((t) => {
          currMonthCatSpend[t.category] = (currMonthCatSpend[t.category] || 0) + Math.abs(t.amount);
        });
    }

    return { totalBalance, totalIncome, totalExpenses, savingsRate, monthlyBreakdown, byCategory, currMonthKey, prevMonthKey, currMonthCatSpend };
  }, [transactions]);

  const exportCSV = useCallback(() => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const rows = transactions.map((t) => [t.date, `"${t.description}"`, t.category, t.type, Math.abs(t.amount)]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "findex_transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  const resetData = useCallback(() => {
    const fresh = generateTransactions();
    setTransactions(fresh);
    try { localStorage.setItem("findex_transactions", JSON.stringify(fresh)); } catch {}
  }, []);

  return (
    <AppContext.Provider value={{
      transactions, filteredTransactions,
      role, setRole,
      filters, setFilters,
      sortBy, setSortBy,
      darkMode, setDarkMode,
      budgets, setBudgets,
      activePage, setActivePage,
      addTransaction, deleteTransaction, editTransaction,
      exportCSV, resetData,
      ...stats,
    }}>
      {children}
    </AppContext.Provider>
  );
};
