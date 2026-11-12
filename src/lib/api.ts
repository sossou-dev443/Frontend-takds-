import type { ProblemDetails } from "@/types/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "Les données envoyées sont invalides.",
  401: "Vous devez être connecté pour continuer.",
  403: "Vous n’avez pas les droits nécessaires pour effectuer cette action.",
  404: "La ressource demandée est introuvable.",
  409: "Un conflit est survenu avec les données existantes.",
  415: "Le format de la requête n’est pas pris en charge.",
  500: "Une erreur interne est survenue. Veuillez réessayer plus tard.",
};

export type ApiErrorOptions = {
  status: number;
  slug: string;
  message: string;
  problem?: ProblemDetails | null;
  isNetworkError?: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly slug: string;
  readonly problem: ProblemDetails | null;
  readonly isNetworkError: boolean;

  constructor({ status, slug, message, problem = null, isNetworkError = false }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.slug = slug;
    this.problem = problem;
    this.isNetworkError = isNetworkError;
  }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === "object" && value !== null;
}

function slugFromType(type: string | undefined): string {
  if (!type) return "";
  const segments = type.split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Appel HTTP centralisé vers identity-service.
 * Le cookie `taskd_session` est HttpOnly : il est géré par le navigateur via
 * `credentials: "include"` et n'est jamais lu ni stocké en JavaScript.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError({
      status: 0,
      slug: "network-error",
      message:
        "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
      isNetworkError: true,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawBody = await response.text();
  let data: unknown = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const problem = isProblemDetails(data) ? data : null;
    const slug = slugFromType(problem?.type);
    throw new ApiError({
      status: response.status,
      slug,
      message:
        problem?.detail ??
        problem?.title ??
        DEFAULT_MESSAGES[response.status] ??
        "Une erreur est survenue.",
      problem,
    });
  }

  if (data === null) {
    throw new ApiError({
      status: response.status,
      slug: "invalid-response",
      message: "Réponse invalide du serveur.",
    });
  }

  return data as T;
}

/** Extrait les erreurs de champ RFC 9457 (`errors[].field` / `errors[].message`). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};

  const fieldErrors: Record<string, string> = {};
  for (const issue of error.problem?.errors ?? []) {
    if (issue.field && issue.message) {
      fieldErrors[issue.field] = issue.message;
    }
  }

  if (error.slug === "email-already-used" && !fieldErrors.email) {
    fieldErrors.email = "Cette adresse email est déjà utilisée.";
  }

  return fieldErrors;
}

/** Message général en français, piloté par le slug du type puis par le statut. */
export function getGeneralErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Une erreur inattendue est survenue.";
  }

  switch (error.slug) {
    case "validation-error":
      return "Certains champs sont invalides. Vérifiez votre saisie.";
    case "invalid-credentials":
      return "Email ou mot de passe incorrect.";
    case "unauthenticated":
      return "Votre session a expiré. Veuillez vous reconnecter.";
    case "email-already-used":
      return "Cette adresse email est déjà utilisée.";
    case "unsupported-media-type":
      return "Le format de la requête n’est pas pris en charge.";
    case "internal-error":
      return "Une erreur interne est survenue. Veuillez réessayer plus tard.";
    case "network-error":
      return error.message;
    default:
      break;
  }

  if (error.status === 409) {
    return "Cette adresse email est déjà utilisée.";
  }
  if (error.status >= 500) {
    return "Une erreur interne est survenue. Veuillez réessayer plus tard.";
  }

  return error.problem?.detail ?? error.problem?.title ?? error.message;
}
