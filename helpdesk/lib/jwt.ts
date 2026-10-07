import { ROLES, type Role } from "./routes";

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

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    const decoded = JSON.parse(json);

    if (typeof decoded?.exp !== "number") return null;

    return decoded as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 <= Date.now();
}

export function getRoles(decoded: DecodedToken): string[] {
  const raw = decoded[ROLE_CLAIM] ?? decoded.role;
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as string[]) : [String(raw)];
}

export function getRole(decoded: DecodedToken): Role | null {
  const found = getRoles(decoded).find((r) =>
    (ROLES as readonly string[]).includes(r)
  );
  return (found as Role | undefined) ?? null;
}

export function getEmail(decoded: DecodedToken): string | null {
  return (
    (decoded[EMAIL_CLAIM] as string | undefined) ??
    (decoded.email as string | undefined) ??
    null
  );
}

export function getUserId(decoded: DecodedToken): string | null {
  return (
    (decoded[USER_ID_CLAIM] as string | undefined) ??
    (decoded.sub as string | undefined) ??
    null
  );
}