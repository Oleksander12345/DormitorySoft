"use client";

export default function ConfirmModal({
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
