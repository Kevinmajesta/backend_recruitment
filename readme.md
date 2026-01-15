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
├── docker-compose.yml
├── Dockerfile
├─── README.md
└── postman_collection.json
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

## 📑 API Endpoints List

Semua endpoint kecuali **Auth** memerlukan Header `Authorization: Bearer <JWT_TOKEN>`.

### 1. Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registrasi User & Perusahaan baru |
| **POST** | `/api/auth/login` | Public | Login untuk mendapatkan JWT Token |

### 2. User Management (Multi-Tenancy)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | Admin HR | List semua user di perusahaan yang sama |
| **POST** | `/api/users` | Admin HR | Menambah user baru ke perusahaan |
| **GET** | `/api/users/:id` | Admin HR | Detail user (Isolasi data aktif) |
| **DELETE** | `/api/users/:id` | Admin HR | Menghapus user dari perusahaan |

### 3. Job Positions
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/positions` | HR / Applicant | List lowongan (Hanya milik perusahaan user) |
| **POST** | `/api/positions` | Admin HR | Membuat lowongan kerja baru |
| **GET** | `/api/positions/:id` | HR / Applicant | Detail lowongan kerja |
| **PUT** | `/api/positions/:id` | Admin HR | Update data lowongan |
| **DELETE** | `/api/positions/:id` | Admin HR | Menghapus lowongan kerja |

### 4. Applicant Management
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/applicants` | Applicant | Mengirim lamaran pada posisi tertentu |
| **GET** | `/api/applicants` | Admin HR | List semua pelamar di perusahaan tersebut |
| **GET** | `/api/applicants/:id` | Admin HR | Detail data pelamar |

---

## 🛡️ Role-Based Access Control (RBAC)
- **Admin HR**: Memiliki akses penuh untuk mengelola User, Position, dan melihat Applicant di perusahaannya.
- **Applicant**: Hanya memiliki akses untuk melihat daftar lowongan dan mengirim lamaran.
- **Data Isolation**: Sistem secara otomatis memfilter data berdasarkan `companyId` yang tersemat pada JWT Token. User tidak dapat melihat atau memodifikasi data milik perusahaan lain.