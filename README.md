# 🟣 Pumiah Social

> **Kết nối. Chia sẻ. Thuộc về.**

Một ứng dụng mạng xã hội hiện đại được xây dựng với React + Supabase, có thiết kế glassmorphism tối cao cấp, thông báo thời gian thực, quản lý bạn bè và hỗ trợ PWA.

---

## 📋 Mục Lục

- [Yêu Cầu Tiên Quyết](#yeu-cau-tien-quyet)
- [Cài Đặt](#cai-dat)
- [Biến Môi Trường](#bien-moi-truong)
- [Máy Chủ Phát Triển](#may-chu-phat-trien)
- [Cấu Trúc Dự Án](#cau-truc-du-an)
- [Ngăn Xếp Công Nghệ](#ngan-xep-cong-nghe)
- [Tính Năng](#tinh-nang)
- [Thiết Lập Supabase](#thiet-lap-supabase)

---

## Yêu Cầu Tiên Quyết

| Yêu cầu | Phiên bản | Ghi chú |
|----------|-----------|---------|
| **Node.js** | >= 18.x | Khuyến nghị phiên bản LTS |
| **npm** | >= 9.x | Đi kèm với Node.js |
| **Tài khoản Supabase** | — | Gói miễn phí có sẵn tại [supabase.com](https://supabase.com) |
| **Git** | >= 2.x | Tùy chọn, để quản lý phiên bản |

---

## Cài Đặt

```bash
# 1. Clone kho lưu trữ
git clone <repository-url>
cd pumiah-social

# 2. Cài đặt dependencies
npm install

# 3. Sao chép mẫu môi trường
cp .env.example .env

# 4. Chỉnh sửa tệp .env với thông tin Supabase của bạn
# (Xem phần Biến Môi Trường bên dưới)

# 5. Áp dụng schema cơ sở dữ liệu
# Đi đến Supabase Dashboard > SQL Editor
# Dán nội dung của supabase/schema.sql và chạy

# 6. Khởi động máy chủ phát triển
npm run dev
```

---

## Biến Môi Trường

| Biến | Mô tả | Bắt buộc | Ví dụ |
|------|-------|----------|-------|
| `VITE_SUPABASE_URL` | URL dự án Supabase | ✅ Có | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Khóa ẩn danh/công khai Supabase | ✅ Có | `eyJhbGciOiJI...` |

### Nơi tìm các giá trị này:
1. Đi đến [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn dự án của bạn
3. Điều hướng đến **Settings → API**
4. Sao chép **Project URL** → `VITE_SUPABASE_URL`
5. Sao chép khóa **anon public** → `VITE_SUPABASE_ANON_KEY`

---

## Máy Chủ Phát Triển

```bash
# Khởi động dev server (hot reload)
npm run dev

# Build cho production
npm run build

# Xem trước bản build production
npm run preview
```

Dev server chạy tại `http://localhost:5173/` theo mặc định.

---

## Cấu Trúc Dự Án

```
pumiah-social/
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service worker
│   └── pumiah-icon.svg        # Icon ứng dụng
├── src/
│   ├── components/
│   │   ├── ui/                # Các component UI tái sử dụng
│   │   │   ├── Avatar.jsx     # Avatar người dùng với dự phòng
│   │   │   ├── Button.jsx     # Nút đa variant
│   │   │   ├── Card.jsx       # Card glassmorphism
│   │   │   ├── Input.jsx      # Input form với icon
│   │   │   ├── Modal.jsx      # Lớp phủ hộp thoại
│   │   │   ├── Spinner.jsx    # Chỉ báo tải
│   │   │   └── OfflineBanner.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx  # Bố cục chính (sidebar/tabs)
│   │   │   └── AuthLayout.jsx # Bố cục xác thực
│   │   ├── posts/
│   │   │   ├── CreatePost.jsx # Form tạo bài đăng
│   │   │   └── PostCard.jsx   # Card hiển thị bài đăng
│   │   ├── comments/
│   │   │   └── CommentSection.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx    # State xác thực
│   │   ├── FriendsContext.jsx # Quản lý bạn bè
│   │   ├── ChatContext.jsx    # Nhắn tin thời gian thực
│   │   └── NotificationsContext.jsx
│   ├── lib/
│   │   └── supabase.js        # Client Supabase
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── CreateProfilePage.jsx
│   │   ├── FeedPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── FriendsPage.jsx    # Bạn bè / Yêu cầu / Tìm kiếm
│   │   ├── MessengerPage.jsx  # Nhắn tin (Pumiah Messenger)
│   │   ├── NotificationsPage.jsx
│   │   └── SettingsPage.jsx   # Avatar + Ảnh bìa + Thông tin
│   ├── App.jsx                # Component gốc + routing
│   ├── main.jsx               # Điểm vào
│   └── index.css              # Hệ thống thiết kế + styles toàn cục
├── supabase/
│   └── schema.sql             # Schema CSDL + RLS policies + RPC functions
├── docs/                      # Tài liệu
│   ├── BUILD_LOG.md
│   ├── ADR.md
│   ├── PERFORMANCE.md
│   ├── API_REFERENCE.md
│   ├── PROJECT_PLAN.json
│   ├── CODE_WALKTHROUGH.md
│   ├── TEST_PLAN.md
│   └── LEARNING_PROGRESS.json
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

---

## Ngăn Xếp Công Nghệ

| Lớp | Công nghệ | Mục đích |
|-----|-----------|----------|
| **Frontend** | React 18 | Framework UI |
| **Build Tool** | Vite 6 | Dev server + đóng gói |
| **Routing** | React Router v6 | Điều hướng phía client |
| **Styling** | Vanilla CSS | Hệ thống thiết kế đầy đủ với biến |
| **Icons** | React Icons (Feather) | Biểu tượng giao diện |
| **Backend** | Supabase | Xác thực, CSDL, Lưu trữ, Thời gian thực |
| **Cơ sở dữ liệu** | PostgreSQL | Qua Supabase |
| **Xác thực** | Supabase Auth | Email/mật khẩu |
| **Lưu trữ** | Supabase Storage | Ảnh hồ sơ, ảnh bài đăng |
| **Thời gian thực** | Supabase Channels | Thông báo trực tiếp, nhắn tin |

---

## Tính Năng

- 🔐 **Xác thực** — Đăng ký, đăng nhập, xác nhận email
- 👤 **Hồ sơ** — Avatar, ảnh bìa, tiểu sử, vị trí, ngày sinh
- 👥 **Bạn bè** — Gửi/chấp nhận/từ chối yêu cầu, xóa bạn bè
- 🔍 **Tìm Bạn** — Tìm kiếm người dùng theo tên/username, gợi ý kết bạn
- 📝 **Bài đăng** — Văn bản, tải ảnh, chia sẻ liên kết
- 💬 **Bình luận** — Thêm, xóa, với thông tin tác giả
- ❤️ **Lượt thích** — Thích/bỏ thích bài đăng và bình luận
- 🔔 **Thông báo** — Thời gian thực với huy hiệu chưa đọc
- 💬 **Pumiah Messenger** — Nhắn tin 1-1 thời gian thực với bạn bè
- 📱 **Responsive** — Tab di động phía dưới, icon tablet, sidebar desktop
- 🌐 **PWA** — Hỗ trợ ngoại tuyến, có thể cài đặt
- 🎨 **Glassmorphism Tối** — Thiết kế cao cấp với hiệu ứng chuyển động

---

## Thiết Lập Supabase

### Các Bảng Cơ Sở Dữ Liệu
Schema tạo 9 bảng với 29 chính sách RLS:
- `profiles` — Hồ sơ người dùng
- `friend_requests` — Yêu cầu kết bạn đang chờ/đã chấp nhận/đã từ chối
- `friendships` — Cặp bạn bè đã xác nhận
- `posts` — Bài đăng văn bản, ảnh, liên kết
- `comments` — Bình luận bài đăng
- `likes` — Lượt thích bài đăng và bình luận
- `notifications` — Thông báo hoạt động
- `conversations` — Cuộc hội thoại nhắn tin 1-1
- `messages` — Tin nhắn trong cuộc hội thoại

### Buckets Lưu Trữ
Hai bucket công khai với tải lên đã xác thực:
- `profile_photos` — Avatars và ảnh bìa
- `post_images` — Ảnh tải lên bài đăng

### Hàm RPC
- `send_friend_request(target_user_id)` — Gửi yêu cầu kết bạn nguyên tử (xóa bản ghi cũ + tạo mới)

### Thời Gian Thực
Đã bật trên: `posts`, `notifications`, `comments`, `likes`, `conversations`, `messages`

---

## Giấy Phép

MIT © Pumiah Social
