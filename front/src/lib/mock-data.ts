import type { Book, Review, YoutubeVideo } from "./types";

/**
 * 인메모리 저장소(store.ts)의 초기 시드 데이터.
 * 데이터 조회/변경은 반드시 store.ts의 함수를 통해서만 할 것.
 */
export const seedBooks: Book[] = [
  { id: "1", title: "수축 사회", author: "홍성국", publisher: "메디치미디어", status: "finished", startDate: "2026-01-03", finishDate: "2026-01-21", totalPages: 456, spineColor: "#2f4858", spineTextColor: "#f5f0e6" },
  { id: "2", title: "긴 게의 파랑", author: "천선란", publisher: "허블", status: "finished", startDate: "2026-02-01", finishDate: "2026-02-14", totalPages: 388, spineColor: "#3b6ea5", spineTextColor: "#ffffff" },
  { id: "3", title: "물고기는 존재하지 않는다", author: "룰루 밀러", publisher: "곰출판", status: "finished", startDate: "2026-02-20", finishDate: "2026-03-02", totalPages: 300, spineColor: "#1d3557", spineTextColor: "#f1faee" },
  { id: "4", title: "아몬드", author: "손원평", publisher: "창비", status: "finished", startDate: "2025-12-01", finishDate: "2025-12-09", totalPages: 264, spineColor: "#e07a5f", spineTextColor: "#fff8f0" },
  { id: "5", title: "달러구트 꿈 백화점", author: "이미예", publisher: "팩토리나인", status: "finished", startDate: "2026-03-05", finishDate: "2026-03-18", totalPages: 300, spineColor: "#5f4b8b", spineTextColor: "#f3eefc" },
  { id: "6", title: "불편한 편의점", author: "김호연", publisher: "나무옆의자", status: "finished", startDate: "2026-03-22", finishDate: "2026-04-01", totalPages: 268, spineColor: "#2a9d8f", spineTextColor: "#f0fdfa" },
  { id: "7", title: "미드나잇 라이브러리", author: "매트 헤이그", publisher: "인플루엔셜", status: "finished", startDate: "2026-04-03", finishDate: "2026-04-15", totalPages: 408, spineColor: "#14213d", spineTextColor: "#ffd166" },
  { id: "8", title: "사피엔스", author: "유발 하라리", publisher: "김영사", status: "reading", startDate: "2026-06-20", currentPage: 312, totalPages: 636, spineColor: "#9b2226", spineTextColor: "#fff3e0" },
  { id: "9", title: "역행자", author: "자청", publisher: "웅진지식하우스", status: "reading", startDate: "2026-07-01", currentPage: 96, totalPages: 344, spineColor: "#0b525b", spineTextColor: "#e0fbfc" },
  { id: "10", title: "도둑맞은 집중력", author: "요한 하리", publisher: "어크로스", status: "reading", startDate: "2026-07-10", currentPage: 45, totalPages: 464, spineColor: "#f4a261", spineTextColor: "#442c14" },
  { id: "11", title: "이기적 유전자", author: "리처드 도킨스", publisher: "을유문화사", status: "wishlist", totalPages: 632, spineColor: "#606c38", spineTextColor: "#fefae0" },
  { id: "12", title: "파친코 1", author: "이민진", publisher: "인플루엔셜", status: "wishlist", totalPages: 400, spineColor: "#7f5539", spineTextColor: "#f5ebe0" },
  { id: "13", title: "총, 균, 쇠", author: "재레드 다이아몬드", publisher: "김영사", status: "wishlist", totalPages: 784, spineColor: "#495057", spineTextColor: "#f8f9fa" },
  { id: "14", title: "구의 증명", author: "최진영", publisher: "은행나무", status: "finished", startDate: "2026-04-20", finishDate: "2026-04-24", totalPages: 180, spineColor: "#c9ada7", spineTextColor: "#3d2b28" },
  { id: "15", title: "지구 끝의 온실", author: "김초엽", publisher: "자이언트북스", status: "finished", startDate: "2026-05-01", finishDate: "2026-05-12", totalPages: 392, spineColor: "#40916c", spineTextColor: "#ecfdf5" },
  { id: "16", title: "여행의 이유", author: "김영하", publisher: "문학동네", status: "finished", startDate: "2026-05-15", finishDate: "2026-05-21", totalPages: 216, spineColor: "#f2cc8f", spineTextColor: "#4a3419" },
  { id: "17", title: "클루지", author: "개리 마커스", publisher: "갤리온", status: "wishlist", totalPages: 320, spineColor: "#8338ec", spineTextColor: "#f3e8ff" },
  { id: "18", title: "1984", author: "조지 오웰", publisher: "민음사", status: "finished", startDate: "2026-06-01", finishDate: "2026-06-15", totalPages: 424, spineColor: "#212529", spineTextColor: "#e9ecef" },
];

export const seedReviews: Review[] = [
  {
    id: "r1",
    bookId: "1",
    rating: 4,
    oneLiner: "저성장 시대를 이해하는 렌즈",
    content: "팽창 사회에서 수축 사회로의 전환이라는 프레임이 인상적이었다. 인구 감소와 공급 과잉이 만들어내는 구조적 변화를 다양한 사례로 풀어낸다. 후반부는 다소 반복적이지만 전체적으로 시야를 넓혀준 책.",
    createdAt: "2026-01-22",
  },
  {
    id: "r2",
    bookId: "2",
    rating: 5,
    oneLiner: "한국 SF의 현재를 보여주는 수작",
    content: "인간과 로봇의 경계에 대한 질문을 따뜻한 시선으로 풀어낸다. 콜리의 시점에서 서술되는 장면들이 특히 좋았고, 마지막 장을 덮고 나서도 여운이 오래 남았다.",
    createdAt: "2026-02-15",
  },
  {
    id: "r3",
    bookId: "2",
    rating: 5,
    oneLiner: "재독 — 처음보다 더 좋았다",
    content: "두 번째 읽으니 복선들이 눈에 들어온다. 우주인 김보경의 서사가 이렇게 촘촘했다니. 재독할 가치가 충분한 소설.",
    createdAt: "2026-05-30",
  },
  {
    id: "r4",
    bookId: "3",
    rating: 5,
    oneLiner: "과학책인 줄 알았는데 인생책",
    content: "분류학자 데이비드 스타 조던의 삶을 추적하며 시작하지만, 결국 '질서에 대한 집착'과 '혼돈을 받아들이는 것'에 대한 이야기. 논픽션이 이렇게 아름다울 수 있다는 걸 처음 알았다.",
    createdAt: "2026-03-03",
  },
  {
    id: "r5",
    bookId: "8",
    rating: 4,
    oneLiner: "인지혁명 파트까지 읽는 중 — 압도적",
    content: "허구를 믿는 능력이 협력을 가능하게 했다는 논지가 강렬하다. 아직 절반이지만 벌써 올해의 책 후보.",
    createdAt: "2026-07-05",
  },
  {
    id: "r6",
    bookId: "7",
    rating: 3,
    oneLiner: "설정은 좋았지만 결말이 아쉬움",
    content: "후회하는 삶들을 도서관에서 체험한다는 설정은 매력적이다. 다만 중반 이후 전개가 예상 가능했고 메시지가 다소 직접적으로 전달되는 느낌.",
    createdAt: "2026-04-16",
  },
];

export const seedYoutubeVideos: YoutubeVideo[] = [
  { id: "y1", bookId: "2", videoId: "mock-1", title: "『천 개의 파랑』 리뷰 — 올해 최고의 한국 SF", channel: "책읽는다락방", duration: "12:34", thumbnailColor: "#3b6ea5" },
  { id: "y2", bookId: "2", videoId: "mock-2", title: "천선란 작가 인터뷰: 로봇과 인간 사이", channel: "출판저널TV", duration: "24:01", thumbnailColor: "#1d3557" },
  { id: "y3", bookId: "2", videoId: "mock-3", title: "[북토크] 천 개의 파랑, 함께 읽기", channel: "동네책방", duration: "45:12", thumbnailColor: "#457b9d" },
  { id: "y4", bookId: "8", videoId: "mock-4", title: "사피엔스 30분 핵심 요약", channel: "지식채널", duration: "31:20", thumbnailColor: "#9b2226" },
  { id: "y5", bookId: "8", videoId: "mock-5", title: "유발 하라리가 말하는 인류의 미래", channel: "강연모음", duration: "58:44", thumbnailColor: "#660708" },
  { id: "y6", bookId: "1", videoId: "mock-6", title: "수축 사회 — 저자 직강", channel: "경제한잔", duration: "42:10", thumbnailColor: "#2f4858" },
];
