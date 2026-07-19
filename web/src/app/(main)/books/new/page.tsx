import { NewBookTabs } from "./new-book-tabs";

export const dynamic = "force-dynamic";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">책 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          검색으로 찾거나, 검색 결과에 없으면 직접 등록할 수 있어요.
        </p>
      </div>

      <NewBookTabs />
    </div>
  );
}
