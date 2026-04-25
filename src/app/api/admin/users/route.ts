import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? (err.statusCode as number)
        : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? (err.statusCode as number)
        : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  let body: { username?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username, password, role } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length === 0) {
    return NextResponse.json(
      { error: "Username cannot be empty" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { username: trimmedUsername },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Username already exists" },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      username: trimmedUsername,
      passwordHash,
      role: role === "admin" ? "admin" : "user",
    },
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user: newUser }, { status: 201 });
}
