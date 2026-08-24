import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/store", () => ({
  addYoutubeVideo: vi.fn(),
  deleteBook: vi.fn(),
  deleteYoutubeVideo: vi.fn(),
  getBook: vi.fn(),
  getYoutubeVideo: vi.fn(),
  listYoutubeVideos: vi.fn(),
  updateBook: vi.fn(),
}));

vi.mock("@/lib/youtube", () => ({
  fetchYoutubeOembed: vi.fn(),
  parseYoutubeVideoId: vi.fn(),
  searchTopReviewVideo: vi.fn(),
}));

import { redirect } from "next/navigation";
import {
  addYoutubeVideo,
  deleteBook,
  deleteYoutubeVideo,
  getBook,
  getYoutubeVideo,
  listYoutubeVideos,
  updateBook,
} from "@/lib/store";
import {
  fetchYoutubeOembed,
  parseYoutubeVideoId,
  searchTopReviewVideo,
} from "@/lib/youtube";
import type { Book, YoutubeVideo } from "@/lib/types";
import {
  changeBookStatus,
  toggleWishlist,
  updateProgress,
  addYoutubeVideoAction,
  deleteYoutubeVideoAction,
  deleteBookAction,
  type BookActionState,
  type ProgressFormState,
  type VideoFormState,
} from "./actions";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: "book-1",
    title: "책 제목",
    author: "저자",
    status: "reading",
    isWishlisted: false,
    spineColor: "#111111",
    spineTextColor: "#ffffff",
    ...overrides,
  };
}

const EMPTY_BOOK_STATE: BookActionState = { message: null };
const EMPTY_PROGRESS_STATE: ProgressFormState = { error: null };
const EMPTY_VIDEO_STATE: VideoFormState = { error: null };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("changeBookStatus", () => {
  it("bookId 없으면 무변화", async () => {
    const fd = makeFormData({ status: "reading" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(result).toEqual({ message: null });
    expect(getBook).not.toHaveBeenCalled();
  });

  it("status가 유효하지 않으면 무변화", async () => {
    const fd = makeFormData({ bookId: "book-1", status: "invalid" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(result).toEqual({ message: null });
    expect(getBook).not.toHaveBeenCalled();
  });

  it("getBook이 undefined면 무변화", async () => {
    vi.mocked(getBook).mockResolvedValue(undefined);
    const fd = makeFormData({ bookId: "book-1", status: "reading" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(result).toEqual({ message: null });
    expect(updateBook).not.toHaveBeenCalled();
  });

  it("정상 케이스는 updateBook 호출 및 메시지", async () => {
    const book = makeBook({ status: "reading" });
    vi.mocked(getBook).mockResolvedValue(book);
    vi.mocked(updateBook).mockResolvedValue(book);
    const fd = makeFormData({ bookId: "book-1", status: "wishlist" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith("book-1", expect.objectContaining({ status: "wishlist" }));
    expect(result.message).toBe("'책 제목'을(를) 미시작 상태로 변경했어요.");
  });

  it("finished로 처음 전이 시 영상이 없고 추천 영상이 있으면 추천 등록 + 메시지에 '추천' 포함", async () => {
    const book = makeBook({ status: "reading" });
    vi.mocked(getBook).mockResolvedValue(book);
    vi.mocked(updateBook).mockResolvedValue(book);
    vi.mocked(listYoutubeVideos).mockResolvedValue([]);
    vi.mocked(searchTopReviewVideo).mockResolvedValue({
      videoId: "abc12345678",
      title: "리뷰 영상",
      channel: "채널",
    });
    const fd = makeFormData({ bookId: "book-1", status: "finished" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(addYoutubeVideo).toHaveBeenCalledWith(
      expect.objectContaining({ bookId: "book-1", videoId: "abc12345678" })
    );
    expect(result.message).toContain("추천");
  });

  it("이미 영상이 있으면 추천하지 않음", async () => {
    const book = makeBook({ status: "reading" });
    vi.mocked(getBook).mockResolvedValue(book);
    vi.mocked(updateBook).mockResolvedValue(book);
    vi.mocked(listYoutubeVideos).mockResolvedValue([
      { id: "v1", bookId: "book-1", videoId: "existing1111", title: "t", channel: "c" },
    ]);
    const fd = makeFormData({ bookId: "book-1", status: "finished" });
    const result = await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(searchTopReviewVideo).not.toHaveBeenCalled();
    expect(addYoutubeVideo).not.toHaveBeenCalled();
    expect(result.message).not.toContain("추천");
  });

  it("이미 finished였으면 추천 로직 자체를 타지 않음", async () => {
    const book = makeBook({ status: "finished" });
    vi.mocked(getBook).mockResolvedValue(book);
    vi.mocked(updateBook).mockResolvedValue(book);
    const fd = makeFormData({ bookId: "book-1", status: "finished" });
    await changeBookStatus(EMPTY_BOOK_STATE, fd);
    expect(listYoutubeVideos).not.toHaveBeenCalled();
    expect(searchTopReviewVideo).not.toHaveBeenCalled();
  });
});

describe("toggleWishlist", () => {
  it("찜 켜기: isWishlisted false -> true", async () => {
    const book = makeBook({ isWishlisted: false });
    vi.mocked(getBook).mockResolvedValue(book);
    const fd = makeFormData({ bookId: "book-1" });
    const result = await toggleWishlist(EMPTY_BOOK_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith("book-1", { isWishlisted: true });
    expect(result.message).toBe("'책 제목'을(를) 찜했어요.");
  });

  it("찜 해제: isWishlisted true -> false", async () => {
    const book = makeBook({ isWishlisted: true });
    vi.mocked(getBook).mockResolvedValue(book);
    const fd = makeFormData({ bookId: "book-1" });
    const result = await toggleWishlist(EMPTY_BOOK_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith("book-1", { isWishlisted: false });
    expect(result.message).toBe("'책 제목' 찜을 해제했어요.");
  });

  it("bookId 없으면 무변화", async () => {
    const fd = makeFormData({});
    const result = await toggleWishlist(EMPTY_BOOK_STATE, fd);
    expect(result).toEqual({ message: null });
    expect(getBook).not.toHaveBeenCalled();
  });

  it("getBook이 undefined면 무변화", async () => {
    vi.mocked(getBook).mockResolvedValue(undefined);
    const fd = makeFormData({ bookId: "book-1" });
    const result = await toggleWishlist(EMPTY_BOOK_STATE, fd);
    expect(result).toEqual({ message: null });
    expect(updateBook).not.toHaveBeenCalled();
  });
});

describe("updateProgress", () => {
  it("bookId가 문자열 아니면 에러", async () => {
    const fd = makeFormData({ currentPage: "10" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(result).toEqual({ error: "잘못된 요청이에요." });
  });

  it("존재하지 않는 책이면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(undefined);
    const fd = makeFormData({ bookId: "book-1", currentPage: "10" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(result).toEqual({ error: "존재하지 않는 책이에요." });
  });

  it("currentPage가 정수 아니면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100 }));
    const fd = makeFormData({ bookId: "book-1", currentPage: "abc" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(result).toEqual({ error: "현재 페이지는 0 이상의 숫자여야 해요." });
  });

  it("currentPage가 음수면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100 }));
    const fd = makeFormData({ bookId: "book-1", currentPage: "-1" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(result).toEqual({ error: "현재 페이지는 0 이상의 숫자여야 해요." });
  });

  it("totalPages 초과하면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100 }));
    const fd = makeFormData({ bookId: "book-1", currentPage: "101" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(result).toEqual({ error: "총 페이지 수(100쪽)를 넘을 수 없어요." });
  });

  it("단순 저장 케이스", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100 }));
    const fd = makeFormData({ bookId: "book-1", currentPage: "50" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith("book-1", { currentPage: 50 });
    expect(result).toEqual({ error: null, message: "진행률을 저장했어요." });
  });

  it("currentPage === totalPages면 완독 처리(추천 없음)", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100, status: "reading" }));
    vi.mocked(listYoutubeVideos).mockResolvedValue([
      { id: "v1", bookId: "book-1", videoId: "existing1111", title: "t", channel: "c" },
    ]);
    const fd = makeFormData({ bookId: "book-1", currentPage: "100" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(updateBook).toHaveBeenCalledWith(
      "book-1",
      expect.objectContaining({ currentPage: 100, status: "finished" })
    );
    expect(result).toEqual({
      error: null,
      message: "마지막 페이지까지 읽어 완독 처리했어요!",
    });
  });

  it("완독 + 추천 케이스", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook({ totalPages: 100, status: "reading" }));
    vi.mocked(listYoutubeVideos).mockResolvedValue([]);
    vi.mocked(searchTopReviewVideo).mockResolvedValue({
      videoId: "abc12345678",
      title: "리뷰 영상",
      channel: "채널",
    });
    const fd = makeFormData({ bookId: "book-1", currentPage: "100" });
    const result = await updateProgress(EMPTY_PROGRESS_STATE, fd);
    expect(addYoutubeVideo).toHaveBeenCalled();
    expect(result).toEqual({
      error: null,
      message: "마지막 페이지까지 읽어 완독 처리하고 리뷰 영상을 추천해뒀어요!",
    });
  });
});

describe("addYoutubeVideoAction", () => {
  it("잘못된 요청(타입 아님)이면 에러", async () => {
    const fd = new FormData();
    fd.set("bookId", "book-1");
    // url 필드를 넣지 않음
    const result = await addYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({ error: "잘못된 요청이에요." });
  });

  it("존재하지 않는 책이면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(undefined);
    const fd = makeFormData({ bookId: "book-1", url: "https://youtu.be/abc12345678" });
    const result = await addYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({ error: "존재하지 않는 책이에요." });
  });

  it("URL 파싱 실패면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook());
    vi.mocked(parseYoutubeVideoId).mockReturnValue(null);
    const fd = makeFormData({ bookId: "book-1", url: "not-a-url" });
    const result = await addYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({
      error: "유튜브 영상 URL이 아니에요. 영상 링크를 붙여넣어 주세요.",
    });
  });

  it("oEmbed 실패면 에러", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook());
    vi.mocked(parseYoutubeVideoId).mockReturnValue("abc12345678");
    vi.mocked(fetchYoutubeOembed).mockResolvedValue(null);
    const fd = makeFormData({ bookId: "book-1", url: "https://youtu.be/abc12345678" });
    const result = await addYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({
      error: "영상 정보를 가져오지 못했어요. 링크를 확인해 주세요.",
    });
  });

  it("정상 등록", async () => {
    vi.mocked(getBook).mockResolvedValue(makeBook());
    vi.mocked(parseYoutubeVideoId).mockReturnValue("abc12345678");
    vi.mocked(fetchYoutubeOembed).mockResolvedValue({
      title: "영상 제목",
      channel: "채널",
      thumbnailUrl: "https://example.com/thumb.jpg",
    });
    const fd = makeFormData({ bookId: "book-1", url: "https://youtu.be/abc12345678" });
    const result = await addYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(addYoutubeVideo).toHaveBeenCalledWith({
      bookId: "book-1",
      videoId: "abc12345678",
      title: "영상 제목",
      channel: "채널",
      thumbnailUrl: "https://example.com/thumb.jpg",
    });
    expect(result).toEqual({ error: null, message: "영상을 추가했어요." });
  });
});

describe("deleteYoutubeVideoAction", () => {
  it("videoId 없으면 무변화", async () => {
    const fd = new FormData();
    const result = await deleteYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({ error: null });
    expect(getYoutubeVideo).not.toHaveBeenCalled();
  });

  it("영상 없으면 무변화", async () => {
    vi.mocked(getYoutubeVideo).mockResolvedValue(undefined);
    const fd = makeFormData({ videoId: "v1" });
    const result = await deleteYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(result).toEqual({ error: null });
    expect(deleteYoutubeVideo).not.toHaveBeenCalled();
  });

  it("정상 삭제 시 메시지", async () => {
    const video: YoutubeVideo = {
      id: "v1",
      bookId: "book-1",
      videoId: "abc12345678",
      title: "t",
      channel: "c",
    };
    vi.mocked(getYoutubeVideo).mockResolvedValue(video);
    const fd = makeFormData({ videoId: "v1" });
    const result = await deleteYoutubeVideoAction(EMPTY_VIDEO_STATE, fd);
    expect(deleteYoutubeVideo).toHaveBeenCalledWith("v1");
    expect(result).toEqual({ error: null, message: "영상을 삭제했어요." });
  });
});

describe("deleteBookAction", () => {
  it("삭제 실패(존재하지 않음)면 redirect 호출 안 함", async () => {
    vi.mocked(deleteBook).mockResolvedValue(false);
    const fd = makeFormData({ bookId: "book-1" });
    await deleteBookAction(fd);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("성공 시 redirect('/') 호출됨", async () => {
    vi.mocked(deleteBook).mockResolvedValue(true);
    const fd = makeFormData({ bookId: "book-1" });
    await expect(deleteBookAction(fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("bookId가 없으면 아무것도 하지 않음", async () => {
    const fd = new FormData();
    await deleteBookAction(fd);
    expect(deleteBook).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
