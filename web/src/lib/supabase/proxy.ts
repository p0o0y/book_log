import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // createServerClient와 getClaims() 사이에 다른 코드를 넣지 말 것.
  // getClaims()를 제거하면 세션 토큰이 갱신되지 않아
  // 사용자가 무작위로 로그아웃되는 문제가 발생할 수 있음.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // supabaseResponse를 그대로 반환해야 브라우저와 서버의 쿠키가
  // 동기화됨. 새 응답 객체로 교체하면 세션이 조기 종료될 수 있음.
  return supabaseResponse;
}
