"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Heart,
  HeartOff,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";
import { toast } from "@/components/toaster";
import type { BookStatus } from "@/lib/types";
import {
  changeBookStatus,
  deleteBookAction,
  type BookActionState,
} from "./actions";

const initialState: BookActionState = { message: null };

/** 책 상세의 상태 전이 · 찜 토글 · 수정 · 삭제 버튼 묶음 */
export function BookActions({
  bookId,
  status,
}: {
  bookId: string;
  status: BookStatus;
}) {
  const [statusState, statusAction] = useActionState(
    changeBookStatus,
    initialState
  );

  useEffect(() => {
    if (statusState.message) toast(statusState.message);
  }, [statusState]);

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
      {status === "wishlist" ? (
        // 찜 해제 = 서재에서 제거 (삭제 후 서버 redirect로 서재 이동)
        <form
          action={deleteBookAction}
          onSubmit={(e) => {
            if (!confirm("찜을 해제할까요? 이 책이 서재에서 제거돼요.")) {
              e.preventDefault();
              return;
            }
            toast("찜을 해제했어요.");
          }}
        >
          <input type="hidden" name="bookId" value={bookId} />
          <PendingButton variant="outline">
            <HeartOff className="size-4" />
            찜 해제
          </PendingButton>
        </form>
      ) : (
        <form action={statusAction}>
          <input type="hidden" name="bookId" value={bookId} />
          <input type="hidden" name="status" value="wishlist" />
          <PendingButton variant="outline">
            <Heart className="size-4" />
            찜하기
          </PendingButton>
        </form>
      )}
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
