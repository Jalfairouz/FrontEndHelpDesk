import { decodeToken, getEmail, getRole, getUserId, isTokenExpired } from "./jwt";
import { TOKEN_COOKIE, type Role } from "./routes";

export * from "./jwt";

export interface Session {
  token: string;
  userId: string | null;
  email: string | null;
  role: Role;
}
export function saveToken(token: string): void {
  if (typeof window === "undefined") return;

  const decoded = decodeToken(token);
  const secondsLeft = decoded
    ? Math.floor(decoded.exp - Date.now() / 1000)
    : 3600;

  const isSecure = window.location.protocol === "https:";

  document.cookie = [
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    "path=/",
    `max-age=${Math.max(secondsLeft, 0)}`,
    "samesite=lax",
    isSecure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(TOKEN_COOKIE.length + 1));
  } catch {
    return null;
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;

  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;

  try {
    localStorage.removeItem("token");
  } catch {

  }
}

export function getSession(): Session | null {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  const role = decoded ? getRole(decoded) : null;

  if (!decoded || !role || isTokenExpired(decoded)) {
    clearToken();
    return null;
  }

  return {
    token,
    userId: getUserId(decoded),
    email: getEmail(decoded),
    role,
  };
}