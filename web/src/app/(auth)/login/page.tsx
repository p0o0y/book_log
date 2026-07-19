import Link from "next/link";
import { LibraryBig } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

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
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          계정이 없다면 회원가입 버튼으로 바로 가입할 수 있어요
        </CardFooter>
      </Card>
    </div>
  );
}
