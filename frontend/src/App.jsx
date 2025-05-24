import React, { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import "./index.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // ✅ โหลดผู้ใช้จาก localStorage ตอนแอปเริ่ม
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("home");
    }
  }, []);

  // ✅ ฟังก์ชัน Login
  const handleLogin = async (email, password) => {
  try {
    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setPage("home");
    } else {
      alert(data.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", err);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }
};

  // ✅ ฟังก์ชัน Register
  const handleRegister = async (formData) => {
    try {
      const res = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setPage("home");
    } catch (err) {
      console.error("สมัครไม่สำเร็จ:", err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  return (
    <>
      {page === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage("register")}
        />
      )}

      {page === "register" && (
        <RegisterPage onRegister={handleRegister} />
      )}

      {page === "home" && (
        <HomePage user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;