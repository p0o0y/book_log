import Link from 'next/link';
import { LibraryBig, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/login/actions';

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-black">
          <LibraryBig className="size-5 text-primary" />
          <span>BOOK_LOG</span>
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
              <Plus className="size-4" />책 등록
            </Link>
          </Button>
          {user ? (
            <>
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {(user.email as string | undefined)?.[0]?.toUpperCase() ?? '나'}
                </AvatarFallback>
              </Avatar>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  aria-label="로그아웃"
                >
                  <LogOut className="size-4" />
                </Button>
              </form>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
