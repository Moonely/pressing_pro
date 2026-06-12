# Architecture Multi-tenant — Front-end

Le frontend est conçu comme une plateforme **SaaS multi-tenant** prête à
être branchée sur un backend **NestJS + TypeScript + PostgreSQL + Prisma**.

## Résolution du tenant

Ordre de résolution au boot (`src/routes/TenantResolver.tsx`) :

1. **Query string** `?tenant=<slug>` — utile en preview sans wildcard DNS.
2. **Sous-domaine** `https://<slug>.app.example.com` (`src/lib/tenant.ts`).
3. **Tenant persisté** dans `useTenantStore` (localStorage).
4. **Fallback** : premier tenant disponible pour l'utilisateur.

Hosts réservés (jamais traités comme un slug) : `localhost`, `www`,
`admin`, `app`, `lovable.app` — voir `RESERVED_HOSTS` dans `constants/`.

## JWT & contrat backend

Le JWT émis par NestJS doit contenir :

```ts
{ sub, email, role: "SUPER_ADMIN" | "TENANT_ADMIN" | "EMPLOYEE", tenantId: string | null }
```

`src/lib/api-client.ts` injecte automatiquement :

- `Authorization: Bearer <accessToken>`
- `X-Tenant-Id: <activeTenantId>` (lu via `getActiveTenantId()`)

Le backend doit vérifier que `jwt.tenantId === header['X-Tenant-Id']`
(sauf pour `SUPER_ADMIN`).

## RBAC

- `src/lib/rbac.ts` : map `ROLE_PERMISSIONS` à mirrorer dans NestJS
  (`@Permissions(...)` decorator).
- `src/hooks/usePermissions.ts` : `can("order:write")`, `is("TENANT_ADMIN")`.
- `src/routes/RequireRole.tsx` : guard de route (`<Route element={<RequireRole roles="SUPER_ADMIN" />}>`).
- La sidebar et la topbar masquent automatiquement les éléments sans permission.

## Isolation des données

Toutes les entités implémentent `TenantScoped` (`{ tenantId: string }`).
Côté mock, l'accès passe **uniquement** par `scoped.clients(tenantId)`,
`scoped.orders(tenantId)`, etc. (voir `src/lib/mock-db.ts`). Côté Prisma,
chaque modèle doit avoir une colonne `tenantId` indexée et toutes les
requêtes doivent inclure `where: { tenantId }` (ou via RLS Postgres).

## Comptes de démo

| Email | Rôle | Tenant |
|---|---|---|
| `super@pressingpro.com` | `SUPER_ADMIN` | Tous |
| `admin@pressingpro.com` | `TENANT_ADMIN` | Pressing Dakar |
| `admin.thies@pressingpro.com` | `TENANT_ADMIN` | Pressing Thiès |
| `employe@pressingpro.com` | `EMPLOYEE` | Pressing Dakar |

Mot de passe : `demo1234`.

## Endpoints NestJS attendus

```
POST   /auth/login                → { accessToken, refreshToken, user, tenants }
POST   /auth/refresh
GET    /tenants                   (SUPER_ADMIN)
GET    /me/tenants                tenants accessibles à l'utilisateur

# Tenant-scoped (header X-Tenant-Id requis)
GET    /clients                   ?search&page&pageSize
POST   /clients
PATCH  /clients/:id
GET    /clients/:id/orders

GET    /orders                    ?search&status&page&pageSize
POST   /orders
GET    /orders/:id
PATCH  /orders/:id/status

GET    /payments
POST   /payments
GET    /payments/summary

GET    /machines
POST   /machines/:id/start
POST   /machines/:id/stop

GET    /dashboard/stats
GET    /stats/advanced
```

## Passage du mock au backend

1. Définir `VITE_API_URL=https://api.example.com` dans `.env`.
2. Remplacer le corps de chaque `*.service.ts` par des appels
   `apiClient.get/post(...)` — la signature des fonctions est déjà alignée
   avec les endpoints REST ci-dessus.
3. Le header tenant et le JWT sont déjà injectés par l'intercepteur Axios.
