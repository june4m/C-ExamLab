# PiedTeam C Exam

Hệ thống quản lý thi trực tuyến cho học viên tại PiedTeam.

## Tổng quan

Hệ thống hỗ trợ mentor quản lý ca thi, câu hỏi, test case và chấm bài tự động cho bài kiểm tra "Cá chép vượt vũ môn". Giúp giảm tải công việc chấm bài thủ công và nâng cao trải nghiệm học tập.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React 19, TailwindCSS |
| Backend | Elysia.JS, Bun |
| Database | MySQL |

## Cấu trúc thư mục

```
├── BE/          # Backend (Elysia.JS)
├── fe/          # Frontend (Next.js)
├── DB/          # Database scripts
└── asset/       # Assets
```

## Yêu cầu hệ thống

- Node.js v18+
- Bun (cho Backend)
- MySQL

## Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd PiedTeam-C-Exam
```

### 2. Cấu hình Database

Import các file SQL trong thư mục `DB/` vào MySQL.

### 3. Chạy Backend

```bash
cd BE
bun install
# Tạo file .env và cấu hình database
bun run dev
```

### 4. Chạy Frontend

```bash
cd fe
npm install
# Tạo file .env.local và cấu hình API endpoint
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

## Biến môi trường

### Backend (BE/.env)

```env
DATABASE_URL=mysql://user:password@localhost:3306/piedteam
JWT_SECRET=your-secret-key
```

### Frontend (fe/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Chức năng chính

### Admin/Mentor
- CRUD phòng thi, câu hỏi, test case
- Quản lý danh sách thí sinh
- Giám sát thi trực tiếp
- Xem và xuất kết quả

### Học sinh
- Tham gia phòng thi
- Làm bài trên IDE web
- Xem kết quả và lịch sử

### Hệ thống
- Chấm bài tự động (sandbox)
- Gửi thông báo lịch thi
- Phát hiện gian lận

## Build Production

```bash
# Frontend
cd fe
npm run build
npm run start

# Backend
cd BE
bun run src/index.ts
```

## Team

PiedTeam - TNHH Lập Trình PiedTeam
