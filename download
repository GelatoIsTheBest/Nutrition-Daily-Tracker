import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Settings, TrendingUp,
  X, Check, Loader2, CalendarDays, Sparkles, Trash2, Pencil, Download, Upload
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    .nt-root {
      --ink: #212B26;
      --paper: #F5F4EF;
      --paper-raised: #FFFFFF;
      --sage: #6B8F71;
      --sage-soft: #DCE6DD;
      --clay: #C97B4A;
      --clay-soft: #F3E1D2;
      --rust: #B5533C;
      --rust-soft: #F1DAD3;
      --mist: #A8B8AE;
      --mist-soft: #E7EBE5;
      --gold: #D4A73B;
      font-family: 'Inter', sans-serif;
      color: var(--ink);
      background: var(--paper);
    }
    .nt-display { font-family: 'Fraunces', serif; }
    .nt-mono { font-family: 'IBM Plex Mono', monospace; }

    .nt-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .nt-scroll::-webkit-scrollbar-thumb { background: var(--mist); border-radius: 3px; }

    @keyframes nt-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .nt-fade-in { animation: nt-fade-in 0.25s ease-out; }

    @keyframes nt-spin { to { transform: rotate(360deg); } }
    .nt-spin { animation: nt-spin 1s linear infinite; }

    .nt-ring-track { stroke: var(--mist-soft); fill: none; }
    .nt-ring-fill { fill: none; stroke-linecap: round; transition: stroke-dashoffset 0.4s ease, stroke 0.4s ease; }

    .nt-btn { transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease; }
    .nt-btn:active { transform: scale(0.97); }

    .nt-cell:hover { background: var(--paper-raised); }

    input[type="range"].nt-range { accent-color: var(--sage); }
  `}</style>
);

/* ---------------------------------------------------------------------- */
/* Date helpers                                                           */
/* ---------------------------------------------------------------------- */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
function startOfWeek(d) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() - nd.getDay());
  nd.setHours(0,0,0,0);
  return nd;
}
function getMonthGrid(anchor) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  const days = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
  return days;
}

/* ---------------------------------------------------------------------- */
/* Nutrition constants                                                    */
/* ---------------------------------------------------------------------- */

const NUTRIENTS = [
  { key: "calories", label: "Calories", unit: "kcal", color: "var(--ink)" },
  { key: "protein", label: "Protein", unit: "g", color: "var(--sage)" },
  { key: "carbs", label: "Carbs", unit: "g", color: "var(--clay)" },
  { key: "fiber", label: "Fiber", unit: "g", color: "var(--gold)" },
  { key: "fat", label: "Fat", unit: "g", color: "var(--rust)" },
  { key: "calcium", label: "Calcium", unit: "mg", color: "var(--mist)" },
  { key: "iron", label: "Iron", unit: "mg", color: "#8B6BAB" },
];

const DEFAULT_GOALS = {
  calories: 1650, protein: 100, carbs: 190, fiber: 31, fat: 50, calcium: 1000, iron: 18,
};

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

/* ---------------------------------------------------------------------- */
/* DRI calculation (IOM Dietary Reference Intakes, adults 19+)            */
/* ---------------------------------------------------------------------- */

function calculateDRI({ age, sex, heightCm, weightKg, activity }) {
  const heightM = heightCm / 100;
  const PA = {
    male: { sedentary: 1.00, low: 1.11, active: 1.25, veryActive: 1.48 },
    female: { sedentary: 1.00, low: 1.12, active: 1.27, veryActive: 1.45 },
  };
  const pa = PA[sex][activity];

  let eer;
  if (sex === "male") {
    eer = 662 - 9.53 * age + pa * (15.91 * weightKg + 539.6 * heightM);
  } else {
    eer = 354 - 6.91 * age + pa * (9.36 * weightKg + 726 * heightM);
  }
  eer = Math.round(eer);

  const protein = Math.round(weightKg * 0.8);
  const fiber = Math.round((eer / 1000) * 14);
  const carbs = Math.round((eer * 0.50) / 4); // midpoint of 45-65% AMDR
  const fat = Math.round((eer * 0.275) / 9); // midpoint of 20-35% AMDR

  let calcium;
  if (age >= 71) calcium = 1200;
  else if (age >= 51) calcium = sex === "female" ? 1200 : 1000;
  else calcium = 1000;

  let iron;
  if (sex === "male") iron = 8;
  else iron = age >= 51 ? 8 : 18;

  return { calories: eer, protein, carbs, fiber, fat, calcium, iron };
}

/* ---------------------------------------------------------------------- */
/* Storage helpers                                                        */
/* ---------------------------------------------------------------------- */

async function loadEntries(dateKey) {
  try {
    const res = await window.storage.get(`entries:${dateKey}`, false);
    return res ? JSON.parse(res.value) : [];
  } catch (e) {
    return [];
  }
}
async function saveEntries(dateKey, entries) {
  try {
    await window.storage.set(`entries:${dateKey}`, JSON.stringify(entries), false);
  } catch (e) {
    console.error("Save failed", e);
  }
}
async function loadJSON(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : fallback;
  } catch (e) {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("Save failed", e);
  }
}

/* ---------------------------------------------------------------------- */
/* Stickers                                                                */
/* ---------------------------------------------------------------------- */

const STICKERS = [
  { key: "poop", emoji: "💩", label: "Bathroom", color: "var(--clay)" },
  { key: "exercise", emoji: "🏃", label: "Exercise", color: "var(--sage)" },
];

function blankStickerState() {
  return { poop: false, exercise: false, exerciseCalories: "" };
}
async function loadStickers(dateKey) {
  return await loadJSON(`stickers:${dateKey}`, blankStickerState());
}
async function saveStickers(dateKey, data) {
  await saveJSON(`stickers:${dateKey}`, data);
}

/* ---------------------------------------------------------------------- */
/* Small shared UI pieces                                                 */
/* ---------------------------------------------------------------------- */

function sumEntries(entries) {
  const totals = { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0, calcium: 0, iron: 0 };
  for (const e of entries) {
    for (const n of NUTRIENTS) totals[n.key] += Number(e[n.key]) || 0;
  }
  return totals;
}

function progressColor(ratio) {
  if (ratio < 0.7) return "var(--clay)";
  if (ratio <= 1.15) return "var(--sage)";
  return "var(--rust)";
}

function DayRing({ ratio, size = 34, stroke = 3, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(ratio, 1));
  const offset = c * (1 - clamped);
  const color = ratio === null || ratio === undefined ? "var(--mist-soft)" : progressColor(ratio);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="nt-ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        {ratio !== null && ratio !== undefined && (
          <circle
            className="nt-ring-fill"
            cx={size/2} cy={size/2} r={r}
            strokeWidth={stroke}
            stroke={color}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ value, goal, color }) {
  const ratio = goal > 0 ? value / goal : 0;
  const pct = Math.max(0, Math.min(ratio, 1)) * 100;
  return (
    <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--mist-soft)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.3s ease" }} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Header / nav                                                           */
/* ---------------------------------------------------------------------- */

function Header({ view, setView, anchorDate, setAnchorDate, onLog, onGoals, onExport, onImport }) {
  const importInputRef = useRef(null);
  const label = useMemo(() => {
    if (view === "month") return `${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
    if (view === "week") {
      const start = startOfWeek(anchorDate);
      const end = addDays(start, 6);
      const sameMonth = start.getMonth() === end.getMonth();
      return sameMonth
        ? `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
        : `${MONTH_NAMES[start.getMonth()].slice(0,3)} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()].slice(0,3)} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${DAY_NAMES[anchorDate.getDay()]}, ${MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getDate()}, ${anchorDate.getFullYear()}`;
  }, [view, anchorDate]);

  function step(dir) {
    if (view === "month") {
      const nd = new Date(anchorDate);
      nd.setMonth(nd.getMonth() + dir);
      setAnchorDate(nd);
    } else if (view === "week") {
      setAnchorDate(addDays(anchorDate, dir * 7));
    } else {
      setAnchorDate(addDays(anchorDate, dir));
    }
  }

  return (
    <div style={{ borderBottom: "1px solid var(--mist-soft)", background: "var(--paper-raised)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={18} color="white" />
            </div>
            <h1 className="nt-display" style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>Sustenance</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value = ""; }} />
            <button onClick={() => importInputRef.current.click()} title="Import a backup file" className="nt-btn" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
              border: "1px solid var(--mist-soft)", background: "var(--paper)", cursor: "pointer", fontSize: 13.5, fontWeight: 500
            }}>
              <Upload size={15} />
            </button>
            <button onClick={onExport} title="Download a backup of your data" className="nt-btn" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
              border: "1px solid var(--mist-soft)", background: "var(--paper)", cursor: "pointer", fontSize: 13.5, fontWeight: 500
            }}>
              <Download size={15} />
            </button>
            <button onClick={onGoals} className="nt-btn" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10,
              border: "1px solid var(--mist-soft)", background: "var(--paper)", cursor: "pointer", fontSize: 13.5, fontWeight: 500
            }}>
              <Settings size={15} /> Goals & DRI
            </button>
            <button onClick={onLog} className="nt-btn" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
              border: "none", background: "var(--ink)", color: "white", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
              boxShadow: "0 2px 6px rgba(33,43,38,0.18)"
            }}>
              <Plus size={16} /> Log food
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => step(-1)} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}>
              <ChevronLeft size={20} />
            </button>
            <div className="nt-display" style={{ fontSize: 18, fontWeight: 500, minWidth: 190, textAlign: "center" }}>{label}</div>
            <button onClick={() => step(1)} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}>
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setAnchorDate(new Date())}
              className="nt-btn"
              style={{ marginLeft: 4, fontSize: 12.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--mist-soft)", background: "var(--paper)", cursor: "pointer", color: "var(--ink)" }}
            >Today</button>
          </div>

          <div style={{ display: "flex", background: "var(--mist-soft)", borderRadius: 10, padding: 3, gap: 2 }}>
            {["month", "week", "day", "trends"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="nt-btn"
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                  background: view === v ? "var(--paper-raised)" : "transparent",
                  color: view === v ? "var(--ink)" : "#5b6b60",
                  boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >{v}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Month view                                                             */
/* ---------------------------------------------------------------------- */

function MonthView({ anchorDate, goals, entriesCache, ensureLoaded, onSelectDay, stickersCache, ensureStickersLoaded }) {
  const days = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);
  const today = new Date();

  useEffect(() => {
    days.forEach((d) => { ensureLoaded(toKey(d)); ensureStickersLoaded(toKey(d)); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }} className="nt-fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--mist-soft)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--mist-soft)" }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ background: "var(--paper)", padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#5b6b60", letterSpacing: 0.4 }}>
            {d.toUpperCase()}
          </div>
        ))}
        {days.map((d) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === anchorDate.getMonth();
          const isToday = sameDay(d, today);
          const entries = entriesCache[key];
          const totals = entries ? sumEntries(entries) : null;
          const ratio = totals ? (goals.calories > 0 ? totals.calories / goals.calories : 0) : null;
          const hasEntries = entries && entries.length > 0;
          const stickers = stickersCache[key];
          const activeStickers = STICKERS.filter((s) => stickers && stickers[s.key]);

          return (
            <div
              key={key}
              onClick={() => onSelectDay(d)}
              className="nt-cell"
              style={{
                background: "var(--paper-raised)", minHeight: 92, padding: 8, cursor: "pointer",
                opacity: inMonth ? 1 : 0.4, display: "flex", flexDirection: "column", gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <DayRing ratio={hasEntries ? ratio : null} size={30} stroke={2.5}>
                  <span className="nt-mono" style={{
                    fontSize: 12.5, fontWeight: isToday ? 700 : 500,
                    color: isToday ? "var(--sage)" : "var(--ink)",
                  }}>{d.getDate()}</span>
                </DayRing>
                {activeStickers.length > 0 && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {activeStickers.map((s) => (
                      <span key={s.key} title={s.key === "exercise" && stickers.exerciseCalories ? `${stickers.exerciseCalories} kcal burned` : s.label} style={{ fontSize: 13, lineHeight: 1 }}>{s.emoji}</span>
                    ))}
                  </div>
                )}
                {isToday && activeStickers.length === 0 && <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--sage)" }} />}
              </div>
              {hasEntries && (
                <div className="nt-mono" style={{ fontSize: 10.5, color: "#6b7a70", marginTop: "auto" }}>
                  {Math.round(totals.calories)} kcal · {entries.length} item{entries.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 16, fontSize: 12, color: "#5b6b60", alignItems: "center" }}>
        <LegendDot color="var(--clay)" label="Under goal" />
        <LegendDot color="var(--sage)" label="On target" />
        <LegendDot color="var(--rust)" label="Over goal" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Week view                                                              */
/* ---------------------------------------------------------------------- */

function WeekView({ anchorDate, goals, entriesCache, ensureLoaded, onSelectDay }) {
  const start = startOfWeek(anchorDate);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [anchorDate]);
  const today = new Date();

  useEffect(() => {
    days.forEach((d) => ensureLoaded(toKey(d)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }} className="nt-fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {days.map((d) => {
          const key = toKey(d);
          const entries = entriesCache[key] || [];
          const totals = sumEntries(entries);
          const isToday = sameDay(d, today);
          return (
            <div
              key={key}
              onClick={() => onSelectDay(d)}
              className="nt-cell nt-btn"
              style={{
                background: "var(--paper-raised)", borderRadius: 12, padding: 12, cursor: "pointer",
                border: isToday ? "1.5px solid var(--sage)" : "1px solid var(--mist-soft)",
                display: "flex", flexDirection: "column", gap: 10, minHeight: 220,
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#5b6b60", letterSpacing: 0.4 }}>{DAY_NAMES[d.getDay()].toUpperCase()}</div>
                <div className="nt-display" style={{ fontSize: 20, fontWeight: 600, color: isToday ? "var(--sage)" : "var(--ink)" }}>{d.getDate()}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["calories","protein","fiber"].map((k) => {
                  const nut = NUTRIENTS.find(n => n.key === k);
                  return (
                    <div key={k}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7a70", marginBottom: 2 }}>
                        <span>{nut.label}</span>
                        <span className="nt-mono">{Math.round(totals[k])}/{goals[k]}</span>
                      </div>
                      <ProgressBar value={totals[k]} goal={goals[k]} color={nut.color} />
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "auto", fontSize: 10.5, color: "#8a978e" }}>{entries.length} item{entries.length !== 1 ? "s" : ""} logged</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Day view                                                               */
/* ---------------------------------------------------------------------- */

function DayView({ date, goals, entries, onDeleteEntry, onLog, stickers, onUpdateStickers }) {
  const totals = sumEntries(entries);
  const grouped = MEALS.map((m) => ({ meal: m, items: entries.filter((e) => e.meal === m) }));
  const overallEntries = entries.filter((e) => e.meal === "Overall");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }} className="nt-fade-in">
      <div>
        {overallEntries.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 className="nt-display" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Overall (entered directly)</h3>
              <span className="nt-mono" style={{ fontSize: 11.5, color: "#8a978e" }}>
                {Math.round(overallEntries.reduce((s, i) => s + (Number(i.calories) || 0), 0))} kcal
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {overallEntries.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--sage-soft)", border: "1px solid var(--mist-soft)", borderRadius: 10, padding: "10px 14px"
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="nt-mono" style={{ fontSize: 12, color: "#3d5442", textAlign: "right" }}>
                      {Math.round(item.calories)} kcal<br/>
                      <span style={{ color: "#5b7a5f" }}>{Math.round(item.protein)}p · {Math.round(item.carbs)}c · {Math.round(item.fat)}f</span>
                    </div>
                    <button onClick={() => onDeleteEntry(item.id)} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer", color: "#c2a49a" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {grouped.map(({ meal, items }) => (
          <div key={meal} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 className="nt-display" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{meal}</h3>
              <span className="nt-mono" style={{ fontSize: 11.5, color: "#8a978e" }}>
                {Math.round(items.reduce((s, i) => s + (Number(i.calories) || 0), 0))} kcal
              </span>
            </div>
            {items.length === 0 ? (
              <div style={{ fontSize: 13, color: "#a3ada0", padding: "10px 0", borderTop: "1px solid var(--mist-soft)" }}>Nothing logged yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 10, padding: "10px 14px"
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11.5, color: "#8a978e" }}>{item.quantity}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="nt-mono" style={{ fontSize: 12, color: "#5b6b60", textAlign: "right" }}>
                        {Math.round(item.calories)} kcal<br/>
                        <span style={{ color: "#a3ada0" }}>{Math.round(item.protein)}p · {Math.round(item.carbs)}c · {Math.round(item.fat)}f</span>
                      </div>
                      <button onClick={() => onDeleteEntry(item.id)} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer", color: "#c2a49a" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <button onClick={onLog} className="nt-btn" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10,
          border: "1.5px dashed var(--mist)", background: "transparent", cursor: "pointer", fontSize: 13.5, color: "#5b6b60", width: "100%", justifyContent: "center"
        }}>
          <Plus size={16} /> Log food for this day
        </button>
      </div>

      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
          <div style={{ background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 14, padding: 18 }}>
            <h3 className="nt-display" style={{ fontSize: 16, fontWeight: 600, margin: "0 0 14px" }}>Daily summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {NUTRIENTS.map((n) => (
                <div key={n.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: "#5b6b60" }}>{n.label}</span>
                    <span className="nt-mono" style={{ fontWeight: 600 }}>
                      {Math.round(totals[n.key] * 10) / 10}<span style={{ color: "#a3ada0", fontWeight: 400 }}> / {goals[n.key]} {n.unit}</span>
                    </span>
                  </div>
                  <ProgressBar value={totals[n.key]} goal={goals[n.key]} color={n.color} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 14, padding: 18 }}>
            <h3 className="nt-display" style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>Stickers</h3>
            <div style={{ fontSize: 11.5, color: "#8a978e", marginBottom: 14 }}>Tap to mark things about today.</div>
            <div style={{ display: "flex", gap: 12 }}>
              {STICKERS.map((s) => {
                const active = !!stickers[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => onUpdateStickers({ ...stickers, [s.key]: !active })}
                    className="nt-btn"
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      flex: 1, padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                      border: active ? `2px solid ${s.color}` : "2px solid var(--mist-soft)",
                      background: active ? `${s.color}22` : "var(--paper)",
                    }}
                  >
                    <span style={{ fontSize: 26, filter: active ? "none" : "grayscale(100%)", opacity: active ? 1 : 0.45 }}>{s.emoji}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? s.color : "#8a978e" }}>{s.label}</span>
                  </button>
                );
              })}
            </div>
            {stickers.exercise && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 11.5, color: "#5b6b60" }}>
                  Calories burned (optional)
                  <input
                    type="number"
                    value={stickers.exerciseCalories}
                    onChange={(e) => onUpdateStickers({ ...stickers, exerciseCalories: e.target.value })}
                    placeholder="e.g. 320"
                    className="nt-mono"
                    style={{ width: "100%", fontSize: 13.5, border: "1px solid var(--mist-soft)", borderRadius: 8, padding: "7px 9px", marginTop: 6, boxSizing: "border-box", background: "var(--paper)" }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Trends view                                                            */
/* ---------------------------------------------------------------------- */

function TrendsView({ anchorDate, ensureLoaded, entriesCache, goals }) {
  const [range, setRange] = useState("week"); // week | month
  const days = useMemo(() => {
    if (range === "week") {
      const start = startOfWeek(anchorDate);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    return getMonthGrid(anchorDate).filter(d => d.getMonth() === anchorDate.getMonth());
  }, [range, anchorDate]);

  useEffect(() => {
    days.forEach((d) => ensureLoaded(toKey(d)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, anchorDate]);

  const chartData = days.map((d) => {
    const key = toKey(d);
    const totals = sumEntries(entriesCache[key] || []);
    return {
      label: range === "week" ? DAY_NAMES[d.getDay()] : String(d.getDate()),
      ...totals,
    };
  });

  const avg = (k) => {
    const vals = chartData.map(c => c[k]).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }} className="nt-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 className="nt-display" style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>Trends</h2>
        <div style={{ display: "flex", background: "var(--mist-soft)", borderRadius: 10, padding: 3, gap: 2 }}>
          {["week","month"].map(r => (
            <button key={r} onClick={() => setRange(r)} className="nt-btn" style={{
              padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, textTransform: "capitalize",
              background: range === r ? "var(--paper-raised)" : "transparent", color: range === r ? "var(--ink)" : "#5b6b60",
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { k: "calories", label: "Avg calories/day" },
          { k: "protein", label: "Avg protein/day" },
          { k: "fiber", label: "Avg fiber/day" },
          { k: "fat", label: "Avg fat/day" },
        ].map(({k,label}) => (
          <div key={k} style={{ background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11.5, color: "#8a978e", marginBottom: 4 }}>{label}</div>
            <div className="nt-mono" style={{ fontSize: 22, fontWeight: 600 }}>{avg(k)}<span style={{ fontSize: 12, color: "#a3ada0", fontWeight: 400 }}> / {goals[k]}</span></div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 14, padding: "18px 18px 6px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Calories</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--mist-soft)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a978e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8a978e" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--mist-soft)" }} />
            <Line type="monotone" dataKey="calories" stroke="var(--ink)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--paper-raised)", border: "1px solid var(--mist-soft)", borderRadius: 14, padding: "18px 18px 6px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Macronutrients (g)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--mist-soft)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a978e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8a978e" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--mist-soft)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="protein" fill="var(--sage)" radius={[3,3,0,0]} />
            <Bar dataKey="carbs" fill="var(--clay)" radius={[3,3,0,0]} />
            <Bar dataKey="fat" fill="var(--rust)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Log food panel — plain manual entry, no API calls                      */
/* ---------------------------------------------------------------------- */

const OVERALL_MEAL = "Overall";
const LOG_TABS = [OVERALL_MEAL, ...MEALS];

function blankItem(meal) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    name: "", quantity: "", meal: meal || "Snack",
    calories: "", protein: "", carbs: "", fiber: "", fat: "", calcium: "", iron: "",
  };
}
function blankTotals() {
  return { calories: "", protein: "", carbs: "", fiber: "", fat: "", calcium: "", iron: "" };
}

function LogFoodPanel({ date, onClose, onSaved }) {
  const [tab, setTab] = useState(OVERALL_MEAL);

  // Per-meal manual entry state
  const [mealItems, setMealItems] = useState({}); // { Breakfast: [item, ...], ... }
  const [mealError, setMealError] = useState(null);
  const [mealSaved, setMealSaved] = useState(false);

  // Overall totals state
  const [overallTotals, setOverallTotals] = useState(blankTotals());
  const [overallSaved, setOverallSaved] = useState(false);

  function itemsForMeal(meal) {
    return mealItems[meal] && mealItems[meal].length > 0 ? mealItems[meal] : [blankItem(meal)];
  }
  function setItemsForMeal(meal, items) {
    setMealItems((prev) => ({ ...prev, [meal]: items }));
  }
  function updateMealItem(meal, id, field, value) {
    const current = itemsForMeal(meal);
    setItemsForMeal(meal, current.map((it) => it.id === id ? { ...it, [field]: value } : it));
  }
  function removeMealItem(meal, id) {
    const current = itemsForMeal(meal);
    const next = current.filter((it) => it.id !== id);
    setItemsForMeal(meal, next.length > 0 ? next : [blankItem(meal)]);
  }
  function addMealItem(meal) {
    setItemsForMeal(meal, [...itemsForMeal(meal), blankItem(meal)]);
  }
  function toNum(v) { return v === "" || v === null || v === undefined ? 0 : Number(v) || 0; }

  async function saveMealTab(meal) {
    setMealError(null);
    const items = itemsForMeal(meal).filter((it) => it.name && it.name.trim());
    if (items.length === 0) {
      setMealError("Add a food name before saving.");
      return;
    }
    const withNumbers = items.map((it) => ({
      ...it,
      calories: toNum(it.calories), protein: toNum(it.protein), carbs: toNum(it.carbs),
      fiber: toNum(it.fiber), fat: toNum(it.fat), calcium: toNum(it.calcium), iron: toNum(it.iron),
    }));
    await onSaved(withNumbers);
    setItemsForMeal(meal, [blankItem(meal)]);
    setMealSaved(true);
    setTimeout(() => setMealSaved(false), 2200);
  }

  async function saveOverall() {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      name: "Daily total (entered directly)",
      quantity: "",
      meal: OVERALL_MEAL,
      calories: toNum(overallTotals.calories), protein: toNum(overallTotals.protein),
      carbs: toNum(overallTotals.carbs), fiber: toNum(overallTotals.fiber),
      fat: toNum(overallTotals.fat), calcium: toNum(overallTotals.calcium), iron: toNum(overallTotals.iron),
    };
    await onSaved([entry]);
    setOverallSaved(true);
    setOverallTotals(blankTotals());
    setTimeout(() => setOverallSaved(false), 2200);
  }

  const numberFieldStyle = { width: "100%", fontSize: 12.5, border: "1px solid var(--mist-soft)", borderRadius: 6, padding: "4px 6px", marginTop: 2, boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(33,43,38,0.35)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} className="nt-fade-in">
      <div style={{ background: "var(--paper)", width: "100%", maxWidth: 580, borderRadius: "18px 18px 0 0", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--mist-soft)" }}>
          <div>
            <h3 className="nt-display" style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Log food</h3>
            <div style={{ fontSize: 12, color: "#8a978e" }}>{DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]} {date.getDate()}</div>
          </div>
          <button onClick={onClose} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "10px 20px 0", overflowX: "auto" }} className="nt-scroll">
          {LOG_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="nt-btn"
              style={{
                padding: "7px 13px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
                background: tab === t ? "var(--paper-raised)" : "transparent",
                color: tab === t ? "var(--ink)" : "#8a978e",
                borderBottom: tab === t ? "2px solid var(--sage)" : "2px solid transparent",
              }}
            >{t}</button>
          ))}
        </div>

        <div className="nt-scroll" style={{ padding: 20, overflowY: "auto", flex: 1 }}>

          {/* ---- Overall tab: just the day's totals ---- */}
          {tab === OVERALL_MEAL && (
            <div>
              <div style={{ fontSize: 13, color: "#5b6b60", marginBottom: 14 }}>
                Skip the itemized log — just enter the day's total nutrition. Leave anything blank you don't know.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {NUTRIENTS.map((n) => (
                  <label key={n.key} style={{ fontSize: 11.5, color: "#5b6b60" }}>
                    {n.label} <span style={{ color: "#a3ada0" }}>({n.unit})</span>
                    <input
                      type="number"
                      value={overallTotals[n.key]}
                      onChange={(e) => setOverallTotals({ ...overallTotals, [n.key]: e.target.value })}
                      placeholder="—"
                      className="nt-mono"
                      style={{ width: "100%", fontSize: 14, border: "1px solid var(--mist-soft)", borderRadius: 8, padding: "8px 9px", marginTop: 4, boxSizing: "border-box", background: "var(--paper-raised)" }}
                    />
                  </label>
                ))}
              </div>
              {overallSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sage)", fontSize: 12.5, marginTop: 14 }}>
                  <Check size={14} /> Saved as a daily total.
                </div>
              )}
              <div style={{ fontSize: 11, color: "#a3ada0", marginTop: 12, lineHeight: 1.5 }}>
                This adds one entry tagged "Overall" for the day. If you also log individual meals, both will add together in your daily summary — so use this instead of meal-by-meal logging, not alongside it, unless that's intentional.
              </div>
              <button onClick={saveOverall} className="nt-btn" style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, marginTop: 14,
                border: "none", background: "var(--sage)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600
              }}>
                <Check size={15} /> Save day's total
              </button>
            </div>
          )}

          {/* ---- Per-meal manual tabs ---- */}
          {MEALS.includes(tab) && (
            <div>
              <div style={{ fontSize: 13, color: "#5b6b60", marginBottom: 12 }}>
                Log what you had for <strong>{tab}</strong>. Just the name is required — nutrition facts are optional.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {itemsForMeal(tab).map((item) => (
                  <div key={item.id} style={{ border: "1px solid var(--mist-soft)", borderRadius: 12, padding: 12, background: "var(--paper-raised)" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input value={item.name} onChange={(e) => updateMealItem(tab, item.id, "name", e.target.value)}
                        placeholder="Food name"
                        style={{ flex: 1, fontSize: 13.5, fontWeight: 500, border: "1px solid var(--mist-soft)", borderRadius: 8, padding: "6px 9px" }} />
                      <button onClick={() => removeMealItem(tab, item.id)} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer", color: "#c2a49a" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <input value={item.quantity} onChange={(e) => updateMealItem(tab, item.id, "quantity", e.target.value)}
                      placeholder="quantity / serving (optional)"
                      style={{ width: "100%", fontSize: 12, color: "#5b6b60", border: "1px solid var(--mist-soft)", borderRadius: 8, padding: "5px 9px", marginBottom: 8, boxSizing: "border-box" }} />
                    <div style={{ fontSize: 10, color: "#a3ada0", marginBottom: 4 }}>Nutrition facts (optional)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {["calories","protein","carbs","fiber","fat","calcium","iron"].map((f) => {
                        const nut = NUTRIENTS.find(n => n.key === f);
                        return (
                          <label key={f} style={{ fontSize: 10, color: "#8a978e" }}>
                            {nut.label}
                            <input type="number" value={item[f]} placeholder="—" onChange={(e) => updateMealItem(tab, item.id, f, e.target.value)}
                              className="nt-mono" style={numberFieldStyle} />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => addMealItem(tab)} className="nt-btn" style={{
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center", width: "100%",
                marginTop: 10, padding: "8px 14px", borderRadius: 10, border: "1.5px dashed var(--mist)",
                background: "transparent", cursor: "pointer", fontSize: 12.5, color: "#5b6b60"
              }}>
                <Plus size={14} /> Add another item to {tab}
              </button>
              {mealSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sage)", fontSize: 12.5, marginTop: 10 }}>
                  <Check size={14} /> Saved to {tab}.
                </div>
              )}
              {mealError && <div style={{ color: "var(--rust)", fontSize: 12.5, marginTop: 10 }}>{mealError}</div>}
              <button onClick={() => saveMealTab(tab)} className="nt-btn" style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, marginTop: 14,
                border: "none", background: "var(--sage)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600
              }}>
                <Check size={15} /> Save {tab}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ---------------------------------------------------------------------- */
/* Goals & DRI panel                                                      */
/* ---------------------------------------------------------------------- */

function GoalsPanel({ goals, setGoals, driProfile, setDriProfile, onClose }) {
  const [profile, setProfile] = useState(driProfile);
  const [localGoals, setLocalGoals] = useState(goals);
  const [driResult, setDriResult] = useState(null);

  function runDRI() {
    const result = calculateDRI(profile);
    setDriResult(result);
  }
  function applyDRI() {
    if (!driResult) return;
    setLocalGoals(driResult);
  }
  async function saveAll() {
    setGoals(localGoals);
    setDriProfile(profile);
    await saveJSON("goals", localGoals);
    await saveJSON("driProfile", profile);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(33,43,38,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} className="nt-fade-in">
      <div style={{ background: "var(--paper)", width: "100%", maxWidth: 620, borderRadius: 18, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--mist-soft)" }}>
          <h3 className="nt-display" style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Goals & DRI calculator</h3>
          <button onClick={onClose} className="nt-btn" style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div className="nt-scroll" style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          <div style={{ fontSize: 13, color: "#5b6b60", marginBottom: 14 }}>
            Calculate a science-based baseline using the Institute of Medicine's Dietary Reference Intakes, then fine-tune manually for your own goals.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="Age">
              <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })} style={fieldStyle} />
            </Field>
            <Field label="Sex">
              <select value={profile.sex} onChange={(e) => setProfile({ ...profile, sex: e.target.value })} style={fieldStyle}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </Field>
            <Field label="Height (cm)">
              <input type="number" value={profile.heightCm} onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })} style={fieldStyle} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={profile.weightKg} onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })} style={fieldStyle} />
            </Field>
            <Field label="Activity level" full>
              <select value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value })} style={fieldStyle}>
                <option value="sedentary">Sedentary (desk job, little exercise)</option>
                <option value="low">Low active (light activity/exercise)</option>
                <option value="active">Active (moderate daily exercise)</option>
                <option value="veryActive">Very active (intense/frequent exercise)</option>
              </select>
            </Field>
          </div>

          <button onClick={runDRI} className="nt-btn" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
            border: "none", background: "var(--ink)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14
          }}>
            <Sparkles size={15} /> Calculate baseline
          </button>

          {driResult && (
            <div style={{ background: "var(--sage-soft)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: "#3d5442" }}>Baseline DRI estimate</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                {NUTRIENTS.map((n) => (
                  <div key={n.key} className="nt-mono" style={{ fontSize: 12.5 }}>
                    <div style={{ color: "#3d5442", fontFamily: "Inter, sans-serif", fontSize: 10.5 }}>{n.label}</div>
                    <div style={{ fontWeight: 600 }}>{driResult[n.key]}<span style={{ fontWeight: 400, fontSize: 10 }}> {n.unit}</span></div>
                  </div>
                ))}
              </div>
              <button onClick={applyDRI} className="nt-btn" style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid var(--sage)", background: "var(--paper-raised)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--sage)"
              }}>Use as my goals</button>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Daily goals</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {NUTRIENTS.map((n) => (
              <Field key={n.key} label={`${n.label} (${n.unit})`}>
                <input type="number" value={localGoals[n.key]} onChange={(e) => setLocalGoals({ ...localGoals, [n.key]: Number(e.target.value) })} style={fieldStyle} />
              </Field>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#a3ada0", marginTop: 16, lineHeight: 1.5 }}>
            Baseline figures follow IOM Dietary Reference Intake formulas (Mifflin-St Jeor-based EER, RDA/AI values by age and sex). This is a general reference, not individualized medical advice — adjust as needed for your own goals, and consult a professional for personalized guidance.
          </div>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--mist-soft)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={saveAll} className="nt-btn" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10,
            border: "none", background: "var(--sage)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600
          }}>
            <Check size={15} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = { width: "100%", fontSize: 13.5, border: "1px solid var(--mist-soft)", borderRadius: 8, padding: "8px 10px", background: "var(--paper-raised)", boxSizing: "border-box" };

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 11.5, color: "#5b6b60", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root app                                                                */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [view, setView] = useState("month");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [entriesCache, setEntriesCache] = useState({});
  const [stickersCache, setStickersCache] = useState({});
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [driProfile, setDriProfile] = useState({ age: 35, sex: "female", heightCm: 165, weightKg: 65, activity: "sedentary" });
  const [showLog, setShowLog] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [ready, setReady] = useState(false);
  const loadingKeys = useRef(new Set());
  const loadingStickerKeys = useRef(new Set());

  useEffect(() => {
    (async () => {
      const g = await loadJSON("goals", DEFAULT_GOALS);
      const p = await loadJSON("driProfile", driProfile);
      setGoals(g);
      setDriProfile(p);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureLoaded = useCallback((key) => {
    if (entriesCache[key] !== undefined || loadingKeys.current.has(key)) return;
    loadingKeys.current.add(key);
    loadEntries(key).then((data) => {
      setEntriesCache((prev) => ({ ...prev, [key]: data }));
      loadingKeys.current.delete(key);
    });
  }, [entriesCache]);

  const ensureStickersLoaded = useCallback((key) => {
    if (stickersCache[key] !== undefined || loadingStickerKeys.current.has(key)) return;
    loadingStickerKeys.current.add(key);
    loadStickers(key).then((data) => {
      setStickersCache((prev) => ({ ...prev, [key]: data }));
      loadingStickerKeys.current.delete(key);
    });
  }, [stickersCache]);

  useEffect(() => {
    ensureLoaded(toKey(selectedDay));
    ensureStickersLoaded(toKey(selectedDay));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  async function handleUpdateStickers(newData) {
    const key = toKey(selectedDay);
    setStickersCache((prev) => ({ ...prev, [key]: newData }));
    await saveStickers(key, newData);
  }

  function selectDay(d) {
    setSelectedDay(d);
    setAnchorDate(d);
    setView("day");
  }

  async function handleSaveEntries(newItems) {
    const key = toKey(selectedDay);
    const current = entriesCache[key] || [];
    const updated = [...current, ...newItems];
    setEntriesCache((prev) => ({ ...prev, [key]: updated }));
    await saveEntries(key, updated);
    setShowLog(false);
  }

  async function handleDeleteEntry(id) {
    const key = toKey(selectedDay);
    const current = entriesCache[key] || [];
    const updated = current.filter((e) => e.id !== id);
    setEntriesCache((prev) => ({ ...prev, [key]: updated }));
    await saveEntries(key, updated);
  }

  async function handleExport() {
    try {
      let keys = [];
      try {
        const listRes = await window.storage.list("entries:", false);
        keys = (listRes && listRes.keys) || [];
      } catch (e) { /* storage may be unavailable — fall back to cache only */ }

      const dateKeys = new Set(keys.map((k) => k.replace(/^entries:/, "")));
      Object.keys(entriesCache).forEach((k) => dateKeys.add(k));
      Object.keys(stickersCache).forEach((k) => dateKeys.add(k));

      const allEntries = {};
      const allStickers = {};
      for (const dk of dateKeys) {
        allEntries[dk] = entriesCache[dk] !== undefined ? entriesCache[dk] : await loadEntries(dk);
        allStickers[dk] = stickersCache[dk] !== undefined ? stickersCache[dk] : await loadStickers(dk);
      }

      const payload = {
        app: "Sustenance nutrition tracker backup",
        exportedAt: new Date().toISOString(),
        goals, driProfile, entries: allEntries, stickers: allStickers,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sustenance-backup-${toKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed — see the browser console for details.");
    }
  }

  async function handleImport(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.goals) setGoals(data.goals);
      if (data.driProfile) setDriProfile(data.driProfile);
      if (data.entries) {
        setEntriesCache((prev) => ({ ...prev, ...data.entries }));
        for (const [dateKey, items] of Object.entries(data.entries)) {
          saveEntries(dateKey, items).catch(() => {});
        }
      }
      if (data.stickers) {
        setStickersCache((prev) => ({ ...prev, ...data.stickers }));
        for (const [dateKey, s] of Object.entries(data.stickers)) {
          saveStickers(dateKey, s).catch(() => {});
        }
      }
      // Best-effort: also try writing goals/DRI back to persistent storage,
      // in case it's actually available (paid plan + published artifact).
      // If not, this silently fails and the imported data still lives in
      // memory for the rest of this session.
      if (data.goals) saveJSON("goals", data.goals).catch(() => {});
      if (data.driProfile) saveJSON("driProfile", data.driProfile).catch(() => {});
      alert("Backup restored.");
    } catch (e) {
      console.error("Import failed", e);
      alert("Couldn't read that file — make sure it's a backup exported from this app.");
    }
  }

  if (!ready) {
    return (
      <div className="nt-root" style={{ minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FontImport />
        <Loader2 size={22} className="nt-spin" color="var(--sage, #6B8F71)" />
      </div>
    );
  }

  return (
    <div className="nt-root" style={{ minHeight: 600 }}>
      <FontImport />
      <Header
        view={view} setView={setView}
        anchorDate={view === "day" ? selectedDay : anchorDate}
        setAnchorDate={(d) => { if (view === "day") { setSelectedDay(d); } setAnchorDate(d); }}
        onLog={() => setShowLog(true)}
        onGoals={() => setShowGoals(true)}
        onExport={handleExport}
        onImport={handleImport}
      />

      {view === "month" && (
        <MonthView anchorDate={anchorDate} goals={goals} entriesCache={entriesCache} ensureLoaded={ensureLoaded} onSelectDay={selectDay} stickersCache={stickersCache} ensureStickersLoaded={ensureStickersLoaded} />
      )}
      {view === "week" && (
        <WeekView anchorDate={anchorDate} goals={goals} entriesCache={entriesCache} ensureLoaded={ensureLoaded} onSelectDay={selectDay} />
      )}
      {view === "day" && (
        <DayView
          date={selectedDay}
          goals={goals}
          entries={entriesCache[toKey(selectedDay)] || []}
          onDeleteEntry={handleDeleteEntry}
          onLog={() => setShowLog(true)}
          stickers={stickersCache[toKey(selectedDay)] || blankStickerState()}
          onUpdateStickers={handleUpdateStickers}
        />
      )}
      {view === "trends" && (
        <TrendsView anchorDate={anchorDate} ensureLoaded={ensureLoaded} entriesCache={entriesCache} goals={goals} />
      )}

      {showLog && (
        <LogFoodPanel
          date={selectedDay}
          onClose={() => setShowLog(false)}
          onSaved={handleSaveEntries}
          stickers={stickersCache[toKey(selectedDay)] || blankStickerState()}
          onUpdateStickers={handleUpdateStickers}
        />
      )}
      {showGoals && (
        <GoalsPanel goals={goals} setGoals={setGoals} driProfile={driProfile} setDriProfile={setDriProfile} onClose={() => setShowGoals(false)} />
      )}
    </div>
  );
}
