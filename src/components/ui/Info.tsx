"use client";

type InfoProps = {
  label: string;
  value: string;
  edit: boolean;
  onChange: (v: string) => void;
  type?: "text" | "number";
  wide?: boolean;
  className?: string;
};

export default function Info({
  label,
  value,
  edit,
  onChange,
  type = "text",
  wide = true,
  className = "",
}: InfoProps) {
  const span = wide ? "col-span-2 md:col-span-1" : "";
  return (
    <div
      className={`w-full ${span} rounded-lg border border-slate-200 bg-slate-50/50 px-5 py-2 ${className}`}
    >
      <div className="text-[15px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>

      {edit ? (
        <input
          type={type}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none"
        />
      ) : (
        <div className="mt-1.5 text-base text-slate-900">
          {value || "—"}
        </div>
      )}
    </div>
  );
}
