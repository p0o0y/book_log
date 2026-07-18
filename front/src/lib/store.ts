import { seedBooks, seedReviews, seedYoutubeVideos } from "./mock-data";
import type { Book, Review, YoutubeVideo } from "./types";

/**
 * 인메모리 데이터 저장소.
 * 앱의 모든 데이터 접근은 이 모듈의 함수를 통해서만 이루어진다.
 * 이후 DB 도입 시 이 모듈의 구현만 교체하면 된다.
 */
interface StoreState {
  books: Book[];
  reviews: Review[];
  youtubeVideos: YoutubeVideo[];
}

// dev 핫리로드로 모듈이 재평가되어도 데이터가 유지되도록 globalThis에 보관
const globalStore = globalThis as typeof globalThis & {
  __bookStore?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__bookStore) {
    globalStore.__bookStore = {
      books: seedBooks.map((b) => ({ ...b })),
      reviews: seedReviews.map((r) => ({ ...r })),
      youtubeVideos: seedYoutubeVideos.map((v) => ({ ...v })),
    };
  }
  return globalStore.__bookStore;
}

// ---------- Books ----------

export type NewBookInput = Omit<Book, "id">;

export function listBooks(): Book[] {
  return [...getState().books];
}

export function getBook(id: string): Book | undefined {
  return getState().books.find((b) => b.id === id);
}

export function addBook(input: NewBookInput): Book {
  const book: Book = { ...input, id: crypto.randomUUID() };
  getState().books.push(book);
  return book;
}

export function updateBook(
  id: string,
  patch: Partial<Omit<Book, "id">>
): Book | undefined {
  const book = getState().books.find((b) => b.id === id);
  if (!book) return undefined;
  Object.assign(book, patch);
  return book;
}

/** 책과 함께 연관된 독후감·영상도 삭제한다. */
export function deleteBook(id: string): boolean {
  const state = getState();
  const index = state.books.findIndex((b) => b.id === id);
  if (index === -1) return false;
  state.books.splice(index, 1);
  state.reviews = state.reviews.filter((r) => r.bookId !== id);
  state.youtubeVideos = state.youtubeVideos.filter((v) => v.bookId !== id);
  return true;
}

// ---------- Reviews ----------

export type NewReviewInput = Omit<Review, "id">;

export function listReviews(bookId: string): Review[] {
  return getState()
    .reviews.filter((r) => r.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllReviews(): Review[] {
  return [...getState().reviews];
}

export function getReview(id: string): Review | undefined {
  return getState().reviews.find((r) => r.id === id);
}

export function addReview(input: NewReviewInput): Review {
  const review: Review = { ...input, id: crypto.randomUUID() };
  getState().reviews.push(review);
  return review;
}

export function updateReview(
  id: string,
  patch: Partial<Omit<Review, "id" | "bookId">>
): Review | undefined {
  const review = getState().reviews.find((r) => r.id === id);
  if (!review) return undefined;
  Object.assign(review, patch);
  return review;
}

export function deleteReview(id: string): boolean {
  const state = getState();
  const index = state.reviews.findIndex((r) => r.id === id);
  if (index === -1) return false;
  state.reviews.splice(index, 1);
  return true;
}

// ---------- Youtube Videos ----------

export function listYoutubeVideos(bookId: string): YoutubeVideo[] {
  return getState().youtubeVideos.filter((v) => v.bookId === bookId);
}
