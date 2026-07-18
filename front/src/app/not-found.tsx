import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <BookX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-xl font-black">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-muted-foreground">
        요청하신 페이지가 없거나 삭제되었어요.
      </p>
      <Button asChild>
        <Link href="/">서재로 돌아가기</Link>
      </Button>
    </div>
  );
}
