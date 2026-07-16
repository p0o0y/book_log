"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** 별점 입력 (클라이언트 컴포넌트, UI만 — 값 저장 없음) */
export function StarRatingInput({ className }: { className?: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
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
