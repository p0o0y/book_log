"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** 별점 입력 — name을 주면 hidden input으로 폼 제출 값에 포함된다 (0 = 선택 안 함) */
export function StarRatingInput({
  className,
  name,
  defaultValue = 0,
}: {
  className?: string;
  name?: string;
  defaultValue?: number;
}) {
  const [rating, setRating] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setRating((r) => Math.min(5, r + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setRating((r) => Math.max(0, r - 1));
    }
  }

  return (
    <div
      role="group"
      aria-label="별점 선택"
      onKeyDown={handleKeyDown}
      className={cn("flex items-center gap-1", className)}
    >
      {name && <input type="hidden" name={name} value={rating} />}
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}점`}
          onClick={() => setRating(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-7",
              n <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating > 0 ? `${rating}점` : "별점을 선택하세요 (선택)"}
      </span>
    </div>
  );
}
