const API = "/api";
let state = { events: [], todos: [], recurrences: [] };

const $ = (id) => document.getElementById(id);
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DOW = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const WEEKDAY_NAMES = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

function fmtDate(isoStr) {
  const d = parseISO(isoStr);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

async function api(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function refresh() {
  state = await api("GET", "/state");
  renderCalendar();
  renderUpcoming();
  renderTodos();
  renderRecurrences();
}

/* ---------- Onglets ---------- */
document.querySelectorAll(".tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab, .panel").forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    $("tab-" + btn.dataset.tab).classList.add("active");
  })
);

/* ---------- Calendrier ---------- */
let calCursor = new Date();

$("cal-prev").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() - 1); renderCalendar(); });
$("cal-next").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() + 1); renderCalendar(); });

function renderCalendar() {
  const y = calCursor.getFullYear();
  const m = calCursor.getMonth();
  $("cal-title").textContent = `${MONTHS[m]} ${y}`;
  const grid = $("cal-grid");
  grid.innerHTML = "";

  for (const d of DOW) {
    const el = document.createElement("div");
    el.className = "dow";
    el.textContent = d;
    grid.appendChild(el);
  }

  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - startOffset);
  const todayISO = iso(new Date());

  for (let i = 0; i < 42; i++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const cell = document.createElement("div");
    cell.className = "day" + (day.getMonth() !== m ? " other" : "") + (iso(day) === todayISO ? " today" : "");
    const num = document.createElement("div");
    num.className = "num";
    num.textContent = day.getDate();
    cell.appendChild(num);

    for (const ev of state.events.filter((e) => e.date === iso(day))) {
      const tag = document.createElement("div");
      tag.className = "ev";
      tag.textContent = (ev.time ? ev.time + " " : "") + ev.title;
      cell.appendChild(tag);
    }

    cell.addEventListener("click", () => {
      $("event-date").value = iso(day);
      $("event-title").focus();
    });
    grid.appendChild(cell);
  }
}

/* ---------- Événements ---------- */
$("event-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("POST", "/events", {
    date: $("event-date").value,
    time: $("event-time").value || null,
    title: $("event-title").value.trim(),
  });
  $("event-title").value = "";
  $("event-time").value = "";
  refresh();
});

function eventLabel(ev) {
  return `${ev.time ? ev.time + " — " : ""}${ev.title}`;
}

function renderUpcoming() {
  const list = $("upcoming");
  list.innerHTML = "";
  const today = iso(new Date());
  const upcoming = state.events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  if (!upcoming.length) {
    list.innerHTML = '<li class="empty">Aucun événement à venir.</li>';
    return;
  }
  for (const ev of upcoming.slice(0, 20)) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "grow";
    label.textContent = eventLabel(ev);
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = fmtDate(ev.date);
    const del = delButton(() => api("DELETE", "/events/" + ev.id).then(refresh));
    li.append(label, meta, del);
    list.appendChild(li);
  }
}

/* ---------- Tâches ---------- */
$("todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  await api("POST", "/todos", { title: $("todo-title").value.trim(), done: false });
  $("todo-title").value = "";
  refresh();
});

function renderTodos() {
  const list = $("todo-list");
  list.innerHTML = "";
  const todos = [...state.todos].sort((a, b) => Number(a.done) - Number(b.done));
  if (!todos.length) {
    list.innerHTML = '<li class="empty">Aucune tâche. AJoutez-en une !</li>';
    return;
  }
  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = todo.done;
    cb.addEventListener("change", () => api("PATCH", "/todos/" + todo.id, { done: cb.checked }).then(refresh));
    const label = document.createElement("span");
    label.className = "grow label";
    label.textContent = todo.title;
    const del = delButton(() => api("DELETE", "/todos/" + todo.id).then(refresh));
    li.append(cb, label, del);
    list.appendChild(li);
  }
}

/* ---------- Récurrences ---------- */
$("rec-freq").addEventListener("change", () => {
  const monthly = $("rec-freq").value === "monthly";
  const weekly = $("rec-freq").value === "weekly";
  $("rec-day-wrap").hidden = !monthly;
  $("rec-weekday-wrap").hidden = !weekly;
});

$("rec-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const freq = $("rec-freq").value;
  if (freq === "monthly") {
    const day = parseInt($("rec-day").value, 10);
    if (!day || day < 1 || day > 31) return alert("Jour du mois invalide (1-31).");
    await api("POST", "/recurrences", { title: $("rec-title").value.trim(), freq, day, lastDone: null });
  } else if (freq === "weekly") {
    await api("POST", "/recurrences", { title: $("rec-title").value.trim(), freq, weekday: parseInt($("rec-weekday").value, 10), lastDone: null });
  } else {
    await api("POST", "/recurrences", { title: $("rec-title").value.trim(), freq, lastDone: null });
  }
  $("rec-title").value = "";
  refresh();
});

function nextOccurrence(rec, from = new Date()) {
  const today = parseISO(iso(from));
  if (rec.freq === "daily") return today;
  if (rec.freq === "weekly") {
    const target = rec.weekday;
    const diff = (target - 1 - ((today.getDay() + 6) % 7) + 7) % 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next;
  }
  const lastOfCurrentMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  const effectiveDay = Math.min(rec.day, lastOfCurrentMonth);
  const thisMonth = new Date(from.getFullYear(), from.getMonth(), effectiveDay);
  if (thisMonth >= today) return thisMonth;
  const lastOfNextMonth = new Date(from.getFullYear(), from.getMonth() + 2, 0).getDate();
  return new Date(from.getFullYear(), from.getMonth() + 1, Math.min(rec.day, lastOfNextMonth));
}

function renderRecurrences() {
  const list = $("rec-list");
  list.innerHTML = "";
  const recs = [...state.recurrences].sort((a, b) =>
    nextOccurrence(a).getTime() - nextOccurrence(b).getTime()
  );
  if (!recs.length) {
    list.innerHTML = '<li class="empty">Aucune récurrence. Créez-en une (ex. « Payer URSSAF », chaque mois, le 31).</li>';
    return;
  }
  for (const rec of recs) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "grow";
    label.textContent = rec.title;
    const meta = document.createElement("span");
    meta.className = "meta";
    const freqText =
      rec.freq === "daily" ? "chaque jour" :
      rec.freq === "weekly" ? `chaque ${WEEKDAY_NAMES[rec.weekday]}` :
      `le ${rec.day} de chaque mois`;
    const next = nextOccurrence(rec);
    meta.textContent = `${freqText} — prochaine : ${fmtDate(iso(next))}`;
    const done = document.createElement("button");
    done.className = "markdone";
    done.textContent = "Marquer fait";
    done.addEventListener("click", () => api("PATCH", "/recurrences/" + rec.id, { lastDone: iso(new Date()) }).then(refresh));
    const del = delButton(() => api("DELETE", "/recurrences/" + rec.id).then(refresh));
    li.append(label, meta, done, del);
    list.appendChild(li);
  }
}

/* ---------- Utilitaires ---------- */
function delButton(onClick) {
  const btn = document.createElement("button");
  btn.className = "delt";
  btn.title = "Supprimer";
  btn.textContent = "✕";
  btn.addEventListener("click", onClick);
  return btn;
}

refresh();
