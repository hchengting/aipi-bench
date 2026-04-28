import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, sessionCookieString } from "@/lib/auth";
import { isRateLimited, recordFailure, clearRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const rateLimit = isRateLimited(clientIp);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      recordFailure(clientIp);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordFailure(clientIp);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    clearRateLimit(clientIp);
    const token = await createSession(user.id);
    const response = NextResponse.json({ success: true, role: user.role });
    response.headers.set("Set-Cookie", sessionCookieString(token));
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
