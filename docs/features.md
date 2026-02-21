# Tính năng và Chức năng

Tài liệu mô tả chi tiết các tính năng của TikTok Live Assistant.

## 🎯 Tổng quan

TikTok Live Assistant cung cấp một bộ công cụ hoàn chỉnh để quản lý và theo dõi TikTok Live streams, bao gồm cả backend API và frontend dashboard.

## 🔧 Backend Features

### 1. TikTok Live Connection Management

#### Kết nối với TikTok Live Streams
- Kết nối với nhiều TikTok Live streams đồng thời
- Hỗ trợ kết nối bằng username
- Tự động retry khi kết nối thất bại
- Quản lý trạng thái kết nối (connected, disconnected, waiting_retry)

#### API Endpoints
- `POST /tiktok/connections` - Kết nối với một channel
- `DELETE /tiktok/connections/:username` - Ngắt kết nối
- `GET /tiktok/connections` - Lấy danh sách connections đang active
- `GET /tiktok/status` - Trạng thái tổng quan

### 2. Session Tracking

#### Quản lý Livestream Sessions
- Tự động tạo session khi livestream bắt đầu
- Lưu trữ thông tin session:
  - Session ID (roomId từ TikTok)
  - Host username
  - Thời gian bắt đầu và kết thúc
  - Trạng thái session
- Tự động cập nhật khi livestream kết thúc

#### API Endpoints
- `GET /tiktok/sessions` - Lấy danh sách tất cả sessions
- `GET /tiktok/sessions/:id/chats` - Lấy chat messages của session

### 3. Chat Message Processing

#### Thu thập và Lưu trữ Messages
- Thu thập real-time chat messages từ livestreams
- Lưu trữ messages vào database
- Liên kết messages với users và sessions
- Xử lý messages qua queue (BullMQ) để tối ưu performance

#### Message Data
- Message content
- User information (uniqueId, nickname, avatar)
- Timestamp
- Session association

### 4. Channel Management

#### Quản lý TikTok Channels
- Thêm/xóa channels
- Enable/disable channels
- Cấu hình "Always Active" - tự động kết nối khi app khởi động
- Thiết lập expired date - tự động disable khi hết hạn
- Theo dõi trạng thái kết nối cuối cùng

#### Channel Properties
- Username (unique)
- Enabled status
- Always Active flag
- Expired Date
- Last Status
- Last Connected/Disconnected timestamps

#### API Endpoints
- `GET /tiktok/channels` - Lấy danh sách channels

### 5. Queue Processing với BullMQ

#### Xử lý Messages qua Queue
- Sử dụng BullMQ để xử lý chat messages bất đồng bộ
- Tăng performance khi có nhiều messages
- Retry mechanism cho failed jobs
- Redis-backed queue

### 6. Database Management

#### Entities
- **LiveSession** - Lưu trữ thông tin livestream sessions
- **LiveChannel** - Quản lý TikTok channels
- **LiveChatMessage** - Lưu trữ chat messages
- **LiveUser** - Thông tin users trong livestreams

#### Relationships
- Session → Messages (One-to-Many)
- User → Messages (One-to-Many)
- Message → Session (Many-to-One)
- Message → User (Many-to-One)

## 🎨 Frontend Features

### 1. Google OAuth Authentication

#### Đăng nhập bằng Google
- Tích hợp Google OAuth 2.0
- Secure authentication flow
- Lưu trữ JWT token
- Protected routes

#### Components
- `GoogleLoginButton` - Nút đăng nhập Google
- `AuthContext` - Quản lý authentication state
- `ProtectedRoute` - Bảo vệ routes cần authentication

### 2. Dashboard Overview

#### Statistics Cards
Hiển thị thống kê tổng quan:
- **Total Sessions** - Tổng số livestream sessions
- **Active Connections** - Số kết nối đang hoạt động
- **Total Messages** - Tổng số chat messages
- **Active Channels** - Số channels đang enabled

#### Real-time Updates
- Tự động refresh dữ liệu mỗi 30 giây
- Loading states
- Error handling

### 3. Sessions Management

#### Sessions Table
- Hiển thị danh sách tất cả sessions
- Thông tin hiển thị:
  - Host Username
  - Started At (với relative time)
  - Ended At (hoặc "Live" nếu đang active)
  - Duration
  - Status badge
- Actions:
  - View Chats - Xem chat messages của session

#### Chat Messages View
- Expandable row để xem chats
- Hiển thị:
  - User information
  - Message content
  - Timestamp
- Scrollable list với max height

### 4. Connections Monitoring

#### Active Connections Panel
- Hiển thị tất cả connections đang active
- Thông tin:
  - Username
  - Status với icon
  - Room ID (nếu có)
- Actions:
  - Disconnect button với confirmation

#### Real-time Status
- Tự động refresh mỗi 10 giây
- Visual indicators cho status
- Loading và error states

### 5. Channels Management

#### Channels Panel
- Danh sách tất cả channels
- Thông tin chi tiết:
  - Username
  - Enabled status (toggle icon)
  - Always Active status
  - Last Status với color-coded badge
  - Last Connected/Disconnected timestamps
  - Expired Date (nếu có)
- Actions:
  - Connect button (nếu chưa connected)

#### Status Badges
- **Connected** - Xanh lá (active)
- **Disconnected** - Xám (inactive)
- **Retrying** - Vàng (waiting)
- **Never Connected** - Xám đậm (chưa từng kết nối)

### 6. UI/UX Features

#### Design System
- **Color Scheme**: Đen và Xanh lá
  - Primary Black: #000000, #111111, #1a1a1a
  - Primary Green: #00ff00, #10b981, #22c55e
- Dark theme cho admin console
- Modern và professional design

#### Responsive Design
- Mobile-friendly sidebar với hamburger menu
- Responsive grid layouts
- Touch-friendly buttons

#### Navigation
- Sidebar navigation với active state
- Routes:
  - `/dashboard` - Overview
  - `/dashboard/sessions` - Sessions only
  - `/dashboard/connections` - Connections only
  - `/dashboard/channels` - Channels only

#### User Interface
- Header với user info và logout
- Loading skeletons
- Error messages
- Success notifications
- Smooth transitions và animations

## 🔄 Data Flow

### Backend Flow
1. App khởi động → Bootstrap always-active channels
2. User kết nối channel → Tạo worker → Kết nối TikTok Live
3. Livestream bắt đầu → Tạo session
4. Messages đến → Enqueue vào BullMQ → Process → Lưu database
5. Livestream kết thúc → Update session end time

### Frontend Flow
1. User đăng nhập → Google OAuth → Nhận JWT → Lưu localStorage
2. Truy cập dashboard → Fetch data từ API
3. User thao tác → Gọi API → Update UI
4. Auto-refresh → Poll API → Update data

## 📊 Performance Features

- Queue processing cho messages
- Database indexing
- Redis caching
- Lazy loading components
- Optimized API calls
- Auto-refresh với intervals

## 🔒 Security Features

- JWT authentication
- Protected API routes
- CORS configuration
- Environment variables cho secrets
- Secure token storage (localStorage)

## 🚀 Future Enhancements

- Real-time WebSocket updates
- Advanced filtering và search
- Export data (CSV, JSON)
- Analytics và charts
- Notification system
- Multi-user support với roles
- API rate limiting
- Message filtering và moderation
