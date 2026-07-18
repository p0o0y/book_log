import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <span className="ml-2 text-sm">불러오는 중...</span>
    </div>
  );
}
