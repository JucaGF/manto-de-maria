import { NextResponse } from "next/server";

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function errorResponse(
  message: string,
  status: number,
  retryAfterSeconds?: number,
) {
  const headers =
    retryAfterSeconds === undefined
      ? undefined
      : { "retry-after": String(retryAfterSeconds) };

  return NextResponse.json({ message }, { status, headers });
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
