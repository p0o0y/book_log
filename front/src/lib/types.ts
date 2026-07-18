export type BookStatus = "reading" | "finished" | "wishlist";

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  status: BookStatus;
  startDate?: string;
  finishDate?: string;
  currentPage?: number;
  totalPages?: number;
  /** 표지 대표색 (책등 색상에 반영) */
  spineColor: string;
  /** 책등 글자색 */
  spineTextColor: string;
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
  duration: string;
  thumbnailColor: string;
}

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: "읽는 중",
  finished: "완독",
  wishlist: "찜",
};
