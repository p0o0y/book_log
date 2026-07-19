-- 찜을 읽기 상태(status)에서 독립된 플래그로 분리하고,
-- 책등 상하 2색 표현용 보조 색상 컬럼을 추가한다.
-- 기존 status='wishlist'는 "미시작 + 찜"이었으므로 플래그로 이전한다.

alter table books add column is_wishlisted boolean not null default false;

update books set is_wishlisted = true where status = 'wishlist';

alter table books add column spine_color_secondary text;
