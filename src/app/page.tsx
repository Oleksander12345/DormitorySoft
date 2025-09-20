"use client";

import AddStudentModal from "@/components/modals/AddStudentModal";
import ImportStudentsModal from "@/components/modals/ImportStudentsModal";
import * as React from "react";
import { useMemo, useState } from "react";
import { useCombobox } from "downshift";

function ComboBox({
  label,
  items,
  placeholder = "Почніть вводити або оберіть…",
  className = "w-56", 
  inputProps,
  value,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder?: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const [filtered, setFiltered] = useState<string[]>(items);

  const {
    isOpen,
    getLabelProps,
    getInputProps,
    getMenuProps,
    getItemProps,
    getToggleButtonProps,
    highlightedIndex,
    selectedItem,
  } = useCombobox<string>({
    items: filtered,
    initialSelectedItem: value ?? undefined,
    itemToString: (item) => item ?? "",
    onInputValueChange({ inputValue }) {
      const q = (inputValue ?? "").toLowerCase().trim();
      setFiltered(q ? items.filter((i) => i.toLowerCase().includes(q)) : items);
    },
    onSelectedItemChange({ selectedItem }) {
      onChange?.(selectedItem ?? "");
    },
  });

  return (
    <div className="relative flex flex-none items-center gap-2">
      <label
        className="shrink-0 text-sm font-medium text-slate-700"
        {...getLabelProps()}
      >
        {label}
      </label>

      <div className={`relative ${className}`}>
        <div className="flex rounded-lg border border-slate-300 bg-white">
          <input
            {...getInputProps({ placeholder, ...inputProps })}
            className="h-9 w-full rounded-l-lg bg-white px-3 text-sm text-black placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Відкрити список"
            {...getToggleButtonProps()}
            className="h-9 rounded-r-lg px-2 text-slate-600 hover:bg-slate-100"
          >
            ▾
          </button>
        </div>

        <ul
          {...getMenuProps()}
          className={`absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white text-black shadow-lg ${
            !(isOpen && filtered.length) ? "hidden" : ""
          }`}
        >
          {isOpen &&
            filtered.map((item, index) => (
              <li
                key={`${item}-${index}`}
                {...getItemProps({ item, index })}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  highlightedIndex === index ? "bg-blue-50" : "bg-white"
                } ${selectedItem === item ? "font-medium" : ""}`}
              >
                {item}
              </li>
            ))}
          {isOpen && filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">
              Нічого не знайдено
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function DormResidentsPage() {
  const [isAddOpen, setAddOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);

  const residents = [
    {
      id: 1,
      name: "Іваненко Іван Іванович",
      room: "101",
      faculty: "ФІОТ",
      course: 3,
      group: "ІН-31",
    },
    {
      id: 2,
      name: "Петров Петро Петрович",
      room: "102",
      faculty: "ІПСА",
      course: 2,
      group: "ЕК-22",
    },
    {
      id: 3,
      name: "Сидоренко Ольга Миколаївна",
      room: "103",
      faculty: "ФММ",
      course: 1,
      group: "IC-12",
    },
    {
      id: 4,
      name: "Коваль Андрій Сергійович",
      room: "104",
      faculty: "ФІОТ",
      course: 4,
      group: "ФФ-21",
    },
    {
      id: 5,
      name: "Мороз Оксана Володимирівна",
      room: "105",
      faculty: "ФІОТ",
      course: 4,
      group: "ФЛ-11",
    },
    {
      id: 6,
      name: "Приклад Студент",
      room: "105",
      faculty: "ФІОТ",
      course: 3,
      group: "ФЛ-11",
    },
    {
      id: 7,
      name: "Приклад Студент",
      room: "105",
      faculty: "ФІОТ",
      course: 3,
      group: "ФЛ-11",
    },
  ];

  const nameOptions = useMemo(
    () => Array.from(new Set(residents.map((r) => r.name))),
    [residents]
  );
  const roomOptions = useMemo(
    () =>
      Array.from(new Set(residents.map((r) => r.room))).concat([
        "201",
        "202",
        "203",
        "301",
        "302",
      ]),
    [residents]
  );
  const facultyOptions = ["ФІОТ", "ІПСА", "ФММ", "ФТІ", "ФПМ", "ФЕЛ", "ФБМІ"];
  const courseOptions = ["1", "2", "3", "4", "5", "6"];
  const groupOptions = useMemo(
    () =>
      Array.from(new Set(residents.map((r) => r.group))).concat([
        "ІН-31",
        "ЕК-22",
        "IC-12",
        "ФФ-21",
        "ФЛ-11",
      ]),
    [residents]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Список мешканців гуртожитку №8
          </h1>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <div className="w-full overflow-x-auto">
            <div className="inline-flex flex-nowrap items-center gap-4 whitespace-nowrap">
              <ComboBox
                label="Пошук за прізвищем"
                items={nameOptions}
                placeholder="Введіть ПІБ"
                className="w-[20rem] sm:w-80"
              />
              <ComboBox
                label="Кімната"
                items={roomOptions}
                placeholder="Напр. 101"
                className="w-36"
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
              />
              <ComboBox
                label="Факультет"
                items={facultyOptions}
                placeholder="ФІОТ, ІПСА…"
                className="w-44"
              />
              <ComboBox
                label="Курс"
                items={courseOptions}
                placeholder="1–6"
                className="w-24"
                inputProps={{ inputMode: "numeric", pattern: "[1-6]" }}
              />
              <ComboBox
                label="Група"
                items={groupOptions}
                placeholder="Напр. ІН-31"
                className="w-40"
              />
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2">
            <button
              onClick={() => setAddOpen(true)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Додати студента
            </button>
            <button
              onClick={() => setImportOpen(true)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Імпортувати студентів (Excel)
            </button>
          </div>
        </div>

        <AddStudentModal
          open={isAddOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={(data) => {
            console.log("FORM DATA:", data);
            setAddOpen(false);
          }}
        />

        <ImportStudentsModal
          open={isImportOpen}
          onClose={() => setImportOpen(false)}
        />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full table-fixed border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium text-center">
                  <th className="w-[6%]">ID</th>
                  <th className="w-[35%]">ПІБ</th>
                  <th className="w-[15%]">Номер Кімнати</th>
                  <th className="w-[14%]">Факультет</th>
                  <th className="w-[10%]">Курс</th>
                  <th className="w-[10%]">Група</th>
                  <th className="w-[10%] text-center">Інвентар Студента</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {residents.map((r) => (
                  <tr key={r.id} className="text-center hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{r.id}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.room}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="max-w-full truncate" title={r.faculty}>
                        {r.faculty}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.course}</td>
                    <td className="px-4 py-3 text-slate-700">{r.group}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Переглянути
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-slate-200 p-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              aria-label="Попередня сторінка"
            >
              ‹
            </button>
            {["1", "2", "3", "4"].map((n, i) => (
              <button
                key={n}
                type="button"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                  i === 0
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              aria-label="Наступна сторінка"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
