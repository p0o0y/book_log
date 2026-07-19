-- 서재 서비스 초기 스키마: books / reviews / youtube_videos + RLS

create type book_status as enum ('reading', 'finished', 'wishlist');

create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text not null,
  publisher text,
  cover_image_url text,
  status book_status not null default 'reading',
  start_date date,
  finish_date date,
  current_page integer check (current_page >= 0),
  total_pages integer check (total_pages > 0),
  spine_color text not null,
  spine_text_color text not null,
  created_at timestamptz not null default now()
);

create index books_user_id_idx on books (user_id);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books (id) on delete cascade,
  rating numeric(2, 1) check (rating >= 0.5 and rating <= 5),
  one_liner text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

create index reviews_book_id_idx on reviews (book_id);

create table youtube_videos (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books (id) on delete cascade,
  video_id text not null,
  title text not null,
  channel text not null,
  duration text not null,
  thumbnail_color text not null,
  created_at timestamptz not null default now()
);

create index youtube_videos_book_id_idx on youtube_videos (book_id);

-- RLS: 모든 접근은 본인 소유 데이터로 제한
alter table books enable row level security;
alter table reviews enable row level security;
alter table youtube_videos enable row level security;

create policy "books_owner_all" on books
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "reviews_owner_all" on reviews
  for all
  using (
    exists (
      select 1 from books b
      where b.id = book_id and b.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from books b
      where b.id = book_id and b.user_id = (select auth.uid())
    )
  );

create policy "youtube_videos_owner_all" on youtube_videos
  for all
  using (
    exists (
      select 1 from books b
      where b.id = book_id and b.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from books b
      where b.id = book_id and b.user_id = (select auth.uid())
    )
  );
