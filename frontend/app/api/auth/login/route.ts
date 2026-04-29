// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.GOLANG_API_URL!;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const setCookie = res.headers.get("set-cookie");

  const response = NextResponse.json(data, { status: res.status });
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  }
  return response;
}
