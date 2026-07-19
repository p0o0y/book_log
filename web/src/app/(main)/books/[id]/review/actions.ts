"use server";

import { revalidatePath } from "next/cache";
import {
  addReview,
  deleteReview,
  getBook,
  getReview,
  updateReview,
} from "@/lib/store";

export type ReviewFormState = {
  error: string | null;
  /** 성공 시 토스트 메시지 */
  message?: string;
  /** 성공 시 클라이언트가 이동할 경로 */
  redirectTo?: string;
};

export type DeleteReviewState = {
  message: string | null;
};

function parseRating(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string") return undefined;
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? rating
    : undefined;
}

/** reviewId(hidden) 유무에 따라 신규 작성/수정을 처리하는 공용 액션 */
export async function saveReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const bookId = formData.get("bookId");
  if (typeof bookId !== "string" || !(await getBook(bookId))) {
    return { error: "존재하지 않는 책이에요." };
  }

  const oneLiner = formData.get("oneLiner");
  const content = formData.get("content");
  const oneLinerText = typeof oneLiner === "string" ? oneLiner.trim() : "";
  const contentText = typeof content === "string" ? content.trim() : "";

  if (oneLinerText === "" && contentText === "") {
    return { error: "한줄평 또는 본문 중 하나는 입력해주세요." };
  }

  const rating = parseRating(formData.get("rating"));
  const reviewId = formData.get("reviewId");
  const isEdit = typeof reviewId === "string" && reviewId !== "";

  if (isEdit) {
    const updated = await updateReview(reviewId as string, {
      rating,
      oneLiner: oneLinerText,
      content: contentText,
    });
    if (!updated) {
      return { error: "수정하려는 독후감을 찾을 수 없어요." };
    }
  } else {
    await addReview({
      bookId,
      rating,
      oneLiner: oneLinerText,
      content: contentText,
    });
  }

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/dashboard");
  return {
    error: null,
    message: isEdit ? "독후감을 수정했어요." : "독후감을 저장했어요.",
    redirectTo: `/books/${bookId}`,
  };
}

export async function deleteReviewAction(
  _prevState: DeleteReviewState,
  formData: FormData
): Promise<DeleteReviewState> {
  const reviewId = formData.get("reviewId");
  if (typeof reviewId !== "string") return { message: null };

  const review = await getReview(reviewId);
  if (!review) return { message: null };

  await deleteReview(reviewId);
  revalidatePath(`/books/${review.bookId}`);
  revalidatePath("/dashboard");
  return { message: "독후감을 삭제했어요." };
}
