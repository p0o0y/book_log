/**
 * 유튜브 URL 파싱 + oEmbed 메타데이터 조회 + 리뷰 영상 검색 (서버 전용).
 * - oEmbed는 API 키 없이 제목/채널/썸네일을 제공한다 (재생시간은 없음).
 * - 검색은 YouTube Data API v3 사용 (YOUTUBE_API_KEY 필요, search.list 1회 = 100유닛/일일 쿼터 10,000).
 */

const VIDEO_ID_RE = /^[\w-]{11}$/;

/** watch/youtu.be/shorts/embed/live 형태의 URL에서 11자리 videoId를 추출한다 */
export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID_RE.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) return v;
    const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
    if (match) return match[1];
  }
  return null;
}

export interface YoutubeOembed {
  title: string;
  channel: string;
  thumbnailUrl?: string;
}

export interface RecommendedVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl?: string;
  duration?: string;
}

/** ISO8601 재생시간(PT1H2M3S)을 "1:02:03" 형태로 변환한다 */
function formatIsoDuration(iso: string): string | undefined {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return undefined;
  const [, h, m, s] = match.map((v) => Number(v ?? 0));
  if (h === 0 && m === 0 && s === 0) return undefined;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * "{책제목} 책 리뷰"로 검색해 조회수가 가장 높은 영상 1개를 반환한다.
 * 키가 없거나 API 호출에 실패하면 null (호출부 흐름을 막지 않는다).
 */
export async function searchTopReviewVideo(
  bookTitle: string
): Promise<RecommendedVideo | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const searchParams = new URLSearchParams({
      key,
      part: "snippet",
      q: `${bookTitle} 책 리뷰`,
      type: "video",
      order: "viewCount",
      maxResults: "5",
      regionCode: "KR",
      relevanceLanguage: "ko",
    });
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!searchRes.ok) return null;
    const searchBody = (await searchRes.json()) as {
      items?: { id?: { videoId?: string } }[];
    };
    const ids = (searchBody.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => !!id && VIDEO_ID_RE.test(id));
    if (ids.length === 0) return null;

    // 후보들의 실제 조회수/재생시간을 받아 최다 조회 영상을 확정한다
    const videosParams = new URLSearchParams({
      key,
      part: "snippet,statistics,contentDetails",
      id: ids.join(","),
    });
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videosParams}`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!videosRes.ok) return null;
    const videosBody = (await videosRes.json()) as {
      items?: {
        id?: string;
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
        };
        statistics?: { viewCount?: string };
        contentDetails?: { duration?: string };
      }[];
    };

    let best: RecommendedVideo | null = null;
    let bestViews = -1;
    for (const item of videosBody.items ?? []) {
      if (!item.id || !item.snippet?.title) continue;
      const views = Number(item.statistics?.viewCount ?? 0);
      if (views <= bestViews) continue;
      bestViews = views;
      best = {
        videoId: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle ?? "",
        thumbnailUrl:
          item.snippet.thumbnails?.medium?.url ??
          item.snippet.thumbnails?.default?.url,
        duration: item.contentDetails?.duration
          ? formatIsoDuration(item.contentDetails.duration)
          : undefined,
      };
    }
    return best;
  } catch {
    return null;
  }
}

export async function fetchYoutubeOembed(
  videoId: string
): Promise<YoutubeOembed | null> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    if (!body.title) return null;
    return {
      title: body.title,
      channel: body.author_name ?? "",
      thumbnailUrl: body.thumbnail_url,
    };
  } catch {
    return null;
  }
}
