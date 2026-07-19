"use server";

import { revalidatePath } from "next/cache";
import { searchAladinBooks, lookupAladinPages, type AladinBook } from "@/lib/aladin";
import { extractCoverColors } from "@/lib/cover-color";
import { assignSpineColors } from "@/lib/spine-palette";
import { addBook, updateBook } from "@/lib/store";
import type { BookStatus } from "@/lib/types";

export type BookSearchResult =
  | { error: string; items?: undefined }
  | { error?: undefined; items: AladinBook[] };

/** 알라딘 책 검색 (검색 탭에서 사용) */
export async function searchBooksAction(query: string): Promise<BookSearchResult> {
  const trimmed = query.trim();
  if (trimmed === "") return { items: [] };
  try {
    return { items: await searchAladinBooks(trimmed) };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "검색 중 오류가 발생했어요.",
    };
  }
}

/** 검색 결과 선택 시 쪽수를 추가 조회한다. 실패해도 쪽수 없이 진행. */
export async function lookupPagesAction(
  isbn13: string
): Promise<number | undefined> {
  try {
    return await lookupAladinPages(isbn13);
  } catch {
    return undefined;
  }
}

export type BookFormState = {
  error: string | null;
  /** 성공 시 토스트 메시지 */
  message?: string;
  /** 성공 시 클라이언트가 이동할 경로 */
  redirectTo?: string;
};

const STATUSES: readonly BookStatus[] = ["reading", "finished", "wishlist"];

function optionalText(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** bookId(hidden) 유무에 따라 신규 등록/정보 수정을 처리하는 공용 액션 */
export async function saveBook(
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const title = formData.get("title");
  const author = formData.get("author");

  if (typeof title !== "string" || title.trim() === "") {
    return { error: "제목을 입력해주세요." };
  }
  if (typeof author !== "string" || author.trim() === "") {
    return { error: "저자를 입력해주세요." };
  }

  const statusRaw = formData.get("status");
  const status: BookStatus = STATUSES.includes(statusRaw as BookStatus)
    ? (statusRaw as BookStatus)
    : "reading";

  const totalPagesRaw = optionalText(formData.get("totalPages"));
  let totalPages: number | undefined;
  if (totalPagesRaw !== undefined) {
    const parsed = Number(totalPagesRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return { error: "총 페이지 수는 1 이상의 숫자여야 해요." };
    }
    totalPages = parsed;
  }

  // 상태에 따른 날짜 처리: 찜은 날짜 없음, 읽는 중은 시작일, 완독은 완독일 기본값 오늘
  const startDateInput = optionalText(formData.get("startDate"));
  const finishDateInput = optionalText(formData.get("finishDate"));
  const startDate =
    status === "wishlist" ? undefined : (startDateInput ?? today());
  const finishDate =
    status === "finished" ? (finishDateInput ?? today()) : undefined;

  const fields = {
    title: title.trim(),
    author: author.trim(),
    publisher: optionalText(formData.get("publisher")),
    coverImageUrl: optionalText(formData.get("coverImageUrl")),
    status,
    startDate,
    finishDate,
    totalPages,
  };

  const bookId = formData.get("bookId");
  let savedId: string;

  // 표지가 있으면 실제 표지에서 책등 색(1~2색)을 추출한다. 실패 시 폴백.
  const extracted = fields.coverImageUrl
    ? await extractCoverColors(fields.coverImageUrl)
    : null;

  if (typeof bookId === "string" && bookId !== "") {
    // 수정 시 추출에 성공한 경우에만 색을 갱신한다 (기존 색 보존)
    const updated = await updateBook(bookId, { ...fields, ...(extracted ?? {}) });
    if (!updated) {
      return { error: "수정하려는 책을 찾을 수 없어요." };
    }
    savedId = updated.id;
  } else {
    const book = await addBook({
      ...fields,
      isWishlisted: false,
      ...(extracted ?? assignSpineColors(`${fields.title}-${fields.author}`)),
    });
    savedId = book.id;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/books/${savedId}`);
  return {
    error: null,
    message:
      typeof bookId === "string" && bookId !== ""
        ? "책 정보를 수정했어요."
        : "책을 등록했어요.",
    redirectTo: `/books/${savedId}`,
  };
}
