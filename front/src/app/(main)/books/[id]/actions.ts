"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteBook, getBook, updateBook } from "@/lib/store";
import { STATUS_LABEL, type Book, type BookStatus } from "@/lib/types";

export type ProgressFormState = {
  error: string | null;
  /** 성공 시 토스트 메시지 */
  message?: string;
};

export type BookActionState = {
  message: string | null;
};

const STATUSES: readonly BookStatus[] = ["reading", "finished", "wishlist"];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function revalidateBook(bookId: string) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/books/${bookId}`);
}

/** 상태 전이 시 날짜 자동 기록 규칙을 적용한 패치를 만든다 */
function statusPatch(book: Book, status: BookStatus): Partial<Book> {
  if (status === "reading") {
    return { status, startDate: book.startDate ?? today(), finishDate: undefined };
  }
  if (status === "finished") {
    return { status, finishDate: book.finishDate ?? today() };
  }
  return { status, startDate: undefined, finishDate: undefined, currentPage: undefined };
}

export async function changeBookStatus(
  _prevState: BookActionState,
  formData: FormData
): Promise<BookActionState> {
  const bookId = formData.get("bookId");
  const status = formData.get("status");
  if (typeof bookId !== "string" || !STATUSES.includes(status as BookStatus)) {
    return { message: null };
  }
  const book = await getBook(bookId);
  if (!book) return { message: null };

  await updateBook(bookId, statusPatch(book, status as BookStatus));
  revalidateBook(bookId);
  return {
    message: `'${book.title}'을(를) ${STATUS_LABEL[status as BookStatus]} 상태로 변경했어요.`,
  };
}

/** 찜 토글 — 읽기 상태와 독립적으로 플래그만 바꾼다 (기록 보존) */
export async function toggleWishlist(
  _prevState: BookActionState,
  formData: FormData
): Promise<BookActionState> {
  const bookId = formData.get("bookId");
  if (typeof bookId !== "string") return { message: null };

  const book = await getBook(bookId);
  if (!book) return { message: null };

  await updateBook(bookId, { isWishlisted: !book.isWishlisted });
  revalidateBook(bookId);
  return {
    message: book.isWishlisted
      ? `'${book.title}' 찜을 해제했어요.`
      : `'${book.title}'을(를) 찜했어요.`,
  };
}

export async function updateProgress(
  _prevState: ProgressFormState,
  formData: FormData
): Promise<ProgressFormState> {
  const bookId = formData.get("bookId");
  if (typeof bookId !== "string") return { error: "잘못된 요청이에요." };

  const book = await getBook(bookId);
  if (!book) return { error: "존재하지 않는 책이에요." };

  const raw = formData.get("currentPage");
  const currentPage = typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isInteger(currentPage) || currentPage < 0) {
    return { error: "현재 페이지는 0 이상의 숫자여야 해요." };
  }
  if (book.totalPages && currentPage > book.totalPages) {
    return { error: `총 페이지 수(${book.totalPages}쪽)를 넘을 수 없어요.` };
  }

  // 마지막 페이지 도달 시 자동 완독 처리
  const finished = book.totalPages !== undefined && currentPage === book.totalPages;
  await updateBook(bookId, {
    currentPage,
    ...(finished ? statusPatch(book, "finished") : {}),
  });

  revalidateBook(bookId);
  return {
    error: null,
    message: finished
      ? "마지막 페이지까지 읽어 완독 처리했어요!"
      : "진행률을 저장했어요.",
  };
}

/**
 * 책 삭제 후 서재로 이동.
 * 삭제하면 현재 상세 라우트가 404가 되어 클라이언트 컴포넌트가 언마운트되므로,
 * 상태 반환 방식 대신 서버 redirect를 사용한다 (토스트는 제출 시점에 클라이언트가 표시).
 */
export async function deleteBookAction(formData: FormData): Promise<void> {
  const bookId = formData.get("bookId");
  if (typeof bookId !== "string") return;

  const deleted = await deleteBook(bookId);
  if (!deleted) return;

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/");
}
