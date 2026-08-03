"use client";

export type SearchValue = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ search, placeholder = "Найти игру" }: { search: SearchValue; placeholder?: string }) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
        placeholder={placeholder}
        className="input py-2 pl-9 text-sm"
      />
    </div>
  );
}
