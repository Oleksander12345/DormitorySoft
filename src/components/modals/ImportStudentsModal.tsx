"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ImportStudentsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ImportStudentsModal({ open, onClose }: ImportStudentsModalProps) {
  const [mounted, setMounted] = useState(false);       // SSR guard
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // SSR guard for portal
  useEffect(() => setMounted(true), []);

  // Закрити по Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Блокування скролу фону
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Очистити стан при закритті
  useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  if (!open) return null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const onUpload = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Selected file:", file);
    // onClose(); // за бажанням закривай після успіху
  };

  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      {/* Бекдроп */}
      <button
        aria-hidden
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Card (glass) */}
      <div
        className="
          relative w-full max-w-xl
          rounded-2xl border border-white/30
          bg-white/85 shadow-2xl backdrop-blur-md
          ring-1 ring-white/20 dark:bg-slate-900/70
        "
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 60%, rgba(225,239,254,0.80) 100%)",
        }}
        onClick={(e) => e.stopPropagation()} // не закривати при кліку всередині
      >
        {/* Хедер */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-white/30">
          <h2 id="import-title" className="text-xl font-semibold text-slate-900">
            Імпорт студентів
          </h2>
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

        {/* Тіло */}
        <form onSubmit={onUpload} className="p-5">
          {/* Dropzone / file picker */}
          <label
            htmlFor="student-file"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="
              flex cursor-pointer flex-col items-center justify-center
              rounded-xl border-2 border-dashed border-slate-300 bg-white/70
              px-4 py-10 text-center transition
              hover:bg-white/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-300
            "
          >
            <input
              id="student-file"
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileChange}
              className="sr-only"
            />
            <div className="space-y-2">
              <div className="text-5xl">📄</div>
              <p className="text-sm text-slate-700">
                Перетягніть файл сюди або <span className="font-semibold text-blue-700 underline underline-offset-2">натисніть</span> щоб обрати
              </p>
              <p className="text-xs text-slate-500">Підтримуються: .csv, .xlsx, .xls</p>
            </div>
          </label>

          {/* Обраний файл */}
          {file && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white/90 p-3">
              <p className="text-sm text-slate-800">
                <span className="font-medium">Файл:</span> {file.name} <span className="text-slate-500">({prettySize(file.size)})</span>
              </p>
            </div>
          )}

          {/* Дії */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="
                inline-flex items-center justify-center
                rounded-lg border border-slate-300 bg-white/90
                px-4 py-2 text-sm font-medium text-slate-700
                hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200
              "
            >
              Змінити файл
            </button>

            <button
              type="submit"
              disabled={!file}
              className={`
                inline-flex items-center justify-center rounded-lg px-4 py-2
                text-sm font-semibold shadow-sm focus:outline-none focus:ring-2
                ${file
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300"
                  : "bg-slate-300 text-slate-600 cursor-not-allowed"
                }
              `}
            >
              Завантажити студентів
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Рендер через портал — поверх усього DOM
  return mounted ? createPortal(content, document.body) : null;
}
