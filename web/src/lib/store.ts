import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Book, Review, SpineBand, YoutubeVideo } from "./types";

/**
 * Supabase 데이터 저장소.
 * 앱의 모든 데이터 접근은 이 모듈의 함수를 통해서만 이루어진다.
 * RLS로 인해 로그인한 사용자 본인의 데이터만 조회/변경된다.
 */

type BookRow = Database["public"]["Tables"]["books"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type YoutubeVideoRow = Database["public"]["Tables"]["youtube_videos"]["Row"];

// 라우트 파라미터로 임의 문자열이 들어올 수 있으므로,
// uuid 형식이 아니면 DB 에러 대신 "없음"으로 처리한다.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publisher: row.publisher ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    status: row.status,
    isWishlisted: row.is_wishlisted,
    startDate: row.start_date ?? undefined,
    finishDate: row.finish_date ?? undefined,
    currentPage: row.current_page ?? undefined,
    totalPages: row.total_pages ?? undefined,
    spineColor: row.spine_color,
    spinePalette: (row.spine_palette as unknown as SpineBand[] | null) ?? undefined,
    spineTextColor: row.spine_text_color,
  };
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    bookId: row.book_id,
    rating: row.rating ?? undefined,
    oneLiner: row.one_liner,
    content: row.content,
    createdAt: row.created_at.slice(0, 10),
  };
}

function toYoutubeVideo(row: YoutubeVideoRow): YoutubeVideo {
  return {
    id: row.id,
    bookId: row.book_id,
    videoId: row.video_id,
    title: row.title,
    channel: row.channel,
    duration: row.duration ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    thumbnailColor: row.thumbnail_color ?? undefined,
  };
}

const BOOK_COLUMN = {
  title: "title",
  author: "author",
  publisher: "publisher",
  coverImageUrl: "cover_image_url",
  status: "status",
  isWishlisted: "is_wishlisted",
  startDate: "start_date",
  finishDate: "finish_date",
  currentPage: "current_page",
  totalPages: "total_pages",
  spineColor: "spine_color",
  spinePalette: "spine_palette",
  spineTextColor: "spine_text_color",
} as const;

/**
 * camelCase 패치를 snake_case 행 패치로 변환한다.
 * 패치에 키가 존재하면서 값이 undefined인 경우는 "필드 비우기" 의도이므로
 * null로 변환해 전달한다 (supabase-js는 undefined 키를 무시하기 때문).
 */
function toBookRowPatch(
  patch: Partial<Omit<Book, "id">>
): Database["public"]["Tables"]["books"]["Update"] {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(BOOK_COLUMN)) {
    if (key in patch) {
      row[column] = patch[key as keyof typeof BOOK_COLUMN] ?? null;
    }
  }
  return row;
}

async function currentUserId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

// ---------- Books ----------

export type NewBookInput = Omit<Book, "id">;

export async function listBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`책 목록 조회 실패: ${error.message}`);
  return data.map(toBook);
}

export async function getBook(id: string): Promise<Book | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`책 조회 실패: ${error.message}`);
  return data ? toBook(data) : undefined;
}

export async function addBook(input: NewBookInput): Promise<Book> {
  const userId = await currentUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: userId,
      title: input.title,
      author: input.author,
      publisher: input.publisher ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      status: input.status,
      is_wishlisted: input.isWishlisted,
      start_date: input.startDate ?? null,
      finish_date: input.finishDate ?? null,
      current_page: input.currentPage ?? null,
      total_pages: input.totalPages ?? null,
      spine_color: input.spineColor,
      spine_palette: (input.spinePalette as unknown as Database["public"]["Tables"]["books"]["Insert"]["spine_palette"]) ?? null,
      spine_text_color: input.spineTextColor,
    })
    .select()
    .single();
  if (error) throw new Error(`책 등록 실패: ${error.message}`);
  return toBook(data);
}

export async function updateBook(
  id: string,
  patch: Partial<Omit<Book, "id">>
): Promise<Book | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .update(toBookRowPatch(patch))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`책 수정 실패: ${error.message}`);
  return data ? toBook(data) : undefined;
}

/** 연관된 독후감·영상은 DB의 on delete cascade로 함께 삭제된다. */
export async function deleteBook(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`책 삭제 실패: ${error.message}`);
  return data.length > 0;
}

// ---------- Reviews ----------

export type NewReviewInput = Omit<Review, "id" | "createdAt">;

export async function listReviews(bookId: string): Promise<Review[]> {
  if (!UUID_RE.test(bookId)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`독후감 목록 조회 실패: ${error.message}`);
  return data.map(toReview);
}

export async function listAllReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reviews").select("*");
  if (error) throw new Error(`독후감 목록 조회 실패: ${error.message}`);
  return data.map(toReview);
}

export async function getReview(id: string): Promise<Review | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`독후감 조회 실패: ${error.message}`);
  return data ? toReview(data) : undefined;
}

export async function addReview(input: NewReviewInput): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      book_id: input.bookId,
      rating: input.rating ?? null,
      one_liner: input.oneLiner,
      content: input.content,
    })
    .select()
    .single();
  if (error) throw new Error(`독후감 저장 실패: ${error.message}`);
  return toReview(data);
}

export async function updateReview(
  id: string,
  patch: Partial<Omit<Review, "id" | "bookId" | "createdAt">>
): Promise<Review | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = await createClient();
  const row: Database["public"]["Tables"]["reviews"]["Update"] = {};
  if ("rating" in patch) row.rating = patch.rating ?? null;
  if ("oneLiner" in patch) row.one_liner = patch.oneLiner;
  if ("content" in patch) row.content = patch.content;
  const { data, error } = await supabase
    .from("reviews")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`독후감 수정 실패: ${error.message}`);
  return data ? toReview(data) : undefined;
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`독후감 삭제 실패: ${error.message}`);
  return data.length > 0;
}

// ---------- Youtube Videos ----------

export async function listYoutubeVideos(bookId: string): Promise<YoutubeVideo[]> {
  if (!UUID_RE.test(bookId)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`영상 목록 조회 실패: ${error.message}`);
  return data.map(toYoutubeVideo);
}

export type NewYoutubeVideoInput = Omit<YoutubeVideo, "id">;

export async function addYoutubeVideo(
  input: NewYoutubeVideoInput
): Promise<YoutubeVideo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("youtube_videos")
    .insert({
      book_id: input.bookId,
      video_id: input.videoId,
      title: input.title,
      channel: input.channel,
      duration: input.duration ?? null,
      thumbnail_url: input.thumbnailUrl ?? null,
      thumbnail_color: input.thumbnailColor ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`영상 등록 실패: ${error.message}`);
  return toYoutubeVideo(data);
}

export async function getYoutubeVideo(
  id: string
): Promise<YoutubeVideo | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`영상 조회 실패: ${error.message}`);
  return data ? toYoutubeVideo(data) : undefined;
}

export async function deleteYoutubeVideo(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("youtube_videos")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`영상 삭제 실패: ${error.message}`);
  return data.length > 0;
}
