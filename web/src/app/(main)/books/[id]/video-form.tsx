"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { toast } from "@/components/toaster";
import { Input } from "@/components/ui/input";
import {
  addYoutubeVideoAction,
  deleteYoutubeVideoAction,
  type VideoFormState,
} from "./actions";

const initialState: VideoFormState = { error: null };

/** 유튜브 URL 붙여넣기로 영상을 추가하는 폼 (oEmbed로 제목/썸네일 자동) */
export function VideoForm({ bookId }: { bookId: string }) {
  const [state, formAction] = useActionState(addYoutubeVideoAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex max-w-xl gap-2">
        <input type="hidden" name="bookId" value={bookId} />
        <Input
          name="url"
          placeholder="유튜브 영상 URL을 붙여넣으세요 (예: https://youtu.be/...)"
          aria-describedby={state.error ? "video-form-error" : undefined}
        />
        <PendingButton variant="outline">
          <Plus className="size-4" />
          추가
        </PendingButton>
      </div>
      {state.error && (
        <p
          id="video-form-error"
          role="alert"
          aria-live="polite"
          className="text-sm font-medium text-destructive"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}

/** 영상 카드 우상단 삭제 버튼 */
export function VideoDeleteButton({ videoId }: { videoId: string }) {
  const [state, formAction] = useActionState(
    deleteYoutubeVideoAction,
    initialState
  );

  useEffect(() => {
    if (state.message) toast(state.message);
  }, [state]);

  return (
    <form action={formAction} className="absolute right-2 top-2">
      <input type="hidden" name="videoId" value={videoId} />
      <button
        type="submit"
        aria-label="영상 삭제"
        className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </form>
  );
}
