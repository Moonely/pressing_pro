import { RESERVED_HOSTS } from "@/constants";

/**
 * Resolve a tenant slug from the current host.
 * Supports `pressing-dakar.app.example.com` and `pressing-dakar.localhost`.
 * Returns null when the host is reserved (admin / www / preview / localhost root).
 */
export function resolveTenantSlugFromHost(host = window.location.hostname): string | null {
  if (!host) return null;
  // Strip port
  const clean = host.split(":")[0];
  if (RESERVED_HOSTS.has(clean)) return null;

  const parts = clean.split(".");
  // localhost case: <slug>.localhost
  if (parts.length === 2 && parts[1] === "localhost") {
    return RESERVED_HOSTS.has(parts[0]) ? null : parts[0];
  }
  // Need at least 3 parts to have a sub-domain (slug.app.tld)
  if (parts.length < 3) return null;
  const slug = parts[0];
  return RESERVED_HOSTS.has(slug) ? null : slug;
}

/**
 * Read URL `?tenant=...` override — useful for previews where wildcard
 * DNS is not available.
 */
export function resolveTenantSlugFromQuery(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("tenant");
}
