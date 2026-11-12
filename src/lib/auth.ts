import { apiFetch, ApiError } from "@/lib/api";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export async function login(payload: LoginPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/api/v1/auth/logout", { method: "POST" });
  } catch (error) {
    // 401 unauthenticated : l'utilisateur est déjà déconnecté.
    if (error instanceof ApiError && (error.status === 401 || error.slug === "unauthenticated")) {
      return;
    }
    throw error;
  }
}

/**
 * N'accepte qu'un chemin relatif interne commençant par un seul `/`.
 * Protège contre `//evil.com`, `https://evil.com` et les URL absolues.
 */
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  if (next.includes("://")) return null;
  return next;
}

/** Destination après connexion selon le rôle et l'état du profil. */
export function getPostAuthDestination(
  user: AuthUser,
  next?: string | null,
): string {
  const safeNext = sanitizeNextPath(next);
  if (safeNext) return safeNext;

  if (user.role === "delegator") return "/offers";
  if (user.role === "collaborator") {
    return user.profileCompleted ? "/dashboard" : "/dashboard/profile";
  }
  return "/dashboard";
}

/** Destination après inscription : collaborateur → profil, délégué → offres. */
export function getPostRegisterDestination(user: AuthUser | null): string {
  if (user?.role === "delegator") return "/offers";
  return "/dashboard/profile";
}
