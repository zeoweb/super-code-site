"use client";

import { useState } from "react";
import { StarRatingDisplay } from "@/components/StarRating";
import { Avatar } from "@/components/Avatar";

const INITIAL_COUNT = 3;

type ReviewItem = { id: string; name: string; text: string; rating: number | null };

// По умолчанию показываем только последние 3 отзыва — с ростом их числа
// (или если у одного человека их несколько) полный список стал бы слишком
// длинным. "Показать больше" разворачивает оставшиеся без перезагрузки.
export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT);
  const hiddenCount = reviews.length - INITIAL_COUNT;

  return (
    <div className="mt-4 space-y-3">
      {visible.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-center gap-3">
            <Avatar name={r.name} size="h-9 w-9" textSize="text-sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{r.name}</div>
              <StarRatingDisplay rating={r.rating} />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{r.text}</p>
        </div>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-brand-light hover:underline"
        >
          Показать больше ({hiddenCount})
        </button>
      )}
    </div>
  );
}
