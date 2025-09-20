"use client";
import { useMemo, useState } from "react";

/* ---------- Типи ---------- */
type Kind = { id: number; name: string };

type HistoryRow = {
  id: number; // автоінкремент для історії
  date: string; // YYYY-MM-DD
  op: "issued" | "returned";
  kindId: number;
  kindName: string;
  qty: number;
};

type ActiveRow = {
  kindId: number;
  kindName: string;
  qty: number; // поточний залишок у студента
};

/* =================================================================== */
/*                    Головний блок із двома таблицями                 */
/* =================================================================== */
export default function StudentInventorySection({
  kinds = [
    { id: 1, name: "Матрац" },
    { id: 2, name: "Подушка" },
    { id: 3, name: "Рушник" },
    { id: 4, name: "Ковдра" },
    { id: 5, name: "Стілець" },
  ],
}: {
  kinds?: Kind[];
}) {
  const [active, setActive] = useState<ActiveRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const upsertActive = (kind: Kind, delta: number) => {
    setActive((prev) => {
      const i = prev.findIndex((r) => r.kindId === kind.id);
      if (i === -1) {
        if (delta < 0) return prev; // не можемо «повернути» те, чого нема
        return [...prev, { kindId: kind.id, kindName: kind.name, qty: delta }];
      }
      const next = [...prev];
      const newQty = Math.max(0, next[i].qty + delta);
      if (newQty === 0) next.splice(i, 1);
      else next[i] = { ...next[i], qty: newQty };
      return next;
    });
  };

  const addHistory = (op: HistoryRow["op"], kind: Kind, qty: number) => {
    setHistory((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        date: new Date().toISOString().slice(0, 10),
        op,
        kindId: kind.id,
        kindName: kind.name,
        qty,
      },
      ...prev,
    ]);
  };

  const handleIssue = (kind: Kind, qty: number) => {
    if (qty <= 0) return;
    upsertActive(kind, +qty);
    addHistory("issued", kind, qty);
  };

  const handleReturn = (kind: Kind, qty: number) => {
    if (qty <= 0) return;
    upsertActive(kind, -qty);
    addHistory("returned", kind, qty);
  };

  return (
    <section className="space-y-6">
      <ControlBar kinds={kinds} onIssue={handleIssue} onReturn={handleReturn} />
      <div className="flex flex-col justify-between lg:flex-row">
        <ActiveTable rows={active} />
        <HistoryTable rows={history} />
      </div>
    </section>
  );
}

/* =================================================================== */
/*                          ControlBar (flex)                           */
/* =================================================================== */
function ControlBar({
  kinds,
  onIssue,
  onReturn,
  onExport,
}: {
  kinds: Kind[];
  onIssue: (kind: Kind, qty: number) => void;
  onReturn: (kind: Kind, qty: number) => void;
  onExport?: () => void;
}) {
  const [kindId, setKindId] = useState<number>(kinds[0]?.id ?? 0);
  const [qty, setQty] = useState<number>(1);
  const selectedKind = useMemo(
    () => kinds.find(k => k.id === kindId) ?? kinds[0],
    [kinds, kindId]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* один рядок, усі елементи однакової висоти */}
      <div className="flex flex-wrap items-stretch gap-4">
        {/* Предмет */}
        <div className="basis-full sm:basis-[220px] md:basis-[260px]">
          <select
            value={kindId}
            onChange={(e) => setKindId(Number(e.target.value))}
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900 focus:outline-none"
          >
            {kinds.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>

        {/* Кількість */}
        <div className="basis-[170px]">
          <div className="h-11 inline-flex w-full items-stretch rounded-md border border-slate-300 bg-white">
            <button
              type="button"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="h-full px-3 text-slate-700 hover:bg-slate-100"
              aria-label="Зменшити"
            >
              −
            </button>
            <div className="h-full w-12 select-none text-center font-medium text-slate-700 flex items-center justify-center w-full">
              {qty}
            </div>
            <button
              type="button"
              onClick={() => setQty(q => q + 1)}
              className="h-full px-3 text-slate-700 hover:bg-slate-100"
              aria-label="Збільшити"
            >
              +
            </button>
          </div>
        </div>

        {/* Дія + Експорт */}
        <div className="flex-1 min-w-[260px]">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {/* Видати */}
            <label className="relative inline-flex w-full cursor-pointer select-none items-stretch sm:flex-1">
              <input
                type="checkbox"
                className="peer sr-only"
                onChange={(e) => {
                  if (e.target.checked && selectedKind) {
                    onIssue(selectedKind, qty);
                    e.target.checked = false;
                    setQty(1);
                  }
                }}
              />
              <span className="h-11 flex-1 rounded-lg border border-slate-300 bg-blue-600 px-4 text-center text-white shadow-sm transition
                               peer-hover:bg-blue-700 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                               flex items-center justify-center">
                Видати
              </span>
            </label>

            {/* Повернути */}
            <label className="relative inline-flex w-full cursor-pointer select-none items-stretch sm:flex-1">
              <input
                type="checkbox"
                className="peer sr-only"
                onChange={(e) => {
                  if (e.target.checked && selectedKind) {
                    onReturn(selectedKind, qty);
                    e.target.checked = false;
                    setQty(1);
                  }
                }}
              />
              <span className="h-11 flex-1 rounded-lg border border-slate-300 bg-rose-600 px-4 text-center text-white shadow-sm transition
                               peer-hover:bg-rose-700 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700
                               flex items-center justify-center">
                Повернути
              </span>
            </label>

            {/* Експорт в Excel */}
            <button
              type="button"
              onClick={() => (onExport ? onExport() : alert("Export to Excel (stub)"))}
              className="h-11 w-full sm:flex-1 rounded-lg border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 hover:bg-blue-50
                         flex items-center justify-center"
            >
              Експорт в Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




/* =================================================================== */
/*                           Таблиця: Активні                           */
/* =================================================================== */
/* ===== Активні ===== */
function ActiveTable({ rows }: { rows: ActiveRow[] }) {
  const maxBodyH = rows.length > 5 ? 56 * 5 + 52 : undefined; // ≈ 5 рядків + thead

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm min-w-[49%]">
      {/* вертикальний скрол тільки коли треба */}
      <div
        className="relative overflow-x-auto"
        style={maxBodyH ? { maxHeight: maxBodyH, overflowY: "auto" } : undefined}
      >
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-xs uppercase tracking-wide">
              <th className="w-[15%] text-center">ID</th>
              <th className="w-[55%]">Назва</th>
              <th className="w-[30%] text-center">Кількість</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.kindId} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-center font-medium text-slate-900">#{r.kindId}</td>
                <td className="px-4 py-3 text-slate-700 text-center">{r.kindName}</td>
                <td className="px-4 py-3 text-center text-slate-700">{r.qty}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  Немає активних предметів
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== Історія ===== */
function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  const maxBodyH = rows.length > 5 ? 56 * 5 + 52 : undefined; // ≈ 5 рядків + thead

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm min-w-[49%]">
      <div
        className="relative overflow-x-auto"
        style={maxBodyH ? { maxHeight: maxBodyH, overflowY: "auto" } : undefined}
      >
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-xs uppercase tracking-wide">
              <th className="w-[30%]">Дата</th>
              <th className="w-[20%]">Операція</th>
              <th className="w-[30%]">Предмет</th>
              <th className="w-[20%] text-center">Кількість</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700 text-center">{r.date}</td>
                <td className="px-4 py-3 text-center">
                  {r.op === "issued" ? (
                    <span className="inline-flex items-center rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-700">
                      Видано
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Повернено
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-800 text-center">{r.kindName}</td>
                <td className="px-4 py-3 text-center text-slate-700">{r.qty}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Історія порожня
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
