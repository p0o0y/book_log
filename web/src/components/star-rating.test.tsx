// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { StarRating } from "./star-rating";

function filledCount(container: HTMLElement) {
  return container.querySelectorAll("svg.fill-amber-400").length;
}

describe("StarRating", () => {
  it("rating 0일 때 채워진 별이 없다", () => {
    const { container } = render(<StarRating rating={0} />);
    expect(filledCount(container)).toBe(0);
  });

  it("rating 3일 때 채워진 별이 3개다", () => {
    const { container } = render(<StarRating rating={3} />);
    expect(filledCount(container)).toBe(3);
  });

  it("rating 5일 때 채워진 별이 5개다", () => {
    const { container } = render(<StarRating rating={5} />);
    expect(filledCount(container)).toBe(5);
  });

  it("aria-label에 별점이 표시된다", () => {
    render(<StarRating rating={4} />);
    expect(screen.getByLabelText("별점 4점")).toBeInTheDocument();
  });
});
