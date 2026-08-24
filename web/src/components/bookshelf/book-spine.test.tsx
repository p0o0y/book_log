// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { BookSpine } from "./book-spine";
import type { Book } from "@/lib/types";

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: "abc123",
    title: "테스트 도서",
    author: "테스트 저자",
    status: "wishlist",
    isWishlisted: false,
    spineColor: "#336699",
    spineTextColor: "#ffffff",
    ...overrides,
  };
}

describe("BookSpine", () => {
  it("status가 reading일 때만 '읽는 중' 아이콘을 표시한다", () => {
    render(<BookSpine book={makeBook({ status: "reading" })} />);
    expect(screen.getByLabelText("읽는 중")).toBeInTheDocument();
  });

  it("status가 reading이 아니면 '읽는 중' 아이콘을 표시하지 않는다", () => {
    render(<BookSpine book={makeBook({ status: "finished" })} />);
    expect(screen.queryByLabelText("읽는 중")).not.toBeInTheDocument();
  });

  it("isWishlisted가 true일 때만 '찜' 아이콘을 표시한다", () => {
    render(<BookSpine book={makeBook({ isWishlisted: true })} />);
    expect(screen.getByLabelText("찜")).toBeInTheDocument();
  });

  it("isWishlisted가 false면 '찜' 아이콘을 표시하지 않는다", () => {
    render(<BookSpine book={makeBook({ isWishlisted: false })} />);
    expect(screen.queryByLabelText("찜")).not.toBeInTheDocument();
  });

  it("href가 /books/{id}로 렌더링된다", () => {
    const book = makeBook({ id: "xyz-1", title: "링크테스트" });
    render(<BookSpine book={book} />);
    const link = screen.getByRole("link", { name: /링크테스트/ });
    expect(link).toHaveAttribute("href", "/books/xyz-1");
  });

  it("title/author 텍스트를 렌더링한다", () => {
    render(<BookSpine book={makeBook({ title: "책제목", author: "책저자" })} />);
    expect(screen.getByText("책제목")).toBeInTheDocument();
    expect(screen.getByText("책저자")).toBeInTheDocument();
  });
});
