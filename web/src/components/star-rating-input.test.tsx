// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRatingInput } from "./star-rating-input";

function filledCount(container: HTMLElement) {
  return container.querySelectorAll("svg.fill-amber-400").length;
}

describe("StarRatingInput", () => {
  it("defaultValue만큼 별이 채워진다", () => {
    const { container } = render(<StarRatingInput defaultValue={3} />);
    expect(filledCount(container)).toBe(3);
    expect(screen.getByText("3점")).toBeInTheDocument();
  });

  it("별 클릭 시 rating 상태가 변경된다", async () => {
    const user = userEvent.setup();
    render(<StarRatingInput />);
    await user.click(screen.getByLabelText("4점"));
    expect(screen.getByText("4점")).toBeInTheDocument();
  });

  it("ArrowRight/ArrowUp으로 rating이 증가하고 5를 넘지 않는다", async () => {
    const user = userEvent.setup();
    render(<StarRatingInput defaultValue={4} />);
    // 그룹 내부(별 버튼)에 포커스를 두어야 keydown이 group의 핸들러까지 버블링된다.
    await user.click(screen.getByLabelText("4점"));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("5점")).toBeInTheDocument();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByText("5점")).toBeInTheDocument();
  });

  it("ArrowLeft/ArrowDown으로 rating이 감소하고 0 미만이 되지 않는다", async () => {
    const user = userEvent.setup();
    render(<StarRatingInput defaultValue={1} />);
    await user.click(screen.getByLabelText("1점"));
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("별점을 선택하세요 (선택)")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("별점을 선택하세요 (선택)")).toBeInTheDocument();
  });

  it("name prop을 주면 hidden input의 value가 rating과 동기화된다", async () => {
    const user = userEvent.setup();
    const { container } = render(<StarRatingInput name="rating" defaultValue={2} />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("2");
    await user.click(screen.getByLabelText("5점"));
    expect(hidden.value).toBe("5");
  });

  it("name이 없으면 hidden input이 없다", () => {
    const { container } = render(<StarRatingInput defaultValue={2} />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});
