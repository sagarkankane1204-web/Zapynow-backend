import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper: ensure db folder + files exist on Glitch
const DB_DIR = "./db";
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
if (!fs.existsSync(DB_DIR + "/products.json")) fs.writeFileSync(DB_DIR + "/products.json", "[]");
if (!fs.existsSync(DB_DIR + "/orders.json")) fs.writeFileSync(DB_DIR + "/orders.json", "[]");

function readJSON(path){
  try { return JSON.parse(fs.readFileSync(path, "utf8") || "[]"); }
  catch(e){ return []; }
}
function writeJSON(path, data){ fs.writeFileSync(path, JSON.stringify(data, null, 2)); }

// Endpoints
app.get("/products", (req, res) => {
  const products = readJSON(DB_DIR + "/products.json");
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const products = readJSON(DB_DIR + "/products.json");
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

app.post("/orders", (req, res) => {
  const orders = readJSON(DB_DIR + "/orders.json");
  const { items, total } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Cart empty" });
  const order = {
    id: uuid(),
    items,
    total: Number(total) || 0,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeJSON(DB_DIR + "/orders.json", orders);
  res.json({ success: true, order });
});

app.get("/orders", (req, res) => {
  const orders = readJSON(DB_DIR + "/orders.json");
  res.json(orders);
});

app.listen(PORT, () => console.log("ZapyNow backend running on port", PORT));
