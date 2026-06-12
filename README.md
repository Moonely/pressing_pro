# PressingPro

Logiciel SaaS de gestion de pressing : clients, commandes, paiements, machines, statistiques, tickets imprimables.

## Architecture

```
.
├── src/                  # Frontend React 19 + Vite + TS
├── backend/              # API Spring Boot 3 (Java 21)
├── Dockerfile            # Image frontend (nginx)
├── nginx.conf            # Reverse proxy /api → backend
├── docker-compose.yml    # Stack complète (front + back + Postgres)
└── .github/workflows/    # CI / CD
```

## Stack
- **Front** : React 19, TypeScript, Vite 7, React Router DOM, TanStack Query, Axios, Zustand, Tailwind v4, shadcn/ui, React Hook Form, Zod, Recharts, jsPDF
- **Back** : Spring Boot 3.3, Spring Security + JWT, JPA, PostgreSQL
- **Infra** : Docker multi-stage, nginx, GitHub Actions

## Démarrage rapide

### Dév (front uniquement, mock data)
```bash
bun install
bun run dev
```
→ http://localhost:8080

### Stack complète (Docker)
```bash
cp .env.example .env
docker compose up -d --build
```
- Front : http://localhost:8080
- API   : http://localhost:9090/api
- DB    : localhost:5432

## Comptes de démo (mock)
- `admin@pressingpro.com` / `demo1234` — Admin
- `employe@pressingpro.com` / `demo1234` — Employé

## Branchement Spring Boot
1. Définir `VITE_API_URL` (par défaut `/api`, proxy via nginx).
2. Remplacer les `*.service.ts` mock par des appels `apiClient` réels.
3. Les contrats attendus sont décrits dans [`backend/README.md`](./backend/README.md).

## Impression de tickets
Chaque commande dispose de deux modes d'impression depuis sa fiche :
- **Ticket PDF** — génère un reçu thermique 80 mm téléchargeable (jsPDF).
- **Imprimer** — ouvre la boîte d'impression navigateur avec la mise en page CSS dédiée.

## CI / CD
GitHub Actions exécute à chaque push :
1. Lint + build frontend (Bun)
2. Tests + package backend (Maven)
3. Build & push des images Docker vers GHCR (sur `main`)
4. Étape de déploiement (à compléter selon la cible : VPS, K8s, etc.)
