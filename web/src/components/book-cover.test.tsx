// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { BookCover } from "./book-cover";
import type { Book } from "@/lib/types";

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: "1",
    title: "테스트 도서",
    author: "테스트 저자",
    status: "reading",
    isWishlisted: false,
    spineColor: "#336699",
    spineTextColor: "#ffffff",
    ...overrides,
  };
}

describe("BookCover", () => {
  it("coverImageUrl이 있으면 img를 렌더링한다", () => {
    const book = makeBook({ coverImageUrl: "https://example.com/cover.jpg" });
    render(<BookCover book={book} />);
    const img = screen.getByRole("img", { name: "테스트 도서 표지" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("coverImageUrl이 없으면 img를 렌더링하지 않는다", () => {
    const book = makeBook({ coverImageUrl: undefined });
    render(<BookCover book={book} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("publisher가 있으면 텍스트를 표시한다", () => {
    const book = makeBook({ publisher: "테스트출판사" });
    render(<BookCover book={book} />);
    expect(screen.getByText("테스트출판사")).toBeInTheDocument();
  });

  it("publisher가 없으면 표시하지 않는다", () => {
    const book = makeBook({ publisher: undefined });
    const { container } = render(<BookCover book={book} />);
    expect(container.querySelector("p.opacity-60")).not.toBeInTheDocument();
  });

  it("title/author 텍스트를 렌더링한다", () => {
    const book = makeBook({ title: "제목입니다", author: "저자입니다" });
    render(<BookCover book={book} />);
    expect(screen.getByText("제목입니다")).toBeInTheDocument();
    expect(screen.getByText("저자입니다")).toBeInTheDocument();
  });

  it("배경색이 spineColor와 일치한다", () => {
    const book = makeBook({ spineColor: "rgb(51, 102, 153)" });
    const { container } = render(<BookCover book={book} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.backgroundColor).toBe("rgb(51, 102, 153)");
  });
});
