/** 읽기 상태. wishlist는 역사적 이유로 남은 enum 값으로, "미시작"을 의미한다. */
export type BookStatus = "reading" | "finished" | "wishlist";

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  status: BookStatus;
  /** 찜 여부 — 읽기 상태와 독립적인 플래그 (완독&찜, 읽는중&찜 가능) */
  isWishlisted: boolean;
  startDate?: string;
  finishDate?: string;
  currentPage?: number;
  totalPages?: number;
  /** 표지 대표색 (책등 색상에 반영) */
  spineColor: string;
  /** 표지 색 구성 — 픽셀 비율 기반 밴드 (표지 위→아래 순, ratio 합계 100). 있으면 다색 책등 */
  spinePalette?: SpineBand[];
  /** 책등 글자색 */
  spineTextColor: string;
}

/** 책등 색 밴드 — 표지에서 해당 색이 차지하는 비율(%)만큼 세로 공간을 차지 */
export interface SpineBand {
  color: string;
  ratio: number;
}

export interface Review {
  id: string;
  bookId: string;
  rating?: number;
  oneLiner: string;
  content: string;
  createdAt: string;
}

export interface YoutubeVideo {
  id: string;
  bookId: string;
  videoId: string;
  title: string;
  channel: string;
  /** oEmbed에는 재생시간이 없어 수동 등록 영상은 비어 있다 */
  duration?: string;
  /** 실제 썸네일 이미지 — 없으면 thumbnailColor 그라데이션 폴백 */
  thumbnailUrl?: string;
  thumbnailColor?: string;
}

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: "읽는 중",
  finished: "완독",
  wishlist: "미시작",
};
