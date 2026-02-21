# TikTok Live Assistant

Ứng dụng quản lý và theo dõi TikTok Live streams với dashboard admin console để thống kê phiên livestream, quản lý kết nối và channels.

## 📋 Tổng quan

TikTok Live Assistant là một ứng dụng full-stack cho phép:
- Kết nối và theo dõi TikTok Live streams
- Thu thập và lưu trữ chat messages từ livestreams
- Quản lý nhiều channels đồng thời
- Dashboard admin để xem thống kê và quản lý sessions
- Xác thực người dùng qua Google OAuth

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM cho PostgreSQL
- **PostgreSQL** - Database chính
- **Redis** - Caching và queue management
- **BullMQ** - Queue processing cho chat messages
- **TikTok Live Connector** - Kết nối với TikTok Live API

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool và dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Google OAuth** - Authentication

## 📁 Cấu trúc dự án

```
tbl-tiktok-assistant/
├── backend/          # NestJS backend application
│   ├── src/
│   │   ├── tiktok-live/    # TikTok Live module
│   │   ├── database/        # Database configuration
│   │   └── redis/          # Redis configuration
│   └── package.json
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React Context
│   └── package.json
└── docs/             # Documentation
    ├── installation.md
    ├── features.md
    └── architecture.md
```

## 🏃 Quick Start

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd tbl-tiktok-assistant
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Cấu hình environment variables
npm run start:dev
```

Backend sẽ chạy tại `http://localhost:3000`
API docs (Swagger) tại `http://localhost:3000/api-docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Thêm Google OAuth Client ID
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## 📚 Documentation

Chi tiết hướng dẫn và thông tin về ứng dụng:

- **[Installation Guide](docs/installation.md)** - Hướng dẫn cài đặt chi tiết
- **[Features](docs/features.md)** - Mô tả đầy đủ các tính năng
- **[Architecture](docs/architecture.md)** - Kiến trúc và tech stack chi tiết

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=tiktok_live
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🎯 Tính năng chính

- ✅ Kết nối với TikTok Live streams
- ✅ Theo dõi và lưu trữ livestream sessions
- ✅ Thu thập chat messages real-time
- ✅ Quản lý nhiều channels đồng thời
- ✅ Dashboard với thống kê tổng quan
- ✅ Google OAuth authentication
- ✅ Auto-retry cho connections
- ✅ Queue processing cho chat messages

## 🛠️ Development

### Backend Commands
```bash
npm run start:dev    # Development mode với hot reload
npm run build        # Build production
npm run start:prod   # Run production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Commands
```bash
npm run dev          # Development server
npm run build        # Build production
npm run preview      # Preview production build
```

## 📝 API Endpoints

### TikTok Live
- `GET /tiktok/status` - Trạng thái kết nối
- `GET /tiktok/sessions` - Danh sách sessions
- `GET /tiktok/sessions/:id/chats` - Chat messages của session
- `GET /tiktok/channels` - Danh sách channels
- `GET /tiktok/connections` - Active connections
- `POST /tiktok/connections` - Kết nối channel
- `DELETE /tiktok/connections/:username` - Ngắt kết nối

### Authentication (Cần implement)
- `POST /auth/google` - Đăng nhập bằng Google OAuth

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- TikTok Live Connector library
- NestJS framework
- React community
