import React from 'react';

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-sky-400"> *</span>}
      </label>
      {children}
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputClass} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${inputClass} appearance-none pr-9`} />
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function CheckboxGroup({
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
  columns?: 1 | 2 | 3;
}) {
  const colClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <div className={`grid ${colClass} gap-2`}>
      {options.map((opt) => {
        const isSel = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
              isSel
                ? 'bg-sky-500/15 border-sky-500/40 text-white'
                : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
              isSel ? 'bg-sky-500 border-sky-500' : 'border-slate-600'
            }`}>
              {isSel && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm transition-all ${
            value === opt.value
              ? 'bg-sky-500/15 border-sky-500/40 text-white'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
        checked ? 'bg-sky-500 border-sky-500' : 'border-slate-600 group-hover:border-slate-500'
      }`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-300">{label}</span>
    </button>
  );
}
