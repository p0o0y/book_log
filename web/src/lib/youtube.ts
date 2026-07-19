/**
 * 유튜브 URL 파싱 + oEmbed 메타데이터 조회 (서버 전용).
 * oEmbed는 API 키 없이 제목/채널/썸네일을 제공한다 (재생시간은 없음).
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
