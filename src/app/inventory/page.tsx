"use client";

import { useMemo, useState } from "react";

type StockItem = { id: number; name: string; total: number; issued: number };
type Snapshot = {
  id: number;
  date: string;
  sumIssued: number;
  sumAvailable: number;
  sumTotal: number;
  rows: { name: string; issued: number; available: number; total: number }[];
};

const today = () => new Date().toISOString().slice(0, 10);

const seed: StockItem[] = [
  { id: 1, name: "Матрац", total: 95, issued: 10 },
  { id: 2, name: "Подушка", total: 100, issued: 9 },
  { id: 3, name: "Ковдра", total: 100, issued: 7 },
  { id: 4, name: "Рушник", total: 180, issued: 15 },
  { id: 5, name: "Постільний комплект", total: 120, issued: 12 },
  { id: 6, name: "Стілець", total: 60, issued: 8 },
  { id: 7, name: "Стіл", total: 40, issued: 4 },
  { id: 8, name: "Настільна лампа", total: 30, issued: 3 },
  { id: 9, name: "Шафа", total: 20, issued: 2 },
  { id: 10, name: "Дзеркало", total: 10, issued: 1 },
];

function exportSnapshotToCSV(s: Snapshot) {
  const header = ["Предмет", "Видано", "Доступно", "Загалом"];
  const body = s.rows.map((r) => [r.name, r.issued, r.available, r.total].join(","));
  const sums = ["Підсумок", s.sumIssued, s.sumAvailable, s.sumTotal].join(",");
  const csv = [`Інвентаризація станом на ${s.date}`, header.join(","), ...body, sums].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_${s.date}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Підрахунок залишків</h3>
        <label className="mb-1 block text-sm font-medium text-slate-700">Дата інвентаризації</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none"
        />
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
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Підрахувати
          </button>
        </div>
      </div>
    </div>
  );
}

function SnapshotViewModal({
  open,
  snapshot,
  onClose,
  onExportClick,
}: {
  open: boolean;
  snapshot: Snapshot | null;
  onClose: () => void;
  onExportClick: () => void;
}) {
  if (!open || !snapshot) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Інвентаризація від {snapshot.date}</h3>
          <button
            onClick={onExportClick}
            className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Експорт в Excel
          </button>
        </div>

        <div className="mb-2 text-sm text-slate-600">
          Видано: <span className="font-medium text-slate-800">{snapshot.sumIssued}</span> • Доступно:{" "}
          <span className="font-medium text-slate-800">{snapshot.sumAvailable}</span> • Загалом:{" "}
          <span className="font-medium text-slate-800">{snapshot.sumTotal}</span>
        </div>

        <div className="max-h-[60vh] overflow-auto rounded-md border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-600">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium text-center">
                <th className="w-[30%]">Предмет</th>
                <th className="w-[16%] text-center">Видано</th>
                <th className="w-[17%] text-center">Доступно</th>
                <th className="w-[17%] text-center">Загалом</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {snapshot.rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900 text-center">{r.name}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{r.issued}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{r.available}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailableEditor({
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
        onClick={onSave}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
      >
        Зберегти
      </button>
    </div>
  );
}

export default function WarehousePage() {
  const [stock, setStock] = useState<StockItem[]>(seed);
  const [editingAvail, setEditingAvail] = useState<Record<number, number>>({});
  const [invOpen, setInvOpen] = useState(false);

  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [viewSnap, setViewSnap] = useState<Snapshot | null>(null);

  const sums = useMemo(() => {
    const sumIssued = stock.reduce((s, i) => s + i.issued, 0);
    const sumTotal = stock.reduce((s, i) => s + i.total, 0);
    const sumAvailable = sumTotal - sumIssued;
    return { sumIssued, sumAvailable, sumTotal };
  }, [stock]);

  const saveAvailable = (id: number) => {
    setStock((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newAvailable = editingAvail[id] ?? i.total - i.issued;
        return { ...i, total: i.issued + newAvailable };
      })
    );
    setEditingAvail(({ [id]: _omit, ...rest }) => rest);
  };

  const createSnapshot = (date: string) => {
    const rows = stock.map((i) => ({
      name: i.name,
      issued: i.issued,
      available: i.total - i.issued,
      total: i.total,
    }));
    const payload: Snapshot = {
      id: (snaps[0]?.id ?? 0) + 1,
      date,
      sumIssued: sums.sumIssued,
      sumAvailable: sums.sumAvailable,
      sumTotal: sums.sumTotal,
      rows,
    };
    setSnaps((prev) => [payload, ...prev]);
    setViewSnap(payload);
  };

  const deleteSnapshot = (id: number) => {
    if (!confirm("Видалити цей запис інвентаризації?")) return;
    setSnaps((prev) => prev.filter((s) => s.id !== id));
    if (viewSnap?.id === id) setViewSnap(null);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Склад та інвентаризація</h1>
          <button
            onClick={() => setInvOpen(true)}
            className="self-start rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Підрахувати залишки
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-base font-semibold text-slate-900">Поточний склад</h2>
              <span className="text-sm text-slate-500">Коригування змінює «Доступно»</span>
            </div>

            <div className="max-h-[65vh] overflow-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium text-center">
                    <th className="w-[40%] text-left">Предмет</th>
                    <th className="w-[15%]">Видано</th>
                    <th className="w-[15%]">Доступно</th>
                    <th className="w-[15%]">Загалом</th>
                    <th className="w-[15%]">Коригування</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stock.map((item) => {
                    const available = item.total - item.issued;
                    const currentAvail = editingAvail[item.id] ?? available;
                    const isZeroAvail = currentAvail === 0;
                    const isLowAvail = currentAvail > 0 && currentAvail <= 5;
                    return (
                      <tr
                        key={item.id}
                        className={`text-center hover:bg-slate-50 ${isZeroAvail ? "bg-rose-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-left font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-700">{item.issued}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="flex items-center justify-center gap-2">
                            <span>{available}</span>
                            {isZeroAvail && (
                              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                0
                              </span>
                            )}
                            {isLowAvail && !isZeroAvail && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                мало
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.total}</td>
                        <td className="px-4 py-3">
                          <AvailableEditor
                            value={currentAvail}
                            onChange={(v) => setEditingAvail((e) => ({ ...e, [item.id]: v }))}
                            onSave={() => saveAvailable(item.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 text-center font-medium text-slate-800">
                    <td className="px-4 py-3 text-right">Підсумок:</td>
                    <td className="px-4 py-3">{sums.sumIssued}</td>
                    <td className="px-4 py-3">{sums.sumAvailable}</td>
                    <td className="px-4 py-3">{sums.sumTotal}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-base font-semibold text-slate-900">Історія інвентаризацій</h2>
              <span className="text-sm text-slate-500">ID / Дата / Дії</span>
            </div>

            <div className="max-h-[65vh] overflow-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium">
                    <th className="w-[20%] text-center">ID</th>
                    <th className="w-[40%]">Дата</th>
                    <th className="w-[40%] text-center">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {snaps.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-medium text-slate-900">#{s.id}</td>
                      <td className="px-4 py-3 text-slate-800">{s.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="rounded-lg text-white border border-slate-300 bg-blue-600 px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-700">
                            Переглянути
                          </button>
                          <button
                            onClick={() => deleteSnapshot(s.id)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          >
                            Видалити
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {snaps.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                        Записів ще немає. Створіть перший через «Підрахувати залишки».
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <InventoryModal open={invOpen} onClose={() => setInvOpen(false)} onConfirm={(date) => createSnapshot(date)} />
      <SnapshotViewModal
        open={!!viewSnap}
        snapshot={viewSnap}
        onClose={() => setViewSnap(null)}
        onExportClick={() => viewSnap && exportSnapshotToCSV(viewSnap)}
      />
    </main>
  );
}
