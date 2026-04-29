# 💸 FinTrack – Finance Dashboard

A modern finance dashboard built using React (Vite) to help users track income, expenses, and spending patterns through an intuitive and responsive interface.

---

## 📌 Overview

This project simulates a fintech dashboard where users can:

- View financial summaries (balance, income, expenses)
- Explore transactions
- Analyze spending patterns through charts
- Gain insights from their financial data

The focus of this project is on frontend design, state management, and user experience.

---

## 🚀 Features

### 📊 Dashboard Overview
- Displays total balance, income, and expenses
- Provides quick financial snapshot
- Clean card-based UI

### 💳 Transactions Section
- Lists all transactions with:
  - Date
  - Amount
  - Category
  - Type (Income / Expense)
- Structured in a readable table format

### 📈 Data Visualization
- Line chart for financial trends
- Pie chart for category-wise spending breakdown

### 💡 Insights Section
- Highlights useful observations such as:
  - Spending ratio
  - Expense trends

### 🎭 Role-Based UI (Simulated)
- Viewer → read-only
- Admin → can modify (extendable)

### ⚙️ State Management
- Managed using React state/hooks
- Handles transactions, filters, and UI updates

---

## 🛠 Tech Stack

- React (Vite)
- JavaScript / TypeScript
- CSS
- Recharts

---

## 📂 Project Structure

FIN-TECH/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── README.md

---
## ▶️ Setup Instructions (Detailed Explanation)

Follow these steps to run the project on your local machine:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aritrraa/FIN-TECH.git
```

* This command downloads (copies) the entire project from GitHub to your computer.
* You’ll get a folder named **FIN-TECH** containing all project files.

---

### 2️⃣ Navigate to the Project Folder

```bash
cd FIN-TECH
```

* `cd` means *change directory*.
* This moves you into the project folder where all source code and configuration files exist.

---

### 3️⃣ Install Dependencies

```bash
npm install
```

* This installs all required packages (libraries) listed in `package.json`.
* These include React, Vite, chart libraries, and other dependencies needed for the app to run.
* A folder called `node_modules` will be created automatically.

---

### 4️⃣ Start the Development Server

```bash
npm run dev
```

* This starts the Vite development server.
* It compiles your code and runs the app locally.
* Any changes you make will automatically reflect in the browser (hot reload).

---

### 5️⃣ Open in Browser

```
http://localhost:5173
```

* This is the local URL where your app runs.
* Open it in any browser (Chrome recommended).
* You will see your finance dashboard UI.

---

### ⚠️ Notes

* Make sure **Node.js** is installed on your system.
* If port `5173` is busy, Vite may run on another port (check terminal output).
* Always run commands inside the project folder.


---

## 🌐 Deployment

Build Command: npm run build  
Output Directory: dist
https://fin-tech-qxq1.vercel.app/

---

## 📌 Design Approach

- Clean and intuitive UI
- Component-based architecture
- Scalable and maintainable code
- Responsive layout

---

## ⚠️ Assumptions

- Uses mock data
- No backend integration
- Role-based UI is simulated

---
## ⭐ Acknowledgment

Built as part of a frontend evaluation project to demonstrate UI, state management, and data visualization skills.


## 📸 Screenshots

### 🏠 Dashboard
![Dashboard](Screenshots/Dashboard.png)

### 💳 Transactions
![Transactions](Screenshots/Transactions.png)

### 📊 Analytics
![Analytics](Screenshots/Insights.png)
![Analytics](Screenshots/Budget.png)



---

## 🔮 Future Improvements

- Add/Edit/Delete transactions
- Data persistence (API/localStorage)
- Authentication
- Advanced filtering
- Mobile optimization

---

## 👨‍💻 Author

Aritra Das  
https://github.com/Aritrraa

---



## ⭐ If you like this project

Give it a ⭐ on GitHub — it helps a lot!
