# Hướng dẫn Cài đặt

Hướng dẫn chi tiết để cài đặt và chạy TikTok Live Assistant trên môi trường local.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x
- **Redis**: >= 6.x
- **npm** hoặc **yarn**
- **Git**

## 🔧 Cài đặt Backend

### 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình Database (PostgreSQL)

#### Tạo database
```sql
CREATE DATABASE tiktok_live;
```

#### Cấu hình connection trong `.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=tiktok_live
```

### 3. Cấu hình Redis

Đảm bảo Redis đang chạy trên máy local:

```bash
# Kiểm tra Redis
redis-cli ping
# Kết quả: PONG
```

Cấu hình trong `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=tiktok_live

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (nếu sử dụng authentication)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 5. Chạy Migrations

TypeORM sẽ tự động tạo tables khi ứng dụng khởi động lần đầu. Nếu cần chạy migrations thủ công:

```bash
npm run typeorm migration:run
```

### 6. Khởi động Backend

```bash
# Development mode (với hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend sẽ chạy tại `http://localhost:3000`
Swagger API docs tại `http://localhost:3000/api-docs`

## 🎨 Cài đặt Frontend

### 1. Cài đặt Dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình Google OAuth

#### Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Google+ API**
4. Vào **Credentials** → **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. Thêm **Authorized JavaScript origins**:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (nếu cần)
7. Copy **Client ID**

#### Cấu hình trong `.env`

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 3. Khởi động Frontend

```bash
# Development mode
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

Frontend sẽ chạy tại `http://localhost:5173`

## 🐳 Docker Setup (Optional)

### Backend với Docker Compose

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tiktok_live
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Chạy:
```bash
docker-compose up -d
```

## ✅ Kiểm tra Cài đặt

### Backend
1. Truy cập `http://localhost:3000/api-docs` - Swagger UI sẽ hiển thị
2. Kiểm tra database connection:
```bash
# Trong PostgreSQL
\c tiktok_live
\dt  # Liệt kê tables
```

### Frontend
1. Truy cập `http://localhost:5173`
2. Trang login sẽ hiển thị với nút "Đăng nhập bằng Google"
3. Kiểm tra console browser để đảm bảo không có lỗi

## 🔍 Troubleshooting

### Backend không kết nối được Database
- Kiểm tra PostgreSQL đang chạy: `pg_isready`
- Kiểm tra credentials trong `.env`
- Kiểm tra firewall/port 5432

### Backend không kết nối được Redis
- Kiểm tra Redis đang chạy: `redis-cli ping`
- Kiểm tra port 6379 không bị block
- Kiểm tra `REDIS_HOST` và `REDIS_PORT` trong `.env`

### Frontend không gọi được API
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra CORS được cấu hình ở backend
- Kiểm tra backend đang chạy tại port đúng

### Google OAuth không hoạt động
- Kiểm tra Client ID đúng trong `.env`
- Kiểm tra Authorized JavaScript origins trong Google Cloud Console
- Kiểm tra backend có endpoint `/auth/google`

## 📝 Next Steps

Sau khi cài đặt thành công:
1. Xem [Features](features.md) để hiểu các tính năng
2. Xem [Architecture](architecture.md) để hiểu kiến trúc hệ thống
3. Bắt đầu sử dụng ứng dụng!
