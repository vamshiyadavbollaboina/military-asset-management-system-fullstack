
#  Military Asset Management System

A full-stack **Military Asset Management System** designed to manage military equipment, purchases, transfers, personnel assignments, expenditures, bases, users, and audit activities through a secure web-based dashboard.

The system provides role-based access for:

-  Admin
-  Base Commander
-  Logistics Officer

The application is built using **React.js, Node.js, Express.js, PostgreSQL, Prisma ORM, and JWT-based authentication**.

---

## Live Application

### Frontend

https://military-asset-management-system-fu.vercel.app/

### Backend API

https://military-asset-management-system-ykub.onrender.com/

---


# Project Overview

The Military Asset Management System provides a centralized platform for managing military assets across multiple bases.

The system allows authorized users to:

- Manage military bases
- Manage equipment types
- Record asset purchases
- Transfer assets between bases
- Assign assets to personnel
- Record asset expenditures
- Monitor inventory
- View dashboard statistics
- Track system activities through audit logs
- Authenticate users securely using JWT
- Control access using role-based authorization

The application uses a REST API architecture where the React frontend communicates with the Express backend through Axios.

---

# Key Features

## Authentication

- Secure login system
- JWT authentication
- Password hashing
- Protected routes
- Role-based authorization
- Session/token management

---

## Dashboard

The dashboard provides an overview of the military asset system.

It displays:

- Total bases
- Total equipment
- Purchase statistics
- Transfer statistics
- Assignment statistics
- Expenditure statistics
- Recent system activity

---

## Base Management

Administrators can manage military bases.

Each base contains:

- Base name
- Location
- Created date
- Updated date

Example:

```text
Alpha Base
Location: Hyderabad
````

---

## Equipment Management

The system supports different equipment categories:

* Weapons
* Vehicles
* Ammunition

Equipment types are stored centrally and can be associated with purchases, transfers, assignments, and expenditures.

---

## Purchases

Users with appropriate permissions can record asset purchases.

Purchase information includes:

* Base
* Equipment type
* Quantity
* Purchase date
* User who created the purchase

---

## Asset Transfers

Assets can be transferred between military bases.

Transfer information includes:

* Source base
* Destination base
* Equipment type
* Quantity
* Transfer date
* Initiating user

---

## Personnel Assignments

Military assets can be assigned to personnel.

Assignment information includes:

* Base
* Equipment type
* Personnel name
* Quantity
* Assignment date

---

## Expenditures

The system allows users to record consumed or expended assets.

Examples:

```text
Training
Operation
Damage
Maintenance
```

Each expenditure contains:

* Base
* Equipment type
* Quantity
* Reason
* Expenditure date
* Recorded by

---

## Audit Logs

Important system activities are tracked through audit logs.

Supported actions include:

```text
LOGIN
PURCHASE
TRANSFER
ASSIGNMENT
EXPENDITURE
CREATE
UPDATE
DELETE
```

---

# Architecture

The application follows a **3-tier full-stack architecture**.

```text
                    ┌──────────────────────────┐
                    │        User / Browser    │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTPS
                                 ▼
                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │                          │
                    │  React.js               │
                    │  React Router           │
                    │  Axios                  │
                    │  Tailwind CSS           │
                    │  Context API             │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API / JSON
                                 ▼
                    ┌──────────────────────────┐
                    │     Express Backend      │
                    │                          │
                    │  Node.js                │
                    │  Express.js             │
                    │  JWT Authentication     │
                    │  Role Authorization     │
                    │  REST APIs              │
                    └────────────┬─────────────┘
                                 │
                                 │ Prisma ORM
                                 ▼
                    ┌──────────────────────────┐
                    │       PostgreSQL         │
                    │                          │
                    │  Users                   │
                    │  Bases                   │
                    │  Equipment Types         │
                    │  Purchases               │
                    │  Transfers               │
                    │  Assignments             │
                    │  Expenditures            │
                    │  Audit Logs              │
                    └──────────────────────────┘
```

---

# System Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
JWT Authentication
 │
 ▼
Role Verification
 │
 ├───────────────┐
 │               │
 ▼               ▼
Admin       Base Commander
 │               │
 │               │
 └───────┬───────┘
         │
         ▼
      Dashboard
         │
         ▼
 REST API
         │
         ▼
 Express Server
         │
         ▼
 Prisma ORM
         │
         ▼
 PostgreSQL
```

---

# Technology Stack

## Frontend

| Technology       | Purpose                |
| ---------------- | ---------------------- |
| React.js         | User interface         |
| React Router DOM | Routing                |
| Axios            | API communication      |
| Tailwind CSS     | Styling                |
| Vite             | Development/build tool |

---

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express.js | REST API                  |
| Prisma     | ORM                       |
| PostgreSQL | Database                  |
| JWT        | Authentication            |
| bcrypt     | Password hashing          |
| CORS       | Cross-origin requests     |

---

## Deployment

| Service    | Purpose             |
| ---------- | ------------------- |
| Vercel     | Frontend hosting    |
| Render     | Backend hosting     |
| PostgreSQL | Production database |

---

# Project Structure

```text
military-asset-management-system/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Purchases.jsx
│   │   │   ├── Transfers.jsx
│   │   │   ├── Assignments.jsx
│   │   │   ├── Expenditures.jsx
│   │   │   ├── EquipmentTypes.jsx
│   │   │   ├── Bases.jsx
│   │   │   └── AuditLogs.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── assignmentApi.js
│   │   │   ├── expenditureApi.js
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── expenditureRoutes.js
│   │   ├── equipmentTypeRoutes.js
│   │   ├── auditRoutes.js
│   │   └── baseRoutes.js
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── utils/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

# Database Architecture

The project uses **PostgreSQL with Prisma ORM**.

Main entities:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           │
                    ┌──────▼───────┐
                    │     Base     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Purchases        Assignments      Expenditures
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                  EquipmentType
                           │
                           ▼
                       Transfers
                           │
                           ▼
                      AuditLogs
```

---

# Database Models

The Prisma schema contains the following models:

```text
User
Base
EquipmentType
Purchase
Transfer
Assignment
Expenditure
AuditLog
```

---

## Base

```text
id
name
location
createdAt
updatedAt
```

---

## User

```text
id
username
passwordHash
role
baseId
createdAt
updatedAt
```

---

## EquipmentType

```text
id
name
category
createdAt
updatedAt
```

Categories:

```text
WEAPON
VEHICLE
AMMUNITION
```

---

## Purchase

```text
id
baseId
equipmentTypeId
quantity
purchaseDate
createdAt
createdById
```

---

## Transfer

```text
id
sourceBaseId
destinationBaseId
equipmentTypeId
quantity
status
transferDate
createdAt
initiatedById
```

---

## Assignment

```text
id
baseId
equipmentTypeId
personnelName
quantity
assignedDate
createdAt
assignedById
```

---

## Expenditure

```text
id
baseId
equipmentTypeId
quantity
reason
expendedDate
createdAt
recordedById
```

---

## AuditLog

```text
id
userId
action
details
createdAt
```

---

# User Roles

The application supports three roles.

## Admin

Admin users have the highest level of access.

Typical responsibilities:

* Manage users
* Manage equipment
* View dashboard
* View audit logs
* Manage purchases
* Manage transfers
* Manage assignments
* Manage expenditures

---

##  Base Commander

Base Commanders manage assets associated with their assigned base.

Typical responsibilities:

* View base inventory
* Manage assignments
* Record expenditures
* View transfers
* Monitor assets

---

## Logistics Officer

Logistics Officers are responsible for logistics operations.

Typical responsibilities:

* Record purchases
* Manage transfers
* Monitor equipment
* Track asset movement

---

#  Authentication

The application uses **JWT-based authentication**.

Authentication flow:

```text
Username + Password
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend validates credentials
        │
        ▼
Password verification
        │
        ▼
JWT generated
        │
        ▼
Frontend stores authentication state
        │
        ▼
Protected API requests
```

---

# API Structure

The backend exposes RESTful APIs under:

```text
/api
```

---

## Authentication

```http
POST /api/auth/login
```

---

## Dashboard

```http
GET /api/dashboard
```

---

## Bases

```http
GET    /api/bases
POST   /api/bases
PUT    /api/bases/:id
DELETE /api/bases/:id
```

---

## Equipment Types

```http
GET    /api/equipment-types
POST   /api/equipment-types
PUT    /api/equipment-types/:id
DELETE /api/equipment-types/:id
```

---

## Purchases

```http
GET  /api/purchases
POST /api/purchases
```

---

## Transfers

```http
GET  /api/transfers
POST /api/transfers
```

---

## Assignments

```http
GET  /api/assignments
POST /api/assignments
```

---

## Expenditures

```http
GET  /api/expenditures
POST /api/expenditures
```

---

## Audit Logs

```http
GET /api/audit-logs
```

---

# Screenshots


---

## Login

![Login Page](README-screenshots/login.png)

The login page provides secure authentication for authorized users.

---

## Dashboard

![Dashboard](README-screenshots/dashboard.png)

The dashboard provides an overview of system-wide asset information.

---

## Base Management

![Bases](README-screenshots/bases.png)

Manage military bases and their locations.

---

## Equipment Types

![Equipment Types](README-screenshots/equipment.png)

Manage equipment categories including weapons, vehicles, and ammunition.

---

## Purchases

![Purchases](README-screenshots/purchases.png)

Record and monitor military asset purchases.

---

## Transfers

![Transfers](README-screenshots/transfers.png)

Track asset transfers between different bases.

---

## Assignments

![Assignments](README-screenshots/assignments.png)

Assign assets to military personnel.

---

## Expenditures

![Expenditures](README-screenshots/expenditures.png)

Record assets consumed or expended during operations.

---

## Audit Logs

![Audit Logs](README-screenshots/audit-logs.png)

Monitor important actions performed within the system.

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/vamshiyadavbollaboina/military-asset-management-system-fullstack.git
```

Navigate into the project:

```bash
cd military-asset-management-system-fullstack
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"

JWT_SECRET="your-super-secret-jwt-key"

FRONTEND_URL="http://localhost:5173"

PORT=5000
```

---

# Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

For production:

```bash
npx prisma migrate deploy
```

---

# Start Backend

```bash
npm run dev
```

or:

```bash
npm start
```

Backend will run at:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

# Frontend API Configuration

The frontend communicates with the backend through:

```text
https://military-asset-management-system-ykub.onrender.com/api
```

For local development:

```text
http://localhost:5000/api
```

Example Axios configuration:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "https://military-asset-management-system-ykub.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
```

---

# Test Accounts

The following accounts can be used for testing.

## Admin

```text
Username: admin_user
Password: AdminPass123!
```

## Base Commander

```text
Username: commander_alpha
Password: CommandPass123!
```

## Logistics Officer

```text
Username: logistics_officer
Password: LogisticsPass123!
```


---

# Deployment

## Frontend Deployment

The frontend is deployed using Vercel.

Production URL:

```text
https://military-asset-management-system-fu.vercel.app/
```

---

## Backend Deployment

The backend is deployed using Render.

Production API:

```text
https://military-asset-management-system-ykub.onrender.com/
```

---

## Production Environment Variables

Backend:

```env
DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_production_secret

FRONTEND_URL=https://military-asset-management-system-fu.vercel.app

PORT=5000
```

---

# Security

The application implements several security practices:

* JWT authentication
* Password hashing
* Role-based authorization
* Protected API routes
* CORS configuration
* Environment variables for secrets
* Prisma ORM for database access
* Input validation
* Audit logging

---

# Future Improvements

Possible future enhancements:

* Advanced inventory tracking
* Real-time notifications
* Asset stock calculations
* Low-stock alerts
* Advanced analytics
* Export reports to Excel/PDF
* User management interface
* Pagination
* Search and filtering
* Asset history timeline
* Enhanced audit reporting
* Multi-factor authentication
* Automated backup system
* Real-time dashboard updates

---

# Project Goals

The main goals of this project are:

1. Centralize military asset management.
2. Improve visibility of assets across bases.
3. Track asset movement between bases.
4. Track personnel assignments.
5. Record asset expenditures.
6. Provide role-based access control.
7. Maintain a complete audit trail.
8. Provide a secure and scalable architecture.

---

#  High-Level Data Flow

```text
                    USER
                     │
                     ▼
                LOGIN PAGE
                     │
                     ▼
             Authentication
                     │
                     ▼
                JWT TOKEN
                     │
                     ▼
                DASHBOARD
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
     Purchases    Transfers   Assignments
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
                Expenditures
                     │
                     ▼
                Audit Logs
                     │
                     ▼
               Express API
                     │
                     ▼
                Prisma ORM
                     │
                     ▼
                PostgreSQL
```

---


### Frontend Deployment

```text
Vercel
```

### Backend Deployment

```text
Render
```

### Database

```text
PostgreSQL
```

---

#  Author

**Vamshi Yadav**

GitHub:

[https://github.com/vamshiyadavbollaboina](https://github.com/vamshiyadavbollaboina)

---

# Acknowledgements

This project was developed as a full-stack military asset management application demonstrating:

* REST API development
* React frontend development
* Database design
* Prisma ORM
* Authentication
* Authorization
* Role-based access control
* Production-ready project structure

---

