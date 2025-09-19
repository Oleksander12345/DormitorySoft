"use client";

import { useMemo, useState } from "react";

/* ───────────────────── Helpers ───────────────────── */
type StockItem = { id: number; name: string; qty: number };
type Snapshot = {
  id: number;
  date: string;            // YYYY-MM-DD
  total: number;           // сумарно
  rows: { name: string; qty: number }[];
};

const today = () => new Date().toISOString().slice(0, 10);

const seed: StockItem[] = [
  { id: 1, name: "Матрац", qty: 95 },
  { id: 2, name: "Подушка", qty: 100 },
  { id: 3, name: "Ковдра", qty: 100 },
  { id: 4, name: "Рушник", qty: 180 },
  { id: 5, name: "Постільний комплект", qty: 120 },
  { id: 6, name: "Стілець", qty: 60 },
  { id: 7, name: "Стіл", qty: 40 },
  { id: 8, name: "Настільна лампа", qty: 30 },
  { id: 9, name: "Шафа", qty: 20 },
  { id:10, name: "Дзеркало", qty: 10 },
];

/** Простий експорт у CSV (без бібліотек) */
function exportSnapshotToCSV(s: Snapshot) {
  const header = ["Предмет", "Кількість"];
  const rows = s.rows.map(r => [r.name, String(r.qty)]);
  const totalRow = ["Усього", String(s.total)];
  const csv = [
    [`Інвентаризація станом на ${s.date}`].join(","),
    header.join(","),
    ...rows.map(r => r.join(",")),
    totalRow.join(","),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }); // \uFEFF для Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_${s.date}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ───────────────── Modal: інвентаризація ───────────────── */
function InventoryModal({
  open,
  onClose,
  onConfirm,
  defaultDate = today(),
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  defaultDate?: string;
}) {
  const [date, setDate] = useState(defaultDate);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/85 p-5 shadow-2xl backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Підрахунок залишків</h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Дата інвентаризації
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-slate-500">За замовчуванням — сьогодні.</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Скасувати
          </button>
          <button
            onClick={() => {
              onConfirm(date);
              onClose();
            }}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-sm"
          >
            Підрахувати
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Row editor ───────────────── */
function QtyCell({
  value,
  onChange,
  onSave,
}: {
  value: number;
  onChange: (v: number) => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-8 w-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        aria-label="Зменшити"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value || 0)))}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm text-slate-900 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        aria-label="Збільшити"
      >
        +
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-emerald-700"
      >
        Зберегти
      </button>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function WarehousePage() {
  const [stock, setStock] = useState<StockItem[]>(seed);
  const [editing, setEditing] = useState<{ [id: number]: number }>({});
  const [invOpen, setInvOpen] = useState(false);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [selectedSnapId, setSelectedSnapId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const totalNow = useMemo(() => stock.reduce((s, i) => s + i.qty, 0), [stock]);
  const selectedSnap = snaps.find((s) => s.id === selectedSnapId) || null;

  const saveQty = (id: number) => {
    setStock((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: editing[id] ?? i.qty } : i))
    );
    setEditing((e) => {
      const { [id]: _, ...rest } = e;
      return rest;
    });
  };

  const doRefresh = async () => {
    setLoading(true);
    // TODO: замінити на реальне оновлення з бекенду
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
  };

  const createSnapshot = (date: string) => {
    const payload: Snapshot = {
      id: (snaps[0]?.id ?? 0) + 1,
      date,
      total: totalNow,
      rows: stock.map(({ name, qty }) => ({ name, qty })),
    };
    setSnaps((prev) => [payload, ...prev]);
    setSelectedSnapId(payload.id);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Заголовок + дії */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Склад та інвентаризація
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInvOpen(true)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-sm"
            >
              Підрахувати залишки
            </button>
            <button
              onClick={doRefresh}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              {loading ? "Оновлення…" : "Оновити"}
            </button>
          </div>
        </div>

        {/* Карточки-метрики */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="Всього одиниць на складі" value={totalNow} />
          <MetricCard
            label="Нульових позицій"
            value={stock.filter((i) => i.qty === 0).length}
          />
          <MetricCard
            label="Остання інвентаризація"
            value={
              snaps.length
                ? `${snaps[0].date} • ${snaps[0].total} од.`
                : "—"
            }
          />
        </div>

        {/* Поточний склад */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="text-base font-semibold text-slate-900">Поточний склад</h2>
            <span className="text-sm text-slate-500">
              Автооновлення після видач/повернень
            </span>
          </div>

          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium text-center">
                  <th className="w-[50%] text-left">Предмет</th>
                  <th className="w-[15%]">Кількість</th>
                  <th className="w-[35%]">Коригування</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stock.map((item) => {
                  const current = editing[item.id] ?? item.qty;
                  const isZero = current === 0;
                  const isLow = current > 0 && current <= 5;
                  return (
                    <tr
                      key={item.id}
                      className={`text-center hover:bg-slate-50 ${
                        isZero ? "bg-rose-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-left font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {isZero && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              0 на складі
                            </span>
                          )}
                          {isLow && !isZero && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              мало
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.qty}</td>
                      <td className="px-4 py-3">
                        <QtyCell
                          value={current}
                          onChange={(v) =>
                            setEditing((e) => ({ ...e, [item.id]: v }))
                          }
                          onSave={() => saveQty(item.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 p-3 text-right text-xs text-slate-500">
            Порада: зменшення/збільшення тут = коригування складу (надходження/списання).
          </div>
        </div>

        {/* Інвентаризації / історія */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Результати інвентаризації</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSnapId ?? ""}
                onChange={(e) =>
                  setSelectedSnapId(e.target.value ? Number(e.target.value) : null)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">— Оберіть запис —</option>
                {snaps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} • {s.total} од.
                  </option>
                ))}
              </select>
              <button
                disabled={!selectedSnap}
                onClick={() => selectedSnap && exportSnapshotToCSV(selectedSnap)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 enabled:hover:-translate-y-[1px] enabled:hover:bg-blue-700 enabled:hover:shadow-sm disabled:opacity-50"
              >
                Експорт в Excel (CSV)
              </button>
            </div>
          </div>

          {selectedSnap ? (
            <div className="max-h-[50vh] overflow-auto">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="text-sm text-slate-600">
                  Дата: <span className="font-medium text-slate-800">{selectedSnap.date}</span>
                </div>
                <div className="text-sm text-slate-600">
                  Усього: <span className="font-medium text-slate-800">{selectedSnap.total}</span>
                </div>
              </div>
              <table className="mt-3 w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium">
                    <th className="w-[65%]">Предмет</th>
                    <th className="w-[35%] text-center">Кількість (на дату)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedSnap.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{r.name}</td>
                      <td className="px-4 py-3 text-center text-slate-700">{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              Поки що немає вибраного запису. Створи нову інвентаризацію або обери зі списку.
            </div>
          )}
        </div>
      </div>

      {/* модалка інвентаризації */}
      <InventoryModal
        open={invOpen}
        onClose={() => setInvOpen(false)}
        onConfirm={(date) => createSnapshot(date)}
      />
    </main>
  );
}

/* ───────── small component ───────── */
function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
