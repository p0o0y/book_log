"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** form 안에서 제출 중이면 자동으로 비활성화되는 제출 버튼 */
export function PendingButton({
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending || disabled} {...props} />;
}
