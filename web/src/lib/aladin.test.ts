import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lookupAladinPages, searchAladinBooks } from "./aladin";

describe("aladin", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe("without ALADIN_TTB_KEY", () => {
    it("throws when calling searchAladinBooks", async () => {
      await expect(searchAladinBooks("query")).rejects.toThrow(
        "ALADIN_TTB_KEY가 설정되지 않았어요"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("throws when calling lookupAladinPages", async () => {
      await expect(lookupAladinPages("9781234567890")).rejects.toThrow(
        "ALADIN_TTB_KEY가 설정되지 않았어요"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("searchAladinBooks", () => {
    beforeEach(() => {
      vi.stubEnv("ALADIN_TTB_KEY", "test-ttb-key");
    });

    it("filters items missing isbn13 or title, and maps fields", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          item: [
            {
              isbn13: "9781111111111",
              title: "Book One",
              author: "Author One",
              publisher: "Publisher One",
              cover: "http://cover1.jpg",
              pubDate: "2020-01-01",
            },
            { isbn13: "9782222222222" }, // missing title -> filtered out
            { title: "No ISBN" }, // missing isbn13 -> filtered out
          ],
        }),
      });

      const result = await searchAladinBooks("query");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        isbn13: "9781111111111",
        title: "Book One",
        author: "Author One",
        publisher: "Publisher One",
        coverImageUrl: "http://cover1.jpg",
        pubDate: "2020-01-01",
      });
    });

    it("maps empty publisher/cover/pubDate to undefined", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          item: [
            {
              isbn13: "9781111111111",
              title: "Book One",
              author: "Author One",
              publisher: "",
              cover: "",
              pubDate: "",
            },
          ],
        }),
      });

      const result = await searchAladinBooks("query");
      expect(result[0].publisher).toBeUndefined();
      expect(result[0].coverImageUrl).toBeUndefined();
      expect(result[0].pubDate).toBeUndefined();
    });

    it("defaults author to empty string when missing", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          item: [{ isbn13: "9781111111111", title: "Book One" }],
        }),
      });

      const result = await searchAladinBooks("query");
      expect(result[0].author).toBe("");
    });

    it("throws when the response has errorCode", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errorCode: 100,
          errorMessage: "Invalid key",
        }),
      });

      await expect(searchAladinBooks("query")).rejects.toThrow(
        "알라딘 API 오류: Invalid key"
      );
    });

    it("throws when res.ok is false", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(searchAladinBooks("query")).rejects.toThrow(
        "알라딘 API 응답 오류 (500)"
      );
    });
  });

  describe("lookupAladinPages", () => {
    beforeEach(() => {
      vi.stubEnv("ALADIN_TTB_KEY", "test-ttb-key");
    });

    it("returns undefined when subInfo.itemPage is missing", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ item: [{ subInfo: {} }] }),
      });
      const result = await lookupAladinPages("9781111111111");
      expect(result).toBeUndefined();
    });

    it("returns undefined when itemPage is 0 or less", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ item: [{ subInfo: { itemPage: 0 } }] }),
      });
      const result = await lookupAladinPages("9781111111111");
      expect(result).toBeUndefined();
    });

    it("returns the page count when positive", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ item: [{ subInfo: { itemPage: 320 } }] }),
      });
      const result = await lookupAladinPages("9781111111111");
      expect(result).toBe(320);
    });
  });
});
