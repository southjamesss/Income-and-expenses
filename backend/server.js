const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

// GET: ดึงผู้ใช้ทั้งหมด (พร้อมค่าใช้จ่าย)
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { expenses: true },
    });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: 'Something went wrong while fetching users.' });
  }
});

// POST: สมัครผู้ใช้ใหม่ (Register)
app.post('/users', async (req, res) => {
  const { name, email, password, salary } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        salary: parseFloat(salary),
      },
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ error: 'Unable to create user. Email may already be used.' });
  }
});

// POST: เข้าสู่ระบบ (Login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST: เพิ่มค่าใช้จ่ายใหม่
app.post('/expenses', async (req, res) => {
  const { userId, amount, category, date, note } = req.body;
  try {
    const newExpense = await prisma.expense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        note,
      },
    });
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    res.status(500).json({ error: 'Unable to create expense.' });
  }
});

// DELETE: ลบค่าใช้จ่าย
app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end(); // ส่งกลับว่าไม่มีเนื้อหา (ลบสำเร็จ)
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ error: 'Unable to delete expense.' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});