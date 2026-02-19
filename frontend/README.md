# TikTok Live Assistant - Frontend

React admin dashboard để quản lý và thống kê TikTok Live sessions.

## Tính năng

- 🔐 Đăng nhập bằng Google OAuth
- 📊 Dashboard với thống kê tổng quan
- 📹 Quản lý Live Sessions
- 🔌 Quản lý Connections
- 👥 Quản lý Channels
- 🎨 Theme đen và xanh lá

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình các biến môi trường trong `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Lấy Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID
5. Thêm authorized JavaScript origins: `http://localhost:5173`
6. Copy Client ID vào file `.env`

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build cho production

```bash
npm run build
```

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/      # Các component tái sử dụng
│   │   ├── Auth/       # Authentication components
│   │   ├── Dashboard/  # Dashboard components
│   │   └── Layout/     # Layout components
│   ├── context/        # React Context
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Các trang chính
│   ├── services/       # API services
│   └── utils/          # Utilities
├── public/             # Static files
└── package.json
```

## Lưu ý

- Backend cần có endpoint `POST /auth/google` để xác thực Google OAuth token
- Backend cần cấu hình CORS để cho phép frontend gọi API
- Google OAuth redirect URIs cần được cấu hình trong Google Cloud Console
