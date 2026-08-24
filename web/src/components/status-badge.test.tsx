// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("reading 상태에 '읽는 중' 라벨을 표시한다", () => {
    render(<StatusBadge status="reading" />);
    expect(screen.getByText("읽는 중")).toBeInTheDocument();
  });

  it("finished 상태에 '완독' 라벨을 표시한다", () => {
    render(<StatusBadge status="finished" />);
    expect(screen.getByText("완독")).toBeInTheDocument();
  });

  it("wishlist 상태에 '미시작' 라벨을 표시한다", () => {
    render(<StatusBadge status="wishlist" />);
    expect(screen.getByText("미시작")).toBeInTheDocument();
  });

  it("상태별로 다른 스타일 클래스가 적용된다", () => {
    const { unmount: unmountReading } = render(<StatusBadge status="reading" />);
    const readingEl = screen.getByText("읽는 중");
    expect(readingEl.className).toContain("bg-blue-100");
    unmountReading();

    const { unmount: unmountFinished } = render(<StatusBadge status="finished" />);
    const finishedEl = screen.getByText("완독");
    expect(finishedEl.className).toContain("bg-emerald-100");
    unmountFinished();

    render(<StatusBadge status="wishlist" />);
    const wishlistEl = screen.getByText("미시작");
    expect(wishlistEl.className).toContain("bg-amber-100");

    expect(readingEl.className).not.toBe(finishedEl.className);
    expect(finishedEl.className).not.toBe(wishlistEl.className);
  });
});
