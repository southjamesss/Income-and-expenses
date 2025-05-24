// ✅ เพิ่มฟีเจอร์ทั้งหมด: filter ตามช่วงเวลา, bar chart, สีหมวดหมู่, เตือน 70%, แสดงรหัส, responsive, แก้ไขได้

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";

const COLORS = {
  รถ: "#0088FE",
  อาหาร: "#00C49F",
  บันเทิง: "#FF8042",
  ช้อปปิ้ง: "#FFBB28",
  ค่าใช้จ่ายอื่นๆ: "#A020F0",
};

const HomePage = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recommendation, setRecommendation] = useState({});
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch("http://localhost:4000/users");
      const data = await res.json();
      const currentUser = data.find((u) => u.email === user.email);
      if (currentUser) {
        const expenses = currentUser.expenses || [];
        setExpenses(expenses);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        setTotalExpense(total);
        setRecommendation({ save: currentUser.salary * 0.3, spend: currentUser.salary * 0.7 });
      }
    };
    fetchUserData();
  }, [user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    const payload = {
      ...newExpense,
      userId: user.id,
      amount: parseFloat(newExpense.amount),
      date: new Date(),
    };

    if (editingId) {
      const res = await fetch(`http://localhost:4000/expenses/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setExpenses((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
      setEditingId(null);
    } else {
      const res = await fetch("http://localhost:4000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setExpenses((prev) => [created, ...prev]);
    }

    setTotalExpense((prev) => prev + parseFloat(newExpense.amount));
    setNewExpense({ category: "", amount: "", note: "" });
  };

  const handleDeleteExpense = async (id) => {
    const deleted = expenses.find((e) => e.id === id);
    await fetch(`http://localhost:4000/expenses/${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setTotalExpense((prev) => prev - deleted.amount);
  };

  const filteredExpenses = expenses
    .filter((e) => {
      const now = dayjs();
      const date = dayjs(e.date);
      if (timeFilter === "week") return now.diff(date, "day") <= 7;
      if (timeFilter === "month") return now.diff(date, "month") === 0;
      return true;
    })
    .filter((e) =>
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(search.toLowerCase()))
    );

  const pieChartData = Object.values(
    filteredExpenses.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
      acc[curr.category].value += curr.amount;
      return acc;
    }, {})
  );

  const barChartData = filteredExpenses.reduce((acc, e) => {
    const m = dayjs(e.date).format("MMM");
    const found = acc.find((i) => i.name === m);
    if (found) found.total += e.amount;
    else acc.push({ name: m, total: e.amount });
    return acc;
  }, []);

  const progressPercent = (totalExpense / user.salary) * 100;

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-yellow-300">📊 ข้อมูลผู้ใช้</h1>
        <p>👤 {user.name} | 💰 เงินเดือน: {user.salary} บาท</p>
        <p>💸 ใช้ไปแล้ว: {totalExpense} บาท</p>

        <div className="w-full bg-gray-600 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${progressPercent > 70 ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>

        <div className="text-sm text-gray-400">
          คำแนะนำ: เก็บออม {recommendation.save?.toFixed(0)} บาท, ใช้ไม่เกิน {recommendation.spend?.toFixed(0)} บาท
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            className="bg-gray-700 px-3 py-1 rounded"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
          </select>

          <input
            className="px-3 py-1 rounded bg-gray-700 text-white"
            placeholder="ค้นหา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ul className="divide-y divide-gray-600">
          {filteredExpenses.map((e) => (
            <li key={e.id} className="py-2 flex justify-between items-center">
              <div>
                <span
                  className="px-2 py-1 rounded text-sm"
                  style={{ backgroundColor: COLORS[e.category] || "#999" }}
                >
                  {e.category}
                </span>{" "}
                {e.amount} บาท ({dayjs(e.date).format("DD MMM YY")}) {e.note && `- ${e.note}`}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setNewExpense(e) || setEditingId(e.id)}>✏️</button>
                <button onClick={() => handleDeleteExpense(e.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddExpense} className="space-y-2">
          <h2 className="text-yellow-300 font-bold">➕ {editingId ? "แก้ไข" : "เพิ่ม"} รายการ</h2>
          <input
            className="w-full px-3 py-2 rounded bg-gray-700"
            placeholder="หมวดหมู่"
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          />
          <input
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-700"
            placeholder="จำนวนเงิน"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <input
            className="w-full px-3 py-2 rounded bg-gray-700"
            placeholder="บันทึกเพิ่มเติม"
            value={newExpense.note}
            onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
          />
          <button type="submit" className="w-full py-2 bg-yellow-400 text-black font-bold rounded">
            {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
          </button>
        </form>

        {pieChartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        {barChartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        )}

        <button onClick={onLogout} className="text-sm text-red-400 underline mt-6">ออกจากระบบ</button>
      </div>
    </div>
  );
};

export default HomePage;
