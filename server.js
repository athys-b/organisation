import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_DATA = { events: [], todos: [], recurrences: [] };

function loadData() {
  try {
    return { ...DEFAULT_DATA, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const collections = ["events", "todos", "recurrences"];

app.get("/api/state", (req, res) => res.json(loadData()));

function crud(name) {
  app.get(`/api/${name}`, (req, res) => res.json(loadData()[name]));

  app.post(`/api/${name}`, (req, res) => {
    const data = loadData();
    const item = { id: crypto.randomUUID(), ...req.body };
    data[name].push(item);
    saveData(data);
    res.status(201).json(item);
  });

  app.patch(`/api/${name}/:id`, (req, res) => {
    const data = loadData();
    const item = data[name].find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Introuvable." });
    Object.assign(item, req.body);
    saveData(data);
    res.json(item);
  });

  app.delete(`/api/${name}/:id`, (req, res) => {
    const data = loadData();
    const before = data[name].length;
    data[name] = data[name].filter((i) => i.id !== req.params.id);
    if (data[name].length === before) return res.status(404).json({ error: "Introuvable." });
    saveData(data);
    res.status(204).end();
  });
}

collections.forEach(crud);
app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint inconnu." }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Organiseur démarré sur http://localhost:${PORT}`);
});
