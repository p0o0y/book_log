import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/aladin", () => ({
  searchAladinBooks: vi.fn(),
  lookupAladinPages: vi.fn(),
}));

vi.mock("@/lib/cover-color", () => ({
  extractCoverColors: vi.fn(),
}));

vi.mock("@/lib/spine-palette", () => ({
  assignSpineColors: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  addBook: vi.fn(),
  updateBook: vi.fn(),
}));

import { searchAladinBooks, lookupAladinPages } from "@/lib/aladin";
import { extractCoverColors } from "@/lib/cover-color";
import { assignSpineColors } from "@/lib/spine-palette";
import { addBook, updateBook } from "@/lib/store";
import {
  saveBook,
  searchBooksAction,
  lookupPagesAction,
  type BookFormState,
} from "./actions";

const EMPTY_STATE: BookFormState = { error: null };

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(extractCoverColors).mockResolvedValue(null);
  vi.mocked(assignSpineColors).mockReturnValue({
    spineColor: "#111111",
    spineTextColor: "#ffffff",
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saveBook", () => {
  it("제목이 없으면 에러", async () => {
    const fd = makeFormData({ title: "  ", author: "author", status: "reading" });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(result).toEqual({ error: "제목을 입력해주세요." });
  });

  it("저자가 없으면 에러", async () => {
    const fd = makeFormData({ title: "title", author: "", status: "reading" });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(result).toEqual({ error: "저자를 입력해주세요." });
  });

  it("totalPages가 정수가 아니면 에러", async () => {
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      totalPages: "abc",
    });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(result).toEqual({ error: "총 페이지 수는 1 이상의 숫자여야 해요." });
  });

  it("totalPages가 0 이하면 에러", async () => {
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      totalPages: "0",
    });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(result).toEqual({ error: "총 페이지 수는 1 이상의 숫자여야 해요." });
  });

  it("status가 유효하지 않으면 reading으로 폴백", async () => {
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "reading",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "not-a-status",
    });
    await saveBook(EMPTY_STATE, fd);
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ status: "reading" })
    );
  });

  it("status가 wishlist면 startDate 없음", async () => {
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "wishlist",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "wishlist",
    });
    await saveBook(EMPTY_STATE, fd);
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: undefined, finishDate: undefined })
    );
  });

  it("status가 finished면 finishDate 기본값이 오늘 날짜", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-20T00:00:00Z"));
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "finished",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "finished",
    });
    await saveBook(EMPTY_STATE, fd);
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ finishDate: "2026-07-20" })
    );
  });

  it("bookId가 있으면 updateBook 호출(수정 분기)", async () => {
    vi.mocked(updateBook).mockResolvedValue({
      id: "existing-id",
      title: "title",
      author: "author",
      status: "reading",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      bookId: "existing-id",
    });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith(
      "existing-id",
      expect.objectContaining({ title: "title", author: "author" })
    );
    expect(addBook).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: null,
      message: "책 정보를 수정했어요.",
      redirectTo: "/books/existing-id",
    });
  });

  it("bookId가 없으면 addBook 호출(신규 분기)", async () => {
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "reading",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
    });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ title: "title", author: "author", isWishlisted: false })
    );
    expect(updateBook).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: null,
      message: "책을 등록했어요.",
      redirectTo: "/books/new-id",
    });
  });

  it("coverImageUrl이 있고 extractCoverColors가 값을 반환하면 그 색 사용", async () => {
    vi.mocked(extractCoverColors).mockResolvedValue({
      spineColor: "#abcdef",
      spineTextColor: "#000000",
    });
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "reading",
      isWishlisted: false,
      spineColor: "#abcdef",
      spineTextColor: "#000000",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      coverImageUrl: "http://example.com/cover.jpg",
    });
    await saveBook(EMPTY_STATE, fd);
    expect(extractCoverColors).toHaveBeenCalledWith("http://example.com/cover.jpg");
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ spineColor: "#abcdef", spineTextColor: "#000000" })
    );
    expect(assignSpineColors).not.toHaveBeenCalled();
  });

  it("extractCoverColors가 null이면 신규 등록 시 assignSpineColors 폴백 사용", async () => {
    vi.mocked(extractCoverColors).mockResolvedValue(null);
    vi.mocked(addBook).mockResolvedValue({
      id: "new-id",
      title: "title",
      author: "author",
      status: "reading",
      isWishlisted: false,
      spineColor: "#111111",
      spineTextColor: "#ffffff",
    });
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      coverImageUrl: "http://example.com/cover.jpg",
    });
    await saveBook(EMPTY_STATE, fd);
    expect(assignSpineColors).toHaveBeenCalledWith("title-author");
    expect(addBook).toHaveBeenCalledWith(
      expect.objectContaining({ spineColor: "#111111", spineTextColor: "#ffffff" })
    );
  });

  it("updateBook이 undefined 반환하면 에러", async () => {
    vi.mocked(updateBook).mockResolvedValue(undefined);
    const fd = makeFormData({
      title: "title",
      author: "author",
      status: "reading",
      bookId: "missing-id",
    });
    const result = await saveBook(EMPTY_STATE, fd);
    expect(result).toEqual({ error: "수정하려는 책을 찾을 수 없어요." });
  });
});

describe("searchBooksAction", () => {
  it("빈 문자열(trim 후)이면 searchAladinBooks 호출 없이 빈 배열", async () => {
    const result = await searchBooksAction("   ");
    expect(searchAladinBooks).not.toHaveBeenCalled();
    expect(result).toEqual({ items: [] });
  });

  it("정상 응답은 items 배열", async () => {
    const books = [
      {
        isbn13: "1234567890123",
        title: "title",
        author: "author",
      },
    ];
    vi.mocked(searchAladinBooks).mockResolvedValue(books);
    const result = await searchBooksAction("query");
    expect(searchAladinBooks).toHaveBeenCalledWith("query");
    expect(result).toEqual({ items: books });
  });

  it("searchAladinBooks가 예외 던지면 error 반환", async () => {
    vi.mocked(searchAladinBooks).mockRejectedValue(new Error("boom"));
    const result = await searchBooksAction("query");
    expect(result).toEqual({ error: "boom" });
  });
});

describe("lookupPagesAction", () => {
  it("정상 값 반환", async () => {
    vi.mocked(lookupAladinPages).mockResolvedValue(321);
    const result = await lookupPagesAction("1234567890123");
    expect(result).toBe(321);
  });

  it("lookupAladinPages가 예외 던지면 undefined 반환", async () => {
    vi.mocked(lookupAladinPages).mockRejectedValue(new Error("boom"));
    const result = await lookupPagesAction("1234567890123");
    expect(result).toBeUndefined();
  });
});
