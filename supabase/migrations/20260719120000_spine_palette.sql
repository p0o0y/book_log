-- 책등 색을 상/하 2색에서 비율 기반 다색 밴드로 확장한다.
-- spine_palette: [{"color":"#ffffff","ratio":70},...] (ratio 합계 100, 표지 위→아래 순)

alter table books add column spine_palette jsonb;

alter table books drop column spine_color_secondary;
