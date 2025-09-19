"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/* ---------------------- Modal: IssueInventory ---------------------- */
function IssueInventoryModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { item: string; qty: number; date: string }) => void;
}) {
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Видати інвентар</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Предмет
            </label>
            <input
              list="inv-items"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Напр. Матрац"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none"
            />
            <datalist id="inv-items">
              {["Матрац", "Подушка", "Рушник", "Ковдра", "Стілець"].map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-slate-500">На складі: показувати залишок підказкою</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Кількість
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Дата видачі
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Скасувати
          </button>
          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => {
              onSubmit({ item, qty, date });
              onClose();
            }}
          >
            Видати
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Confirm Modal (generic) ---------------------- */
function ConfirmModal({
  open,
  title,
  text,
  confirmText = "Підтвердити",
  onClose,
  onConfirm,
  danger = false,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mb-5 text-sm text-slate-600">{text}</p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Скасувати
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= PAGE ============================= */
export default function StudentDetailPage() {
  // demo-дані
  const [student, setStudent] = useState({
    id: 12,
    name: "Іваненко Іван Іванович",
    room: "A-212",
    faculty: "ФІОТ",
    group: "КП-12",
    course: 2,
    notes: "",
  });

  const [edit, setEdit] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [evictOpen, setEvictOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState<null | number>(null); // id рядка

  const [items, setItems] = useState<
    { id: number; name: string; qty: number; issued: string; returned?: string }[]
  >([
    { id: 1, name: "Матрац", qty: 1, issued: "2025-09-01" },
    { id: 2, name: "Подушка", qty: 1, issued: "2025-09-01" },
    { id: 3, name: "Рушник", qty: 2, issued: "2025-09-01" },
  ]);

  const active = useMemo(() => items.filter(i => !i.returned), [items]);
  const returned = useMemo(() => items.filter(i => i.returned), [items]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 lg:px-8">
        {/* breadcrumbs / back */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:underline">Студенти</Link>
          <span>›</span>
          <span className="text-slate-800">{student.name}</span>
        </div>

        {/* overview */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{student.name}</h1>
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-700">
                  ID {student.id}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-3 md:grid-cols-5">
                <Info label="Кімната" value={student.room} edit={edit} onChange={(v)=>setStudent(s=>({...s,room:v}))}/>
                <Info label="Факультет" value={student.faculty} edit={edit} onChange={(v)=>setStudent(s=>({...s,faculty:v}))}/>
                <Info label="Група" value={student.group} edit={edit} onChange={(v)=>setStudent(s=>({...s,group:v}))}/>
                <Info label="Курс" value={String(student.course)} edit={edit} onChange={(v)=>setStudent(s=>({...s,course:Number(v)||s.course}))} type="number"/>
                <Info label="Примітки" value={student.notes} edit={edit} onChange={(v)=>setStudent(s=>({...s,notes:v}))}/>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setEdit((v) => !v)}
              >
                {edit ? "Зберегти зміни" : "Редагувати"}
              </button>
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={() => setIssueOpen(true)}
              >
                Видати інвентар
              </button>
              <button
                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                onClick={() => alert("Скачати Excel (поки заглушка)")}
              >
                Експорт в Excel
              </button>
              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                onClick={() => setEvictOpen(true)}
              >
                Виселити
              </button>
            </div>
          </div>
        </div>

        {/* inventory tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Tabs
            activeLabel={`Активний (${active.length})`}
            returnedLabel={`Повернений (${returned.length})`}
            activeContent={
              <InventoryTable
                rows={active}
                onEditQty={(id, qty) =>
                  setItems(prev => prev.map(r => r.id === id ? { ...r, qty } : r))
                }
                onReturn={(id) => setReturnOpen(id)}
              />
            }
            returnedContent={
              <InventoryTable rows={returned} readonly />
            }
          />
        </div>
      </div>

      {/* модалки */}
      <IssueInventoryModal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        onSubmit={({ item, qty, date }) => {
          // TODO: запит на бекенд
          setItems(prev => [
            ...prev,
            { id: Math.max(0, ...prev.map(i=>i.id)) + 1, name: item, qty, issued: date },
          ]);
        }}
      />

      <ConfirmModal
        open={evictOpen}
        title="Підтвердити виселення"
        text="Виселити студента і повернути все майно на склад?"
        confirmText="Так, виселити"
        danger
        onClose={() => setEvictOpen(false)}
        onConfirm={() => {
          // TODO: бекенд: повернути всі речі, видалити/деактивувати студента
          window.location.href = "/"; // повернутись у список
        }}
      />

      <ConfirmModal
        open={returnOpen !== null}
        title="Повернення предмета"
        text="Повернути цей предмет на склад?"
        confirmText="Повернути"
        onClose={() => setReturnOpen(null)}
        onConfirm={() => {
          const id = returnOpen!;
          setItems(prev =>
            prev.map(r => (r.id === id ? { ...r, returned: new Date().toISOString().slice(0,10) } : r))
          );
          setReturnOpen(null);
        }}
      />
    </main>
  );
}

/* ---------- small presentational helpers ---------- */
function Info({
  label, value, edit, onChange, type="text"
}: {
  label: string;
  value: string;
  edit: boolean;
  onChange: (v: string) => void;
  type?: "text"|"number";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      {edit ? (
        <input
          type={type}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none"
        />
      ) : (
        <div className="mt-1 font-medium text-slate-900">{value || "—"}</div>
      )}
    </div>
  );
}

function Tabs({
  activeLabel, returnedLabel, activeContent, returnedContent
}: {
  activeLabel: string; returnedLabel: string;
  activeContent: React.ReactNode; returnedContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<"a"|"r">("a");
  return (
    <>
      <div className="mb-4 flex gap-2">
        <button
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab==="a" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
          onClick={() => setTab("a")}
        >
          {activeLabel}
        </button>
        <button
          className={`rounded-full px-4 py-1.5 text-sm ${
            tab==="r" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
          onClick={() => setTab("r")}
        >
          {returnedLabel}
        </button>
      </div>
      {tab==="a" ? activeContent : returnedContent}
    </>
  );
}

function InventoryTable({
  rows,
  onEditQty,
  onReturn,
  readonly = false,
}: {
  rows: { id:number; name:string; qty:number; issued:string; returned?:string }[];
  onEditQty?: (id:number, qty:number)=>void;
  onReturn?: (id:number)=>void;
  readonly?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium text-center">
            <th className="w-[35%]">Предмет</th>
            <th className="w-[10%]">Кількість</th>
            <th className="w-[20%]">Дата видачі</th>
            <th className="w-[20%]">Дата повернення</th>
            <th className="w-[15%]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((r) => (
            <tr key={r.id} className="text-center hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-900">{r.name}</td>
              <td className="px-4 py-3">
                {readonly ? (
                  r.qty
                ) : (
                  <input
                    type="number"
                    min={1}
                    defaultValue={r.qty}
                    onBlur={(e)=> onEditQty?.(r.id, Math.max(1, Number(e.target.value||r.qty)))}
                    className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{r.issued}</td>
              <td className="px-4 py-3 text-slate-700">{r.returned ?? "—"}</td>
              <td className="px-4 py-3">
                {!readonly && (
                  <div className="flex justify-center gap-2">
                    <button
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                      onClick={() => {/* qty редагується інлайн через onBlur */}}
                    >
                      Зберегти к-ть
                    </button>
                    <button
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      onClick={() => onReturn?.(r.id)}
                    >
                      Повернути
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">Немає записів</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
