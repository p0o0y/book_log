import Link from "next/link";
import { LibraryBig, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-black">
          <LibraryBig className="size-5 text-primary" />
          <span>마이북셸프</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">서재</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">대시보드</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/books/new">
              <Plus className="size-4" />
              책 등록
            </Link>
          </Button>
          <Link href="/login" aria-label="계정">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                나
              </AvatarFallback>
            </Avatar>
          </Link>
        </nav>
      </div>
    </header>
  );
}
