# PressingPro · Backend Spring Boot

API REST consommée par le front React/Vite.

## Stack
- Java 21 · Spring Boot 3.3
- Spring Web · Data JPA · Security · Validation · Actuator
- PostgreSQL (prod) · H2 (dev)
- JWT (jjwt 0.12)
- Maven

## Endpoints attendus par le front
Le front appelle ces routes via `VITE_API_URL` (proxy nginx `/api` → `backend:8080`).

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ user, accessToken, refreshToken }` |
| POST | `/api/auth/logout` | invalide la session courante |
| GET  | `/api/clients` | liste paginée (`?page=&size=&q=`) |
| POST | `/api/clients` | crée un client |
| PUT  | `/api/clients/{id}` | met à jour |
| DELETE | `/api/clients/{id}` | supprime |
| GET  | `/api/orders` | liste (`?status=&q=`) |
| GET  | `/api/orders/{id}` | détail |
| POST | `/api/orders` | crée une commande |
| PATCH | `/api/orders/{id}/status` | change le statut |
| POST | `/api/orders/{id}/payments` | encaisse un paiement |
| GET  | `/api/payments` | liste filtrable |
| GET  | `/api/machines` | état temps réel |
| GET  | `/api/dashboard/summary` | KPIs |
| GET  | `/api/stats` | statistiques avancées |

## Démarrage local
```bash
./mvnw spring-boot:run
```

## Build
```bash
./mvnw -DskipTests package
```

## Docker
Voir le `docker-compose.yml` racine : `docker compose up -d`.
