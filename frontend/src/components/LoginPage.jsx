import React, { useState } from "react";

const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // ส่งอีเมลและรหัสผ่านไปยัง App
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-md max-w-sm w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-yellow-300">เข้าสู่ระบบ</h2>

        <input
          type="email"
          placeholder="อีเมล"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
        >
          เข้าสู่ระบบ
        </button>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full mt-2 text-sm text-yellow-300 underline"
        >
          ยังไม่มีบัญชี? สมัครสมาชิก
        </button>
      </form>
    </div>
  );
};

export default LoginPage;