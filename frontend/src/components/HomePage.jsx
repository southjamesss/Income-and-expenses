import React, { useEffect, useState } from "react";

const HomePage = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recommendation, setRecommendation] = useState({});
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:4000/users");
        const data = await res.json();
        const currentUser = data.find((u) => u.email === user.email);
        if (currentUser) {
          const expenses = currentUser.expenses || [];
          setExpenses(expenses);
          const total = expenses.reduce((sum, e) => sum + e.amount, 0);
          setTotalExpense(total);

          const salary = currentUser.salary || 0;
          setRecommendation({
            save: salary * 0.3,
            spend: salary * 0.7,
          });
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err);
      }
    };

    if (user) fetchUserData();
  }, [user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newExpense,
          userId: user.id,
          amount: parseFloat(newExpense.amount),
          date: new Date(),
        }),
      });

      if (!res.ok) throw new Error("ไม่สามารถบันทึกค่าใช้จ่ายได้");

      const created = await res.json();
      setExpenses((prev) => [created, ...prev]);
      setTotalExpense((prev) => prev + created.amount);
      setNewExpense({ category: "", amount: "", note: "" });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดขณะบันทึก");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ไม่สามารถลบรายการได้");
      const deleted = expenses.find((e) => e.id === id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setTotalExpense((prev) => prev - (deleted?.amount || 0));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดขณะลบ");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white bg-opacity-10 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-yellow-300 tracking-tight">🧾 ข้อมูลผู้ใช้</h1>

        <div className="text-left space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-yellow-200">👤 {user.name}</h2>
            <p>💰 เงินเดือน: {user.salary} บาท</p>
            <p>💸 ใช้ไปแล้ว: {totalExpense} บาท</p>

            <div className="mt-4 text-sm text-gray-300">
              <p>📊 <strong>คำแนะนำการจัดการเงิน</strong></p>
              <ul className="ml-4 list-disc">
                <li>ควรเก็บออมอย่างน้อย: <span className="text-green-300">{recommendation.save?.toFixed(0)} บาท</span></li>
                <li>ควรใช้ไม่เกิน: <span className="text-red-300">{recommendation.spend?.toFixed(0)} บาท</span></li>
              </ul>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400">📋 ค่าใช้จ่ายล่าสุด:</p>
              {expenses.length > 0 ? (
                <ul className="ml-4 list-disc">
                  {expenses.slice(0, 3).map((expense) => (
                    <li key={expense.id} className="flex justify-between items-center">
                      <span>{expense.category} - {expense.amount} บาท {expense.note && `( ${expense.note} )`}</span>
                      <button onClick={() => handleDeleteExpense(expense.id)} className="ml-2 text-red-400 hover:text-red-300">🗑</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูลค่าใช้จ่าย</p>
              )}
            </div>
          </div>
        </div>

        {/* 💸 ฟอร์มเพิ่มรายการค่าใช้จ่าย */}
        <form onSubmit={handleAddExpense} className="text-left space-y-4">
          <h3 className="text-lg font-bold text-yellow-300">➕ เพิ่มรายการค่าใช้จ่าย</h3>
          <input
            type="text"
            placeholder="หมวดหมู่ (เช่น อาหาร)"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="จำนวนเงิน"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <input
            type="text"
            placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            value={newExpense.note}
            onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
          >
            เพิ่มรายการ
          </button>
        </form>

        <button
          onClick={onLogout}
          className="mt-6 text-sm text-red-400 underline"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default HomePage;
