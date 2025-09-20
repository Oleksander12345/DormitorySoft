"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Info from "@/components/ui/Info";
import Tabs from "@/components/ui/Tabs";

type Item = {
  id: number;
  name: string;
  qty: number;
  issued: string;
  returned?: string;
};

export default function StudentDetailPage() {
  const router = useRouter();

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
  const [returnOpen, setReturnOpen] = useState<null | number>(null);

  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Матрац", qty: 1, issued: "2025-09-01" },
    { id: 2, name: "Подушка", qty: 1, issued: "2025-09-01" },
    { id: 3, name: "Рушник", qty: 2, issued: "2025-09-01" },
  ]);

  // next id без перерахунку на кожне додавання
  const nextIdRef = useRef(Math.max(0, ...items.map((i) => i.id)));
  const getNextId = () => {
    nextIdRef.current += 1;
    return nextIdRef.current;
  };

  // ── handlers (стабільні) ────────────────────────────────────────────
  const toggleEdit = useCallback(() => setEdit((v) => !v), []);
  const closeIssue = useCallback(() => setIssueOpen(false), []);
  const openEvict = useCallback(() => setEvictOpen(true), []);
  const closeEvict = useCallback(() => setEvictOpen(false), []);
  const closeReturn = useCallback(() => setReturnOpen(null), []);

  const handleEditField = useCallback(
    (field: keyof typeof student) => (v: string) =>
      setStudent((s) => ({
        ...s,
        [field]: field === "course" ? Number(v) || s.course : v,
      })),
    [student]
  );

  const handleIssueSubmit = useCallback(
    ({ item, qty, date }: { item: string; qty: number; date: string }) => {
      setItems((prev) => [
        ...prev,
        { id: getNextId(), name: item, qty, issued: date },
      ]);
    },
    []
  );

  const handleConfirmEvict = useCallback(() => {
    // TODO: бек-логіка: повернути всі речі, помітити студента як виселеного
    router.push("/");
  }, [router]);

  const handleConfirmReturn = useCallback(() => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === returnOpen
          ? { ...r, returned: new Date().toISOString().slice(0, 10) }
          : r
      )
    );
    setReturnOpen(null);
  }, [returnOpen]);

  // ── render ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
        {/* Header + summary */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {student.name}
                </h1>
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-700">
                  ID {student.id}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-3 md:grid-cols-4">
                <Info
                  label="Кімната"
                  value={student.room}
                  edit={edit}
                  onChange={handleEditField("room")}
                />
                <Info
                  label="Факультет"
                  value={student.faculty}
                  edit={edit}
                  onChange={handleEditField("faculty")}
                />
                <Info
                  label="Група"
                  value={student.group}
                  edit={edit}
                  onChange={handleEditField("group")}
                />
                <Info
                  label="Курс"
                  value={String(student.course)}
                  type="number"
                  edit={edit}
                  onChange={handleEditField("course")}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={toggleEdit}
              >
                {edit ? "Зберегти зміни" : "Редагувати"}
              </button>

              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                onClick={openEvict}
              >
                Виселити
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Tabs />
        </div>
      </div>



      <ConfirmModal
        open={evictOpen}
        title="Підтвердити виселення"
        text="Виселити студента і повернути все майно на склад?"
        confirmText="Так, виселити"
        danger
        onClose={closeEvict}
        onConfirm={handleConfirmEvict}
      />

      <ConfirmModal
        open={returnOpen !== null}
        title="Повернення предмета"
        text="Повернути цей предмет на склад?"
        confirmText="Повернути"
        onClose={closeReturn}
        onConfirm={handleConfirmReturn}
      />
    </main>
  );
}
