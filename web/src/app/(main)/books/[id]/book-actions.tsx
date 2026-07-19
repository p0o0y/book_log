"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Pencil,
  RotateCcw,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";
import { toast } from "@/components/toaster";
import type { BookStatus } from "@/lib/types";
import {
  changeBookStatus,
  deleteBookAction,
  toggleWishlist,
  type BookActionState,
} from "./actions";

const initialState: BookActionState = { message: null };

/** 책 상세의 상태 전이 · 찜 토글 · 수정 · 삭제 버튼 묶음 */
export function BookActions({
  bookId,
  status,
  isWishlisted,
}: {
  bookId: string;
  status: BookStatus;
  isWishlisted: boolean;
}) {
  const [statusState, statusAction] = useActionState(
    changeBookStatus,
    initialState
  );
  const [wishlistState, wishlistAction] = useActionState(
    toggleWishlist,
    initialState
  );

  useEffect(() => {
    if (statusState.message) toast(statusState.message);
  }, [statusState]);

  useEffect(() => {
    if (wishlistState.message) toast(wishlistState.message);
  }, [wishlistState]);

  const nextStatus =
    status === "wishlist"
      ? { to: "reading" as const, label: "읽기 시작", icon: BookOpen }
      : status === "reading"
        ? { to: "finished" as const, label: "완독 처리", icon: CheckCircle2 }
        : { to: "reading" as const, label: "다시 읽기", icon: RotateCcw };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={statusAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="status" value={nextStatus.to} />
        <PendingButton variant="secondary">
          <nextStatus.icon className="size-4" />
          {nextStatus.label}
        </PendingButton>
      </form>
      {/* 찜은 읽기 상태와 독립적인 플래그 — 토글해도 책과 기록은 유지된다 */}
      <form action={wishlistAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <PendingButton variant="outline">
          {isWishlisted ? (
            <>
              <StarOff className="size-4" />
              찜 해제
            </>
          ) : (
            <>
              <Star className="size-4" />
              찜하기
            </>
          )}
        </PendingButton>
      </form>
      <Button variant="outline" asChild>
        <Link href={`/books/${bookId}/edit`}>
          <Pencil className="size-4" />
          정보 수정
        </Link>
      </Button>
      <form
        action={deleteBookAction}
        onSubmit={(e) => {
          if (!confirm("이 책과 관련 독후감을 모두 삭제할까요?")) {
            e.preventDefault();
            return;
          }
          toast("책을 삭제했어요.");
        }}
      >
        <input type="hidden" name="bookId" value={bookId} />
        <PendingButton variant="outline" className="text-destructive">
          <Trash2 className="size-4" />
          삭제
        </PendingButton>
      </form>
    </div>
  );
}
