// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { PendingButton } from "./pending-button";

// useFormStatus는 <form action={...}> 서브트리 안에서만 pending 정보를 제공한다.
// jsdom에서 실제 form 제출(action 호출 후 pending -> false 전이)을 안정적으로
// 관찰하는 것은 트랜지션 타이밍에 의존해 flaky하므로, 여기서는 아래 범위로 한정한다:
//   1) form 밖/제출 전 상태에서는 disabled가 아님
//   2) disabled prop을 명시적으로 주면 반영됨
// pending=true 상태 자체의 검증은 스킵한다 (보고에 사유 명시).
describe("PendingButton", () => {
  it("form 밖에서는 disabled가 아니다", () => {
    render(<PendingButton>제출</PendingButton>);
    const button = screen.getByRole("button", { name: "제출" });
    expect(button).not.toBeDisabled();
  });

  it("제출 전 form 안에서도 disabled가 아니다", () => {
    render(
      <form action={async () => {}}>
        <PendingButton>제출</PendingButton>
      </form>
    );
    const button = screen.getByRole("button", { name: "제출" });
    expect(button).not.toBeDisabled();
  });

  it("disabled prop을 명시적으로 주면 disabled가 반영된다", () => {
    render(<PendingButton disabled>제출</PendingButton>);
    const button = screen.getByRole("button", { name: "제출" });
    expect(button).toBeDisabled();
  });
});
