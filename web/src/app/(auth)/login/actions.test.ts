import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authenticate, logout } from "./actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

function buildFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

function mockSupabaseAuth() {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    getClaims: vi.fn(),
    signOut: vi.fn(),
  };
  vi.mocked(createClient).mockResolvedValue({
    auth: mockAuth,
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  return mockAuth;
}

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("email이 없으면 에러를 반환한다", async () => {
    mockSupabaseAuth();
    const formData = buildFormData({ password: "password123" });

    const result = await authenticate({ error: null }, formData);

    expect(result).toEqual({
      error: "이메일과 비밀번호를 모두 입력해 주세요.",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("password가 없으면 에러를 반환한다", async () => {
    mockSupabaseAuth();
    const formData = buildFormData({ email: "test@example.com" });

    const result = await authenticate({ error: null }, formData);

    expect(result).toEqual({
      error: "이메일과 비밀번호를 모두 입력해 주세요.",
    });
  });

  it("email이 빈 문자열이면 에러를 반환한다", async () => {
    mockSupabaseAuth();
    const formData = buildFormData({
      email: "",
      password: "password123",
    });

    const result = await authenticate({ error: null }, formData);

    expect(result).toEqual({
      error: "이메일과 비밀번호를 모두 입력해 주세요.",
    });
  });

  it("password가 빈 문자열이면 에러를 반환한다", async () => {
    mockSupabaseAuth();
    const formData = buildFormData({
      email: "test@example.com",
      password: "",
    });

    const result = await authenticate({ error: null }, formData);

    expect(result).toEqual({
      error: "이메일과 비밀번호를 모두 입력해 주세요.",
    });
  });

  describe("intent === signup", () => {
    it("signUp을 호출한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signUp.mockResolvedValue({ error: null });
      const formData = buildFormData({
        intent: "signup",
        email: "test@example.com",
        password: "password123",
      });

      await authenticate({ error: null }, formData);

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("user_already_exists 에러는 전용 메시지를 반환한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signUp.mockResolvedValue({
        error: { code: "user_already_exists" },
      });
      const formData = buildFormData({
        intent: "signup",
        email: "test@example.com",
        password: "password123",
      });

      const result = await authenticate({ error: null }, formData);

      expect(result).toEqual({
        error: "이미 가입된 이메일이에요. 로그인해 주세요.",
      });
    });

    it("weak_password 에러는 전용 메시지를 반환한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signUp.mockResolvedValue({
        error: { code: "weak_password" },
      });
      const formData = buildFormData({
        intent: "signup",
        email: "test@example.com",
        password: "123",
      });

      const result = await authenticate({ error: null }, formData);

      expect(result).toEqual({
        error: "비밀번호는 6자 이상이어야 해요.",
      });
    });

    it("그 외 에러 코드는 일반 실패 메시지를 반환한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signUp.mockResolvedValue({
        error: { code: "some_other_error" },
      });
      const formData = buildFormData({
        intent: "signup",
        email: "test@example.com",
        password: "password123",
      });

      const result = await authenticate({ error: null }, formData);

      expect(result).toEqual({
        error: "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
    });

    it("성공 시 revalidatePath와 redirect(/dashboard)를 호출한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signUp.mockResolvedValue({ error: null });
      const formData = buildFormData({
        intent: "signup",
        email: "test@example.com",
        password: "password123",
      });

      await authenticate({ error: null }, formData);

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("intent가 signup이 아닐 때 (로그인)", () => {
    it("signInWithPassword를 호출한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });
      const formData = buildFormData({
        email: "test@example.com",
        password: "password123",
      });

      await authenticate({ error: null }, formData);

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });

    it("invalid_credentials 에러는 전용 메시지를 반환한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signInWithPassword.mockResolvedValue({
        error: { code: "invalid_credentials" },
      });
      const formData = buildFormData({
        email: "test@example.com",
        password: "wrong-password",
      });

      const result = await authenticate({ error: null }, formData);

      expect(result).toEqual({
        error: "이메일 또는 비밀번호가 올바르지 않아요.",
      });
    });

    it("그 외 에러 코드는 일반 실패 메시지를 반환한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signInWithPassword.mockResolvedValue({
        error: { code: "some_other_error" },
      });
      const formData = buildFormData({
        email: "test@example.com",
        password: "password123",
      });

      const result = await authenticate({ error: null }, formData);

      expect(result).toEqual({
        error: "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
    });

    it("성공 시 revalidatePath와 redirect(/dashboard)를 호출한다", async () => {
      const mockAuth = mockSupabaseAuth();
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });
      const formData = buildFormData({
        email: "test@example.com",
        password: "password123",
      });

      await authenticate({ error: null }, formData);

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });
  });
});

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("data.claims가 있으면 signOut을 호출한다", async () => {
    const mockAuth = mockSupabaseAuth();
    mockAuth.getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } } });

    await logout();

    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("data.claims가 없으면 signOut을 호출하지 않는다", async () => {
    const mockAuth = mockSupabaseAuth();
    mockAuth.getClaims.mockResolvedValue({ data: { claims: null } });

    await logout();

    expect(mockAuth.signOut).not.toHaveBeenCalled();
  });

  it("항상 revalidatePath와 redirect(/login)를 호출한다", async () => {
    const mockAuth = mockSupabaseAuth();
    mockAuth.getClaims.mockResolvedValue({ data: { claims: null } });

    await logout();

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
