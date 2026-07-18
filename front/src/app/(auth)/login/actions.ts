"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error: string | null;
};

export async function authenticate(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const intent = formData.get("intent");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      if (error.code === "user_already_exists") {
        return { error: "이미 가입된 이메일이에요. 로그인해 주세요." };
      }
      if (error.code === "weak_password") {
        return { error: "비밀번호는 6자 이상이어야 해요." };
      }
      return { error: "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요." };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.code === "invalid_credentials") {
        return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
      }
      return { error: "로그인에 실패했어요. 잠시 후 다시 시도해 주세요." };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
