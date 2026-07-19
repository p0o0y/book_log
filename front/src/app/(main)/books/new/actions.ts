"use server";

import { revalidatePath } from "next/cache";
import { assignSpineColors } from "@/lib/spine-palette";
import { addBook, updateBook } from "@/lib/store";
import type { BookStatus } from "@/lib/types";

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

  if (typeof bookId === "string" && bookId !== "") {
    const updated = await updateBook(bookId, fields);
    if (!updated) {
      return { error: "수정하려는 책을 찾을 수 없어요." };
    }
    savedId = updated.id;
  } else {
    const book = await addBook({
      ...fields,
      ...assignSpineColors(`${fields.title}-${fields.author}`),
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
