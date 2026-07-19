"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shelfUrl, type ShelfParams, type ShelfSort } from "./shelf-url";

const SORT_LABEL: Record<ShelfSort, string> = {
  recent: "최근순",
  title: "제목순",
  author: "저자순",
};

/** 서재 검색 인풋 + 정렬 셀렉트 — 값 변경 시 URL searchParams를 갱신한다 */
export function ShelfControls({ params }: { params: ShelfParams }) {
  const router = useRouter();
  const [query, setQuery] = useState(params.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(shelfUrl({ ...params, q: value.trim() }));
    }, 300);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="제목·저자 검색"
          aria-label="서재 검색"
          className="w-44 pl-9 sm:w-52"
        />
      </div>
      <Select
        value={params.sort}
        onValueChange={(value) =>
          router.push(shelfUrl({ ...params, sort: value as ShelfSort }))
        }
      >
        <SelectTrigger aria-label="정렬" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABEL) as ShelfSort[]).map((key) => (
            <SelectItem key={key} value={key}>
              {SORT_LABEL[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
