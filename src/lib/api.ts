"use client"

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }
  return url.replace(/\/$/, "")
}

/**
 * Retrieves a genuine signed JWT from the existing Better Auth backend.
 *
 * Calls GET /api/auth/token with the session cookie (credentials: include).
 * The server's jwt plugin issues this endpoint and responds with
 * { token: "<jwt>" }. Returns null when no valid session exists or the
 * payload is missing/malformed, so callers can surface a sign-in prompt.
 * Token values are never logged.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/token`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === "true") {
        console.warn("[auth] JWT retrieval failed", response.status)
      }
      return null
    }

    const data = (await response.json()) as { token?: unknown }
    const token = data?.token

    if (typeof token !== "string" || token.length === 0) {
      if (process.env.NEXT_PUBLIC_DEBUG_AUTH === "true") {
        console.warn("[auth] JWT payload missing or malformed")
      }
      return null
    }

    return token
  } catch {
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === "true") {
      console.warn("[auth] JWT retrieval error")
    }
    return null
  }
}

export async function apiRequest(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, ...rest } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    ...rest,
    headers,
  })
}
