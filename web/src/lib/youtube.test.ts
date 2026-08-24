import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchYoutubeOembed,
  parseYoutubeVideoId,
  searchTopReviewVideo,
} from "./youtube";

const VALID_ID = "abcdefgh12_";

describe("parseYoutubeVideoId", () => {
  it("returns the raw 11-char videoId as-is", () => {
    expect(parseYoutubeVideoId(VALID_ID)).toBe(VALID_ID);
  });

  it("parses youtu.be short URLs", () => {
    expect(parseYoutubeVideoId(`https://youtu.be/${VALID_ID}`)).toBe(
      VALID_ID
    );
  });

  it("parses youtube.com/watch?v= URLs", () => {
    expect(
      parseYoutubeVideoId(`https://www.youtube.com/watch?v=${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("parses shorts URLs", () => {
    expect(
      parseYoutubeVideoId(`https://youtube.com/shorts/${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("parses embed URLs", () => {
    expect(
      parseYoutubeVideoId(`https://youtube.com/embed/${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("parses live URLs", () => {
    expect(parseYoutubeVideoId(`https://youtube.com/live/${VALID_ID}`)).toBe(
      VALID_ID
    );
  });

  it("handles www. host variant", () => {
    expect(
      parseYoutubeVideoId(`https://www.youtube.com/shorts/${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("handles m. host variant", () => {
    expect(
      parseYoutubeVideoId(`https://m.youtube.com/watch?v=${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("handles music.youtube.com host", () => {
    expect(
      parseYoutubeVideoId(`https://music.youtube.com/watch?v=${VALID_ID}`)
    ).toBe(VALID_ID);
  });

  it("returns null for a string that fails URL parsing", () => {
    expect(parseYoutubeVideoId("not a url at all")).toBeNull();
  });

  it("returns null when videoId is not 11 chars", () => {
    expect(parseYoutubeVideoId("https://youtu.be/short")).toBeNull();
  });

  it("returns null for unrelated valid URLs", () => {
    expect(parseYoutubeVideoId("https://example.com/watch?v=xxxxxxxxxxx")).toBeNull();
  });
});

describe("searchTopReviewVideo", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null immediately without calling fetch when no API key", async () => {
    const result = await searchTopReviewVideo("책 제목");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when search API response is not ok", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock.mockResolvedValueOnce({ ok: false });
    const result = await searchTopReviewVideo("책 제목");
    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null when search results are empty", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });
    const result = await searchTopReviewVideo("책 제목");
    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("selects the video with the max viewCount among candidates", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { id: { videoId: "videoAAAAAA" } },
            { id: { videoId: "videoBBBBBB" } },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "videoAAAAAA",
              snippet: {
                title: "Video A",
                channelTitle: "Channel A",
                thumbnails: { medium: { url: "http://a.thumb" } },
              },
              statistics: { viewCount: "100" },
              contentDetails: { duration: "PT5M30S" },
            },
            {
              id: "videoBBBBBB",
              snippet: {
                title: "Video B",
                channelTitle: "Channel B",
                thumbnails: { medium: { url: "http://b.thumb" } },
              },
              statistics: { viewCount: "999" },
              contentDetails: { duration: "PT1H2M3S" },
            },
          ],
        }),
      });

    const result = await searchTopReviewVideo("책 제목");
    expect(result).not.toBeNull();
    expect(result?.videoId).toBe("videoBBBBBB");
    expect(result?.title).toBe("Video B");
    expect(result?.duration).toBe("1:02:03");
  });

  it("converts ISO8601 durations correctly via searchTopReviewVideo (indirect check of formatIsoDuration)", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");

    const cases: { iso: string; expected: string | undefined }[] = [
      { iso: "PT1H2M3S", expected: "1:02:03" },
      { iso: "PT5M30S", expected: "5:30" },
      { iso: "PT45S", expected: "0:45" },
      { iso: "PT0S", expected: undefined },
    ];

    for (const { iso, expected } of cases) {
      fetchMock.mockReset();
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ id: { videoId: "videoCCCCCC" } }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                id: "videoCCCCCC",
                snippet: { title: "Video C", channelTitle: "Channel C" },
                statistics: { viewCount: "10" },
                contentDetails: { duration: iso },
              },
            ],
          }),
        });

      const result = await searchTopReviewVideo("책 제목");
      expect(result?.duration).toBe(expected);
    }
  });

  it("treats a missing duration field as undefined", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: "videoDDDDDD" } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "videoDDDDDD",
              snippet: { title: "Video D", channelTitle: "Channel D" },
              statistics: { viewCount: "10" },
            },
          ],
        }),
      });
    const result = await searchTopReviewVideo("책 제목");
    expect(result?.duration).toBeUndefined();
  });

  it("returns null when fetch throws", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock.mockRejectedValueOnce(new Error("network error"));
    const result = await searchTopReviewVideo("책 제목");
    expect(result).toBeNull();
  });

  it("calls search then videos in order, passing videoIds via id= param", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "test-key");
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { id: { videoId: "videoEEEEEE" } },
            { id: { videoId: "videoFFFFFF" } },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "videoEEEEEE",
              snippet: { title: "Video E", channelTitle: "Channel E" },
              statistics: { viewCount: "5" },
            },
          ],
        }),
      });

    await searchTopReviewVideo("책 제목");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = fetchMock.mock.calls[0][0] as string;
    const secondUrl = fetchMock.mock.calls[1][0] as string;
    expect(firstUrl).toContain("/search?");
    expect(secondUrl).toContain("/videos?");
    expect(secondUrl).toContain(
      `id=${encodeURIComponent("videoEEEEEE,videoFFFFFF")}`
    );
  });
});

describe("fetchYoutubeOembed", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a successful response to title/channel/thumbnailUrl", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: "My Video",
        author_name: "My Channel",
        thumbnail_url: "http://thumb.jpg",
      }),
    });
    const result = await fetchYoutubeOembed(VALID_ID);
    expect(result).toEqual({
      title: "My Video",
      channel: "My Channel",
      thumbnailUrl: "http://thumb.jpg",
    });
  });

  it("defaults channel to empty string when author_name is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: "My Video" }),
    });
    const result = await fetchYoutubeOembed(VALID_ID);
    expect(result).toEqual({
      title: "My Video",
      channel: "",
      thumbnailUrl: undefined,
    });
  });

  it("returns null when response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    const result = await fetchYoutubeOembed(VALID_ID);
    expect(result).toBeNull();
  });

  it("returns null when title is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ author_name: "Channel only" }),
    });
    const result = await fetchYoutubeOembed(VALID_ID);
    expect(result).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network error"));
    const result = await fetchYoutubeOembed(VALID_ID);
    expect(result).toBeNull();
  });
});
