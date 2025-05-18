import React, { useState } from "react";

const RegisterPage = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ ...formData, salary: parseFloat(formData.salary) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-md max-w-sm w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-yellow-300">สมัครสมาชิก</h2>

        <input
          type="text"
          name="name"
          placeholder="ชื่อ"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />
        <input
          type="email"
          name="email"
          placeholder="อีเมล"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />
        <input
          type="number"
          name="salary"
          placeholder="เงินเดือน"
          value={formData.salary}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition"
        >
          สมัครสมาชิก
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;