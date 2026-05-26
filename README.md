# SoIzi

> Sabemos que o Brasileiro tem o seu jeitinho de fazer as coisas. Nós da **SoIzi** temos o nosso jeitinho de descomplicar transferências internacionais. Que tal conferir?

## Sobre

SoIzi é uma plataforma robusta de transferências internacionais com foco em **educação financeira** e **transparência total**. Cada funcionalidade acompanha o **SoIzi Method**: modais educativos que explicam cada conceito de forma clara e acessível.

## Stack

| Camada         | Tecnologia                              |
| -------------- | --------------------------------------- |
| Backend        | Node.js 22 + Express 5 + TypeScript     |
| Banco de Dados | PostgreSQL 16 + Prisma 7                |
| Cache          | Redis 7                                 |
| Frontend       | React 19 + Vite + TypeScript + Tailwind |
| Testes         | Jest (backend) + Vitest (frontend)      |
| Infraestrutura | Docker + AWS                            |
| CI/CD          | GitHub Actions                          |

## Setup

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- Git

### Instalação

```bash
# Clonar repositório
git clone https://github.com/pecinallib/soizi.git
cd soizi

# Subir banco e cache
docker compose up -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Estrutura

```
soizi/
├── .github/workflows/     # CI/CD
├── backend/
│   ├── prisma/            # Schema e migrations
│   └── src/
│       ├── config/        # Env, DB, Redis
│       ├── middlewares/    # Error handler, auth, rate limit
│       ├── modules/       # Módulos da aplicação
│       │   ├── auth/
│       │   ├── remittance/
│       │   ├── exchange/
│       │   └── explanation/
│       ├── utils/         # Helpers
│       └── types/         # TypeScript types
├── frontend/
├── docker-compose.yml
└── README.md
```
