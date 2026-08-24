import { describe, it, expect } from "vitest";
import { shelfUrl, type ShelfParams } from "./shelf-url";

const defaults: ShelfParams = {
  status: "all",
  view: "shelf",
  q: "",
  sort: "recent",
};

describe("shelfUrl", () => {
  it("전부 기본값이면 '/'를 반환한다", () => {
    expect(shelfUrl(defaults)).toBe("/");
  });

  it("status가 기본값이 아니면 쿼리스트링에 포함된다", () => {
    expect(shelfUrl({ ...defaults, status: "reading" })).toBe(
      "/?status=reading"
    );
  });

  it("view가 기본값이 아니면 쿼리스트링에 포함된다", () => {
    expect(shelfUrl({ ...defaults, view: "grid" })).toBe("/?view=grid");
  });

  it("q가 기본값이 아니면 쿼리스트링에 포함된다", () => {
    expect(shelfUrl({ ...defaults, q: "해리포터" })).toBe(
      `/?q=${encodeURIComponent("해리포터")}`
    );
  });

  it("sort가 기본값이 아니면 쿼리스트링에 포함된다", () => {
    expect(shelfUrl({ ...defaults, sort: "title" })).toBe("/?sort=title");
  });

  it("여러 필드가 동시에 비기본값일 때 조합된다", () => {
    const url = shelfUrl({
      status: "finished",
      view: "grid",
      q: "sql",
      sort: "author",
    });
    expect(url).toBe("/?status=finished&view=grid&q=sql&sort=author");
  });

  it("q에 특수문자/공백이 있으면 URL 인코딩된다", () => {
    const url = shelfUrl({ ...defaults, q: "hello world & foo=bar" });
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("q")).toBe("hello world & foo=bar");
    expect(url).toContain("q=hello+world");
  });
});
