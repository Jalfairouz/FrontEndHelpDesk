const TOKEN_KEY = "token";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

const USER_ID_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export interface DecodedToken {
  sub?: string;
  email?: string;
  exp: number;
  [key: string]: unknown;
}

/**
 * Save token for:
 * 1. localStorage -> API requests
 * 2. Cookie -> middleware authentication
 */
export function saveToken(token: string): void {
  if (typeof window === "undefined") return;

  // Used by client-side API requests
  localStorage.setItem(TOKEN_KEY, token);

  // Used by Next.js middleware
  const isSecure = window.location.protocol === "https:";

  document.cookie = [
    `${TOKEN_KEY}=${encodeURIComponent(token)}`,
    "path=/",
    "max-age=604800",
    "samesite=lax",
    isSecure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Get token for client-side API requests
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);

  document.cookie =
    `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get user roles
 */
export function getRoles(decoded: DecodedToken): string[] {
  const raw = decoded[ROLE_CLAIM] ?? decoded.role;

  if (!raw) {
    return [];
  }

  return Array.isArray(raw)
    ? (raw as string[])
    : [raw as string];
}

/**
 * Get user email
 */
export function getEmail(
  decoded: DecodedToken
): string | null {
  return (
    (decoded[EMAIL_CLAIM] as string) ??
    (decoded.email as string) ??
    null
  );
}

/**
 * Get user ID
 */
export function getUserId(
  decoded: DecodedToken
): string | null {
  return (
    (decoded[USER_ID_CLAIM] as string) ??
    (decoded.sub as string) ??
    null
  );
}

/**
 * Get primary user role
 */
export function getRole(
  decoded: DecodedToken
): string | null {
  return (
    (decoded[ROLE_CLAIM] as string) ??
    (decoded.role as string) ??
    null
  );
}
