-- 유튜브 영상을 수동 URL 등록(oEmbed 메타데이터) 방식으로 전환한다.
-- oEmbed는 재생시간을 제공하지 않고, 썸네일은 실제 이미지 URL을 쓴다.

alter table youtube_videos alter column duration drop not null;
alter table youtube_videos alter column thumbnail_color drop not null;
alter table youtube_videos add column thumbnail_url text;
