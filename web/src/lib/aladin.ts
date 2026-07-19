/**
 * 알라딘 OpenAPI 클라이언트 (서버 전용 — TTB 키가 노출되지 않도록
 * 서버 액션/서버 컴포넌트에서만 import할 것).
 *
 * - 검색: ItemSearch (쪽수 미포함)
 * - 쪽수 조회: ItemLookUp의 subInfo.itemPage
 * 일일 호출 한도 5,000회.
 */

const API_BASE = "http://www.aladin.co.kr/ttb/api";
const API_VERSION = "20131101";

export interface AladinBook {
  isbn13: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  pubDate?: string;
}

function ttbKey(): string {
  const key = process.env.ALADIN_TTB_KEY;
  if (!key) {
    throw new Error(
      "ALADIN_TTB_KEY가 설정되지 않았어요. front/.env.local에 추가해주세요."
    );
  }
  return key;
}

interface ItemSearchItem {
  title?: string;
  author?: string;
  publisher?: string;
  cover?: string;
  isbn13?: string;
  pubDate?: string;
  subInfo?: { itemPage?: number };
}

async function callAladin(
  endpoint: string,
  params: Record<string, string>
): Promise<ItemSearchItem[]> {
  const search = new URLSearchParams({
    ttbkey: ttbKey(),
    output: "js",
    Version: API_VERSION,
    Cover: "Big",
    ...params,
  });
  const res = await fetch(`${API_BASE}/${endpoint}.aspx?${search}`, {
    // 같은 검색어 반복 호출 시 일일 한도를 아끼기 위한 짧은 캐시
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) {
    throw new Error(`알라딘 API 응답 오류 (${res.status})`);
  }
  const body = (await res.json()) as {
    errorCode?: number;
    errorMessage?: string;
    item?: ItemSearchItem[];
  };
  if (body.errorCode) {
    throw new Error(`알라딘 API 오류: ${body.errorMessage ?? body.errorCode}`);
  }
  return body.item ?? [];
}

export async function searchAladinBooks(query: string): Promise<AladinBook[]> {
  const items = await callAladin("ItemSearch", {
    Query: query,
    QueryType: "Keyword",
    SearchTarget: "Book",
    MaxResults: "10",
  });
  return items
    .filter((item) => item.isbn13 && item.title)
    .map((item) => ({
      isbn13: item.isbn13!,
      title: item.title!,
      author: item.author ?? "",
      publisher: item.publisher || undefined,
      coverImageUrl: item.cover || undefined,
      pubDate: item.pubDate || undefined,
    }));
}

/** ItemLookUp으로 쪽수를 조회한다. 없으면 undefined. */
export async function lookupAladinPages(
  isbn13: string
): Promise<number | undefined> {
  const items = await callAladin("ItemLookUp", {
    ItemId: isbn13,
    ItemIdType: "ISBN13",
  });
  const pages = items[0]?.subInfo?.itemPage;
  return typeof pages === "number" && pages > 0 ? pages : undefined;
}
