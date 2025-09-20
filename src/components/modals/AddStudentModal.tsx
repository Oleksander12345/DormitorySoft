"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AddStudentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    fullName: string;
    roomNumber: string;
    faculty: string;
    course: number;
    studyGroup: string;
  }) => void;
};

export default function AddStudentModal({
  open,
  onClose,
  onSubmit,
}: AddStudentModalProps) {
  const [mounted, setMounted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) firstInputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <button
        aria-hidden
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className="
          relative w-full max-w-xl
          rounded-2xl border border-white/30
          bg-white/85 shadow-2xl backdrop-blur-md
          ring-1 ring-white/20
          dark:bg-slate-900/70
        "
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 60%, rgba(225,239,254,0.80) 100%)",
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-white/30">
          <div>
            <h2 id="add-student-title" className="text-xl font-semibold text-slate-900">
              Додати студента
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Заповніть поля і натисніть «Зберегти».
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрити модальне вікно"
            className="
              -m-2 rounded-lg p-2
              text-slate-500 hover:text-slate-700
              hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400
            "
          >
            ✕
          </button>
        </div>

        <form
          className="p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload = {
              fullName: String(fd.get("fullName") || ""),
              roomNumber: String(fd.get("roomNumber") || ""),
              faculty: String(fd.get("faculty") || ""),
              course: Number(fd.get("course") || 0),
              studyGroup: String(fd.get("studyGroup") || ""),
            };
            onSubmit?.(payload);
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-800">
                ПІБ <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                ref={firstInputRef}
                type="text"
                placeholder="Іваненко Іван Іванович"
                required
                className="
                  w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2
                  text-sm text-slate-900 placeholder:text-slate-400
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
            </div>

            <div>
              <label htmlFor="roomNumber" className="mb-1 block text-sm font-medium text-slate-800">
                Кімната <span className="text-red-500">*</span>
              </label>
              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                placeholder="A-212"
                required
                className="
                  w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2
                  text-sm text-slate-900 placeholder:text-slate-400
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
            </div>

            <div>
              <label htmlFor="faculty" className="mb-1 block text-sm font-medium text-slate-800">
                Факультет <span className="text-red-500">*</span>
              </label>
              <input
                id="faculty"
                name="faculty"
                type="text"
                placeholder="ФІОТ"
                required
                className="
                  w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2
                  text-sm text-slate-900 placeholder:text-slate-400
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
            </div>

            <div>
              <label htmlFor="course" className="mb-1 block text-sm font-medium text-slate-800">
                Курс <span className="text-red-500">*</span>
              </label>
              <input
                id="course"
                name="course"
                type="number"
                min={1}
                max={6}
                placeholder="2"
                required
                className="
                  w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2
                  text-sm text-slate-900 placeholder:text-slate-400
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
            </div>

            <div>
              <label htmlFor="studyGroup" className="mb-1 block text-sm font-medium text-slate-800">
                Група <span className="text-red-500">*</span>
              </label>
              <input
                id="studyGroup"
                name="studyGroup"
                type="text"
                placeholder="КП-12"
                required
                className="
                  w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2
                  text-sm text-slate-900 placeholder:text-slate-400
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
                inline-flex items-center justify-center
                rounded-lg border border-slate-300 bg-white/90
                px-4 py-2 text-sm font-medium text-slate-700
                hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200
              "
            >
              Скасувати
            </button>

            <button
              type="submit"
              className="
                inline-flex items-center justify-center
                rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white
                shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300
              "
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : null;
}
