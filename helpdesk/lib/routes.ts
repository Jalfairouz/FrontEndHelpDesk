export type Role = "Admin" | "Technician" | "Employee";

export const ROLES: readonly Role[] = ["Admin", "Technician", "Employee"];

export const TOKEN_COOKIE = "token";
export const HOME_ROUTE = "/dashboard";
export const LOGIN_ROUTE = "/login";

export const PUBLIC_ROUTES = ["/", "/login", "/register"];
export const AUTH_PAGES = ["/login", "/register"];

const ROUTE_RULES: { pattern: RegExp; roles: Role[] }[] = [
  { pattern: /^\/admin(\/|$)/, roles: ["Admin"] },
  { pattern: /^\/tickets\/create$/, roles: ["Employee", "Admin"] },
  { pattern: /^\/tickets\/[^/]+\/assign$/, roles: ["Admin"] },
  { pattern: /^\/tickets\/[^/]+\/solve$/, roles: ["Technician", "Admin"] },
  { pattern: /^\/tickets\/[^/]+\/edit$/, roles: ["Technician", "Admin"] },
];

function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(normalize(pathname));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(normalize(pathname));
}

export function allowedRoles(pathname: string): Role[] | null {
  const path = normalize(pathname);
  return ROUTE_RULES.find((rule) => rule.pattern.test(path))?.roles ?? null;
}