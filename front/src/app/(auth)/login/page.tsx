import Link from "next/link";
import { LibraryBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="mx-auto mb-2 flex items-center gap-2 text-lg font-black"
          >
            <LibraryBig className="size-6 text-primary" />
            마이북셸프
          </Link>
          <CardTitle className="text-xl">로그인</CardTitle>
          <CardDescription>
            나만의 서재는 로그인 후 이용할 수 있어요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="me@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="button" className="w-full">
              이메일로 로그인
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">또는</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
            >
              카카오로 시작하기
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Google로 시작하기
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          아직 계정이 없나요?
          <span className="ml-1 cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            회원가입
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
