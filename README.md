# Ecommerce Fullstack (React + .NET + PostgreSQL)

A fullstack ecommerce MVP built with:

- **Backend:** ASP.NET Core Web API (.NET) + EF Core
- **Database:** PostgreSQL (Docker)
- **Frontend:** React + TypeScript (Vite)

## Features

### Store
- Product listing (pagination + search + category filter)
- Product details page
- Cart (saved in LocalStorage)
- Checkout (creates an order in the database)
- Order confirmation (loaded from DB)
- My orders + order details

### Auth
- Register / Login
- JWT authentication
- `/auth/me` endpoint
- Checkout requires login

### Admin
- Admin-only products page:
  - create product
  - edit product
  - activate/deactivate product (soft delete)

---

# Requirements

Install:

- **.NET SDK**
- **Node.js**
- **Docker Desktop**

---

# Run locally

## 1) Start PostgreSQL (Docker)

From the repo root:

```bash
cd backend
docker-compose up -d
```

Confirm DB container is running:

```bash
docker ps
```

## 2) Run backend API

```bash
cd backend
dotnet run --project src/Ecommerce.Api
```

Swagger:

```bash
http://localhost:5076/swagger
```

## 3) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```bash
http://localhost:5173
```

---

# Configuration

Backend uses this connection string (backend/src/Ecommerce.Api/appsettings.json):

```bash
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=ecommerce;Username=ecommerce;Password=ecommerce"
  }
}
```

---

# Database (psql / inspect data)

Open psql inside the docker container:

```bash
docker exec -it backend-db-1 psql -U ecommerce -d ecommerce
```

## View users:

```bash
select "Id","Email","Role" from "Users" order by "Email";
```

## View orders:

```bash
select "Id","UserId","TotalCents","CreatedAtUtc"
from "Orders"
order by "CreatedAtUtc" desc;
```

## View order items:

```bash
select "OrderId","ProductId","ProductName","Quantity","UnitPriceCents"
from "OrderItems"
order by "OrderId";
```

Exit:
```bash
\q
```

---

# Make a user Admin

```bash
docker exec -it backend-db-1 psql -U ecommerce -d ecommerce

update "Users" set "Role" = 'Admin' where "Email" = 'your@email.com';
select "Email","Role" from "Users" where "Email" = 'your@email.com';
\q
```

---

# API endpoints (high-level)

Public
	•	GET /products
	•	GET /products/{id}
	•	GET /categories

Auth
	•	POST /auth/register
	•	POST /auth/login
	•	GET /auth/me

Orders (auth required)
	•	POST /orders
	•	GET /orders
	•	GET /orders/{id}

Admin (admin role required)
	•	GET /admin/products
	•	POST /admin/products
	•	PUT /admin/products/{id}