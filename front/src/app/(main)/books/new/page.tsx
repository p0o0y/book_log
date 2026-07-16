import { Search } from "lucide-react";
import { books } from "@/lib/mock-data";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// 검색 결과 목업 (도서 API 연동 전)
const searchResults = books.slice(0, 4);

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">책 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          검색으로 찾거나, 검색 결과에 없으면 직접 등록할 수 있어요.
        </p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">검색으로 등록</TabsTrigger>
          <TabsTrigger value="manual">직접 등록</TabsTrigger>
        </TabsList>

        {/* 검색 탭 */}
        <TabsContent value="search" className="space-y-4 pt-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="책 제목 또는 저자를 검색하세요"
                className="pl-9"
              />
            </div>
            <Button type="button">검색</Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              검색 결과 {searchResults.length}건
            </p>
            {searchResults.map((book) => (
              <Card key={book.id}>
                <CardContent className="flex items-center gap-4">
                  <BookCover
                    book={book}
                    className="w-14 shrink-0 p-1.5 [&_p]:text-[7px]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{book.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {book.author}
                      {book.publisher && ` · ${book.publisher}`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" type="button">
                    선택
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 직접 등록 탭 */}
        <TabsContent value="manual" className="pt-2">
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                제목 <span className="text-destructive">*</span>
              </Label>
              <Input id="title" placeholder="책 제목" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">
                저자 <span className="text-destructive">*</span>
              </Label>
              <Input id="author" placeholder="저자명" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">출판사 (선택)</Label>
              <Input id="publisher" placeholder="출판사" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">표지 이미지 URL (선택)</Label>
              <Input id="cover" placeholder="https://..." />
              <p className="text-xs text-muted-foreground">
                이미지가 없으면 대표색 기반 플레이스홀더 책등이 사용돼요.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>상태</Label>
                <Select defaultValue="reading">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">읽는 중</SelectItem>
                    <SelectItem value="finished">완독</SelectItem>
                    <SelectItem value="wishlist">읽고 싶은 책 (찜)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="finish-date">완독일 (선택)</Label>
                <Input id="finish-date" type="date" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button">등록하기</Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
