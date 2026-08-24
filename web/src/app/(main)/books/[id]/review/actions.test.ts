import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteReviewAction, saveReview } from "./actions";
import {
  addReview,
  deleteReview,
  getBook,
  getReview,
  updateReview,
} from "@/lib/store";
import type { Book, Review } from "@/lib/types";

function fakeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: BOOK_ID,
    title: "",
    author: "",
    status: "reading",
    isWishlisted: false,
    spineColor: "#000000",
    spineTextColor: "#ffffff",
    ...overrides,
  };
}

function fakeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "review-1",
    bookId: BOOK_ID,
    oneLiner: "",
    content: "",
    createdAt: "2026-01-01",
    ...overrides,
  };
}

vi.mock("@/lib/store", () => ({
  addReview: vi.fn(),
  deleteReview: vi.fn(),
  getBook: vi.fn(),
  getReview: vi.fn(),
  updateReview: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const BOOK_ID = "book-1";

function buildFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe("saveReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bookId가 문자열이 아니면 에러를 반환한다", async () => {
    const formData = new FormData();
    // bookId를 아예 넣지 않으면 formData.get("bookId")는 null이 된다.
    formData.set("oneLiner", "좋았어요");

    const result = await saveReview(
      { error: null },
      formData
    );

    expect(result).toEqual({ error: "존재하지 않는 책이에요." });
    expect(getBook).not.toHaveBeenCalled();
  });

  it("getBook이 undefined를 반환하면 에러를 반환한다", async () => {
    vi.mocked(getBook).mockResolvedValue(undefined);
    const formData = buildFormData({ bookId: BOOK_ID, oneLiner: "좋았어요" });

    const result = await saveReview({ error: null }, formData);

    expect(getBook).toHaveBeenCalledWith(BOOK_ID);
    expect(result).toEqual({ error: "존재하지 않는 책이에요." });
  });

  it("oneLiner와 content가 모두 공백이면 에러를 반환한다", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    const formData = buildFormData({
      bookId: BOOK_ID,
      oneLiner: "   ",
      content: "  \n ",
    });

    const result = await saveReview({ error: null }, formData);

    expect(result).toEqual({ error: "한줄평 또는 본문 중 하나는 입력해주세요." });
    expect(addReview).not.toHaveBeenCalled();
    expect(updateReview).not.toHaveBeenCalled();
  });

  it("oneLiner만 있어도 통과한다 (신규 작성)", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    vi.mocked(addReview).mockResolvedValue(fakeReview({ id: "review-1" }));
    const formData = buildFormData({
      bookId: BOOK_ID,
      oneLiner: "  좋았어요  ",
      content: "   ",
    });

    const result = await saveReview({ error: null }, formData);

    expect(addReview).toHaveBeenCalledWith({
      bookId: BOOK_ID,
      rating: undefined,
      oneLiner: "좋았어요",
      content: "",
    });
    expect(result).toEqual({
      error: null,
      message: "독후감을 저장했어요.",
      redirectTo: `/books/${BOOK_ID}`,
    });
  });

  it("content만 있어도 통과한다 (신규 작성)", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    vi.mocked(addReview).mockResolvedValue(fakeReview({ id: "review-1" }));
    const formData = buildFormData({
      bookId: BOOK_ID,
      oneLiner: "   ",
      content: "  내용입니다  ",
    });

    const result = await saveReview({ error: null }, formData);

    expect(addReview).toHaveBeenCalledWith({
      bookId: BOOK_ID,
      rating: undefined,
      oneLiner: "",
      content: "내용입니다",
    });
    expect(result.message).toBe("독후감을 저장했어요.");
  });

  describe("rating 파싱", () => {
    const invalidRatings = ["0", "6", "abc", "3.5"];

    it.each(invalidRatings)(
      "유효하지 않은 rating(%s)은 undefined로 처리된다",
      async (ratingValue) => {
        vi.mocked(getBook).mockResolvedValue(fakeBook());
        vi.mocked(addReview).mockResolvedValue(fakeReview({ id: "review-1" }));
        const formData = buildFormData({
          bookId: BOOK_ID,
          oneLiner: "좋았어요",
          rating: ratingValue,
        });

        await saveReview({ error: null }, formData);

        expect(addReview).toHaveBeenCalledWith(
          expect.objectContaining({ rating: undefined })
        );
      }
    );

    it.each(["1", "2", "3", "4", "5"])(
      "유효한 rating(%s)은 정수로 파싱된다",
      async (ratingValue) => {
        vi.mocked(getBook).mockResolvedValue(fakeBook());
        vi.mocked(addReview).mockResolvedValue(fakeReview({ id: "review-1" }));
        const formData = buildFormData({
          bookId: BOOK_ID,
          oneLiner: "좋았어요",
          rating: ratingValue,
        });

        await saveReview({ error: null }, formData);

        expect(addReview).toHaveBeenCalledWith(
          expect.objectContaining({ rating: Number(ratingValue) })
        );
      }
    );
  });

  it("reviewId가 있으면 updateReview를 호출하고 수정 성공 메시지를 반환한다", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    vi.mocked(updateReview).mockResolvedValue(fakeReview({ id: "review-1" }));
    const formData = buildFormData({
      bookId: BOOK_ID,
      reviewId: "review-1",
      oneLiner: "수정된 한줄평",
      rating: "4",
    });

    const result = await saveReview({ error: null }, formData);

    expect(updateReview).toHaveBeenCalledWith("review-1", {
      rating: 4,
      oneLiner: "수정된 한줄평",
      content: "",
    });
    expect(addReview).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: null,
      message: "독후감을 수정했어요.",
      redirectTo: `/books/${BOOK_ID}`,
    });
  });

  it("updateReview가 undefined를 반환하면 에러를 반환한다", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    vi.mocked(updateReview).mockResolvedValue(undefined);
    const formData = buildFormData({
      bookId: BOOK_ID,
      reviewId: "review-1",
      oneLiner: "수정된 한줄평",
    });

    const result = await saveReview({ error: null }, formData);

    expect(result).toEqual({ error: "수정하려는 독후감을 찾을 수 없어요." });
  });

  it("reviewId가 없으면 addReview를 호출하고 신규 저장 메시지를 반환한다", async () => {
    vi.mocked(getBook).mockResolvedValue(fakeBook());
    vi.mocked(addReview).mockResolvedValue(fakeReview({ id: "review-new" }));
    const formData = buildFormData({
      bookId: BOOK_ID,
      oneLiner: "새로운 한줄평",
    });

    const result = await saveReview({ error: null }, formData);

    expect(addReview).toHaveBeenCalledWith({
      bookId: BOOK_ID,
      rating: undefined,
      oneLiner: "새로운 한줄평",
      content: "",
    });
    expect(updateReview).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: null,
      message: "독후감을 저장했어요.",
      redirectTo: `/books/${BOOK_ID}`,
    });
  });
});

describe("deleteReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reviewId가 없으면 무변화 상태를 반환한다", async () => {
    const formData = new FormData();

    const result = await deleteReviewAction({ message: null }, formData);

    expect(result).toEqual({ message: null });
    expect(getReview).not.toHaveBeenCalled();
    expect(deleteReview).not.toHaveBeenCalled();
  });

  it("getReview가 undefined를 반환하면 무변화 상태를 반환한다", async () => {
    vi.mocked(getReview).mockResolvedValue(undefined);
    const formData = buildFormData({ reviewId: "review-1" });

    const result = await deleteReviewAction({ message: null }, formData);

    expect(result).toEqual({ message: null });
    expect(deleteReview).not.toHaveBeenCalled();
  });

  it("정상 삭제 시 deleteReview를 호출하고 성공 메시지를 반환한다", async () => {
    vi.mocked(getReview).mockResolvedValue(
      fakeReview({ id: "review-1", bookId: BOOK_ID })
    );
    const formData = buildFormData({ reviewId: "review-1" });

    const result = await deleteReviewAction({ message: null }, formData);

    expect(deleteReview).toHaveBeenCalledWith("review-1");
    expect(result).toEqual({ message: "독후감을 삭제했어요." });
  });
});
