"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Book } from "@/lib/types";
import { BookForm, type BookFormPrefill } from "./book-form";
import { SearchTab } from "./search-tab";

export function NewBookTabs({ books }: { books: Book[] }) {
  const [tab, setTab] = useState("search");
  const [prefill, setPrefill] = useState<BookFormPrefill | undefined>();
  // 선택할 때마다 key를 바꿔 폼의 defaultValue가 새로 반영되게 한다
  const [prefillKey, setPrefillKey] = useState(0);

  function handleSelect(selected: BookFormPrefill) {
    setPrefill(selected);
    setPrefillKey((k) => k + 1);
    setTab("manual");
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">검색으로 등록</TabsTrigger>
        <TabsTrigger value="manual">직접 등록</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="pt-2">
        <SearchTab books={books} onSelect={handleSelect} />
      </TabsContent>

      <TabsContent value="manual" className="pt-2">
        <BookForm key={prefillKey} prefill={prefill} />
      </TabsContent>
    </Tabs>
  );
}
