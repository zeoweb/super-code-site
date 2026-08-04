"use client";

import { useState } from "react";

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill={filled ? "#F59E0B" : "none"}
      stroke={filled ? "#F59E0B" : "currentColor"}
      strokeWidth="1.5"
    >
      <path
        strokeLinejoin="round"
        d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.5l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76L10 2.5Z"
      />
    </svg>
  );
}

// Только отображение — используется в карточках отзывов.
export function StarRatingDisplay({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5" aria-label={`Оценка: ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= rating} className="h-4 w-4" />
      ))}
    </div>
  );
}

// Кликабельный выбор оценки — кладёт значение в скрытый input формы.
export function StarRatingInput({ name = "rating" }: { name?: string }) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setValue(i)}
            aria-label={`${i} из 5`}
            className="transition-transform duration-150 hover:scale-110"
          >
            <StarIcon filled={i <= shown} className="h-7 w-7" />
          </button>
        ))}
      </div>
    </div>
  );
}
