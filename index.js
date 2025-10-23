import express from "express";
import fs from "fs";
import cors from "cors";
import serverless from "serverless-http";

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "./database.json";
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ tokens: [] }, null, 2));
}

const ADMIN_KEY = "MirisV2";

app.get("/api/database", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data);
  } catch {
    res.status(500).json({ error: "Gagal membaca database" });
  }
});

app.post("/api/add", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== ADMIN_KEY) return res.status(403).json({ error: "Unauthorized" });
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token kosong" });

  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    if (data.tokens.includes(token)) return res.status(400).json({ error: "Token sudah ada" });
    data.tokens.push(token);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.json({ message: "✅ Token ditambahkan", total: data.tokens.length });
  } catch {
    res.status(500).json({ error: "Gagal menulis database" });
  }
});

app.post("/api/remove", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== ADMIN_KEY) return res.status(403).json({ error: "Unauthorized" });
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token kosong" });

  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const before = data.tokens.length;
    data.tokens = data.tokens.filter(t => t !== token);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.json({ message: "Token dihapus", total: data.tokens.length, removed: before - data.tokens.length });
  } catch {
    res.status(500).json({ error: "Gagal menulis database" });
  }
});

app.get("/api", (req, res) => {
  res.send(`
    <h2>Token Database API</h2>
    <ul>
      <li>GET /api/database → lihat semua token</li>
      <li>POST /api/add → tambah token</li>
      <li>POST /api/remove → hapus token</li>
    </ul>
  `);
});

export default serverless(app);
