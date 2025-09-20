"use client";

import {useCallback, useMemo, useState} from "react";

type Kind = { id: number; name: string };

type ActiveRow = {
  kindId: number;
  kindName: string;
  qty: number;
};

type HistoryRow = {
  id: number;             
  date: string;         
  op: "issued" | "returned";
  kindId: number;
  kindName: string;
  qty: number;
};


export default function InventoryTables({
  kinds = [
    { id: 1, name: "Матрац" },
    { id: 2, name: "Подушка" },
    { id: 3, name: "Рушник" },
    { id: 4, name: "Ковдра" },
    { id: 5, name: "Стілець" },
  ],
  initialActive = [],
  initialHistory = [],
  onExport,
}: {
  kinds?: Kind[];
  initialActive?: ActiveRow[];
  initialHistory?: HistoryRow[];
  onExport?: () => void;
}) {
  const [active, setActive] = useState<ActiveRow[]>(initialActive);
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory);
  const nextHistoryId = useMemo(
    () => (history.length ? Math.max(...history.map(h => h.id)) + 1 : 1),
    [history]
  );

  const upsertActive = useCallback((kind: Kind, delta: number) => {
    setActive(prev => {
      const i = prev.findIndex(r => r.kindId === kind.id);
      if (i === -1) {
        if (delta <= 0) return prev;
        return [...prev, { kindId: kind.id, kindName: kind.name, qty: delta }];
      }
      const next = [...prev];
      const newQty = Math.max(0, next[i].qty + delta);
      if (newQty === 0) next.splice(i, 1);
      else next[i] = { ...next[i], qty: newQty };
      return next;
    });
  }, []);

  const pushHistory = useCallback((op: HistoryRow["op"], kind: Kind, qty: number) => {
    const row: HistoryRow = {
      id: nextHistoryId,
      date: new Date().toISOString().slice(0, 10),
      op,
      kindId: kind.id,
      kindName: kind.name,
      qty,
    };
    setHistory(prev => [row, ...prev]);
  }, [nextHistoryId]);

  const handleIssue = useCallback((kind: Kind, qty: number) => {
    if (qty <= 0) return;
    upsertActive(kind, +qty);
    pushHistory("issued", kind, qty);
  }, [pushHistory, upsertActive]);

  const handleReturn = useCallback((kind: Kind, qty: number) => {
    if (qty <= 0) return;
    upsertActive(kind, -qty);
    pushHistory("returned", kind, qty);
  }, [pushHistory, upsertActive]);

  return (
    <section className="space-y-4">
      <ControlBar kinds={kinds} onIssue={handleIssue} onReturn={handleReturn} onExport={onExport} />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <ActiveTable rows={active} />
        </div>
        <div className="flex-1 min-w-0">
          <HistoryTable rows={history} />
        </div>
      </div>
    </section>
  );
}

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
      <div className="flex flex-wrap items-end gap-4">
        <div className="basis-full sm:basis-[240px] md:basis-[280px]">
          <div className="mb-1 text-xs font-medium text-slate-600">Предмет</div>
          <select
            value={kindId}
            onChange={(e) => setKindId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none"
          >
            {kinds.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>

        <div className="basis-[160px]">
          <div className="mb-1 text-xs font-medium text-slate-600">Кількість</div>
          <div className="inline-flex w-full items-center justify-between rounded-md border border-slate-300 bg-white">
            <button
              type="button"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-3 py-2 text-slate-700 hover:bg-slate-100"
              aria-label="Зменшити"
            >−</button>
            <div className="w-10 select-none text-center font-medium text-slate-700">{qty}</div>
            <button
              type="button"
              onClick={() => setQty(q => q + 1)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-100"
              aria-label="Збільшити"
            >+</button>
          </div>
        </div>

        <div className="flex-1 min-w-[260px]">
          <div className="mb-1 text-xs font-medium text-slate-600">Дія</div>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => selectedKind && onIssue(selectedKind, qty)}
              className="w-full sm:flex-1 rounded-lg border border-slate-300 bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
            >
              Видати
            </button>
            <button
              type="button"
              onClick={() => selectedKind && onReturn(selectedKind, qty)}
              className="w-full sm:flex-1 rounded-lg border border-slate-300 bg-rose-600 px-4 py-2 text-white shadow-sm transition hover:bg-rose-700"
            >
              Повернути
            </button>
            <button
              type="button"
              onClick={() => (onExport ? onExport() : alert("Export to Excel (stub)"))}
              className="w-full sm:flex-1 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Експорт в Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveTable({ rows }: { rows: ActiveRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr className="[&>th]:px-4 [&>th]:py-3 text-xs uppercase tracking-wide">
            <th className="w-[15%] text-center">ID</th>
            <th className="w-[55%]">Назва</th>
            <th className="w-[30%] text-center">Кількість</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map(r => (
            <tr key={r.kindId} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-center font-medium text-slate-900">#{r.kindId}</td>
              <td className="px-4 py-3 text-slate-700">{r.kindName}</td>
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
  );
}

function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr className="[&>th]:px-4 [&>th]:py-3 text-xs uppercase tracking-wide">
            <th className="w-[22%]">Дата</th>
            <th className="w-[22%]">Операція</th>
            <th className="w-[36%]">Предмет</th>
            <th className="w-[20%] text-center">Кількість</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-700">{r.date}</td>
              <td className="px-4 py-3">
                {r.op === "issued" ? (
                  <span className="inline-flex items-center rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-700">Видано</span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700">Повернено</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-800">{r.kindName}</td>
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
  );
}
