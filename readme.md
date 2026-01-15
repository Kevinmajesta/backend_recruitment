# Recruitment Management System API  

Backend API ini dibangun untuk sistem **Recruitment Management System** dengan fokus utama pada **Multi-Tenancy**, sehingga setiap perusahaan (tenant) memiliki isolasi data yang aman dan terpisah.

---

## 🎯 Function

- **Multi-Tenancy**  
  Isolasi data antar perusahaan menggunakan `companyId` pada level database, middleware, dan query.

- **Functionality**  
  CRUD API lengkap untuk:
  - User & Authentication
  - Job Position
  - Applicant

- **Code Quality**  
  - Struktur folder modular & scalable  
  - Error handling terpusat  
  - Docker multi-stage build  

- **Security & RBAC**  
  - JWT-based authentication  
  - Role-Based Access Control (Admin HR & Applicant)

- **Documentation**  
  README dan Postman Collection

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose

---

## 🚀 Quick Start

### Prasyarat
Pastikan **Docker Desktop** sudah terpasang dan berjalan.

### 1. Clone Repository
```bash
git clone https://github.com/Kevinmajesta/backend_recruitment.git
cd backend_recruitment
```
### 2. Environment Variable
```bash
DATABASE_URL_DOCKER="postgresql://recrumsbu:recrumsbu@db:5432/recrumsbu?schema=public"
JWT_SECRET="jwtsecretkey"
```
### 3. Build & Jalankan Aplikasi
```bash
docker-compose up --build
```

---

## 📂 Struktur Folder
```bash
.
├── cmd/
│   └── app/
│       └── index.js        # Entry point aplikasi
├── controllers/            # Business logic & error handling
├── middlewares/             # JWT auth & RBAC
├── prisma/                  # Schema & migration
├── routes/                  # API routing
├── docs/
│   └── postman_collection.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```


---

---

## 📂 Struktur Folder

Postman Collection tersedia di:

```bash
Backend_MSBU.postman_collection.json
```

Silakan import file tersebut ke Postman untuk menguji seluruh endpoint secara berurutan.

---