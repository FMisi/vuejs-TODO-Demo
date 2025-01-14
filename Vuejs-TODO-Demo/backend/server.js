const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite adatbázis létrehozása és kapcsolat
// ha memóriaalapút akarok létrehozni, akkor: mytododatabase.db helyett :memory:
const db = new sqlite3.Database("mytododatabase.db");

// TODO tábla létrehozása
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)");
});

// API végpontok

// 1. Összes TODO lekérése
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. Új TODO hozzáadása
app.post("/todos", (req, res) => {
  const { text } = req.body;
  db.run("INSERT INTO todos (text) VALUES (?)", [text], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, text });
  });
});

// 3. TODO törlése
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// 4. TODO frissítése
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  db.run("UPDATE todos SET text = ? WHERE id = ?", [text, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
