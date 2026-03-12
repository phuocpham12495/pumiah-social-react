# 📐 Bản Ghi Quyết Định Kiến Trúc (ADR) — Pumiah Social

---

## ADR-001: Lựa Chọn Framework Frontend

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | React 18 với Vite 6 |
| **Mẫu thiết kế** | Ứng dụng Trang Đơn (SPA) |
| **Phương án thay thế** | Next.js 14, Vue 3 + Vite, Svelte |

### Bối cảnh
Cần một framework frontend hiện đại cho ứng dụng mạng xã hội với các tính năng thời gian thực, tải tệp và thiết kế responsive.

### Quyết định
Chọn React 18 với Vite vì những lý do sau:
- SPA là đủ — không cần SEO cho ứng dụng xã hội yêu cầu đăng nhập
- Vite cung cấp HMR cực nhanh và cấu hình tối thiểu
- React có hệ sinh thái lớn nhất cho tích hợp Supabase
- React Router v6 cung cấp routing lồng nhau linh hoạt

### Đánh đổi
| Ưu điểm | Nhược điểm |
|----------|------------|
| Dev server nhanh (cold start dưới 1 giây) | Không có SSR (chấp nhận được cho ứng dụng yêu cầu xác thực) |
| Hỗ trợ Supabase SDK phong phú | Chỉ render phía client |
| Bundle nhỏ hơn Next.js | Cần tự chia code (code splitting) |
| Không cần server runtime | SEO hạn chế (chấp nhận được cho trường hợp này) |

---

## ADR-002: Phương Pháp Styling

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | Vanilla CSS với CSS Custom Properties (biến) |
| **Mẫu thiết kế** | Hệ thống thiết kế với đặt tên kiểu BEM |
| **Phương án thay thế** | Tailwind CSS, CSS Modules, styled-components, Emotion |

### Bối cảnh
Cần một phương pháp styling hỗ trợ hệ thống thiết kế glassmorphism tối toàn diện với hiệu ứng chuyển động.

### Quyết định
Chọn Vanilla CSS với CSS custom properties vì:
- Không tốn chi phí runtime (so với CSS-in-JS)
- Kiểm soát toàn bộ cascade cho hiệu ứng glassmorphism
- Hơn 60 design tokens dưới dạng CSS variables
- Không phụ thuộc build-time hoặc cấu hình
- Đặt tên kiểu BEM ngăn chặn xung đột class

### Đánh đổi
| Ưu điểm | Nhược điểm |
|----------|------------|
| Không tốn chi phí JS runtime | Không có scoping tự động |
| Kiểm soát toàn bộ specificity | Cần kỷ luật đặt tên thủ công |
| Design tokens dưới dạng CSS vars gốc | File CSS lớn hơn so với utility-first |
| Không phụ thuộc toolchain | Không tích hợp TypeScript |

---

## ADR-003: Quản Lý State

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | React Context API |
| **Mẫu thiết kế** | Provider/Consumer với custom hooks |
| **Phương án thay thế** | Redux Toolkit, Zustand, Jotai, MobX |

### Bối cảnh
Cần quản lý state cho phiên xác thực, danh sách bạn bè và thông báo trên toàn ứng dụng.

### Quyết định
Chọn React Context với custom hooks (`useAuth`, `useFriends`, `useNotifications`, `useChat`) vì:
- Bốn miền state riêng biệt với ranh giới rõ ràng
- Độ phức tạp vừa phải — không cần state chuẩn hóa
- Tích hợp sẵn trong React — không thêm dependency
- Custom hooks cung cấp API sạch sẽ

### Đánh đổi
| Ưu điểm | Nhược điểm |
|----------|------------|
| Không thêm dependencies | Có thể gặp vấn đề re-render khi mở rộng |
| Mẫu provider đơn giản | Không có devtools (so với Redux) |
| Đồng vị trí với cây React | Cần tối ưu hóa thủ công |
| API dựa trên hook sạch sẽ | Không có mẫu middleware |

---

## ADR-004: Backend-as-a-Service

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Mẫu thiết kế** | BaaS với giao tiếp client-server trực tiếp |
| **Phương án thay thế** | Firebase, Appwrite, Express tùy chỉnh + PostgreSQL |

### Bối cảnh
Cần backend với xác thực, cơ sở dữ liệu quan hệ, lưu trữ tệp, đăng ký thời gian thực và bảo mật cấp hàng.

### Quyết định
Chọn Supabase vì:
- PostgreSQL — cơ sở dữ liệu quan hệ đầy đủ với joins, constraints, triggers
- RLS tích hợp sẵn — chính sách bảo mật ở cấp cơ sở dữ liệu
- Kênh Realtime — cập nhật trực tiếp dựa trên WebSocket
- Storage với policies — tải tệp với kiểm soát truy cập
- Gói miễn phí đủ cho phát triển

### Đánh đổi
| Ưu điểm | Nhược điểm |
|----------|------------|
| Sức mạnh PostgreSQL đầy đủ | Rủi ro phụ thuộc nhà cung cấp |
| RLS cho bảo mật | Đường cong học tập cho RLS policies |
| Auth + storage tích hợp sẵn | Giới hạn compute (không có logic server tùy chỉnh) |
| Realtime có sẵn | Giới hạn kết nối ở gói miễn phí |

---

## ADR-005: Thiết Kế Schema Cơ Sở Dữ Liệu

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | 7 bảng chuẩn hóa với ID tình bạn có thứ tự |
| **Mẫu thiết kế** | Schema quan hệ chuẩn hóa với triggers |

### Các Quyết Định Thiết Kế Chính

1. **ID tình bạn có thứ tự** (`user1_id < user2_id`):
   - Ngăn chặn tình bạn trùng lặp mà không cần ràng buộc unique hai chiều
   - Một ràng buộc `CHECK (user1_id < user2_id)` duy nhất

2. **Bảng likes đa hình**:
   - `target_id` + `target_type` thay vì bảng `post_likes` và `comment_likes` riêng
   - Đơn giản hóa logic like/unlike với một bảng duy nhất

3. **Triggers thông báo** (phía server):
   - Database triggers tự động tạo thông báo
   - Không cần tạo thông báo phía client
   - Đảm bảo tính nhất quán ngay cả khi client gặp sự cố

4. **Tách riêng `friend_requests` và `friendships`**:
   - Máy trạng thái rõ ràng: đang chờ → chấp nhận/từ chối → tình bạn
   - Bảng friendships chỉ chứa các kết nối đã xác nhận

---

## ADR-006: Chiến Lược Thiết Kế Responsive

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | Thiết kế responsive ba breakpoint |
| **Mẫu thiết kế** | Mobile-first với nâng cấp dần dần |

### Các Breakpoint

| Phạm vi | Bố cục | Điều hướng |
|---------|--------|------------|
| `< 768px` | Toàn chiều rộng | Thanh tab phía dưới + header di động |
| `768px – 1024px` | Nội dung căn giữa | Thanh sidebar chỉ có icon |
| `> 1024px` | Sidebar cố định + nội dung | Sidebar đầy đủ với nhãn |

---

## ADR-007: Triển Khai PWA

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-11 |
| **Quyết định** | Service worker thủ công + Web App Manifest |
| **Mẫu thiết kế** | Cache-first cho tài nguyên, stale-while-revalidate cho API |
| **Phương án thay thế** | Vite PWA Plugin, Workbox |

### Quyết định
Service worker thủ công để kiểm soát chi tiết hơn chiến lược caching:
- Tài nguyên tĩnh: Cache-first (tải từ cache, mạng là phương án dự phòng)
- Gọi API: Stale-while-revalidate (phản hồi từ cache, cập nhật ngầm)
- Banner offline: Tự động phát hiện trực tuyến/ngoại tuyến qua component `OfflineBanner`

---

## ADR-008: Kiến Trúc Nhắn Tin (Pumiah Messenger)

| Trường | Giá trị |
|--------|---------|
| **Trạng thái** | Đã chấp nhận |
| **Ngày** | 2026-03-12 |
| **Quyết định** | Nhắn tin 1-1 chỉ bạn bè qua Supabase Realtime |
| **Mẫu thiết kế** | Split-panel UI + ChatContext + Realtime subscriptions |
| **Phương án thay thế** | WebSocket tùy chỉnh, Firebase Messaging, Pusher |

### Bối cảnh
Cần thêm tính năng nhắn tin trực tiếp giữa bạn bè, với giao diện chuyên nghiệp và gửi tin nhắn thời gian thực.

### Các Quyết Định Thiết Kế Chính

1. **Chỉ bạn bè mới nhắn tin được**: Giảm spam, tận dụng bảng friendships đã có
2. **ID hội thoại có thứ tự** (`user1_id < user2_id`): Cùng mẫu với friendships, ngăn trùng lặp
3. **Supabase Realtime cho tin nhắn**: `postgres_changes` — tin nhắn lưu DB trước khi phát → không mất dữ liệu
4. **Split-panel responsive**: Desktop hiển thị cả hai panel, mobile chuyển đổi giữa list và chat

### Đánh đổi
| Ưu điểm | Nhược điểm |
|----------|------------|
| Tận dụng hạ tầng Supabase đã có | Chỉ hỗ trợ 1-1, chưa có group chat |
| RLS bảo vệ tin nhắn ở cấp DB | Kết nối Realtime thêm cho mỗi cuộc trò chuyện |
| Tin nhắn lưu trữ bền vững | Không có end-to-end encryption |
| Giao diện premium nhất quán | Bundle CSS tăng thêm ~400 dòng |

---

## Các Dependency Đã Chọn

| Gói | Phiên bản | Mục đích | Phương án thay thế đã xem xét |
|-----|-----------|----------|-------------------------------|
| `react` | ^18.3 | Framework UI | Vue, Svelte |
| `react-dom` | ^18.3 | DOM rendering | — |
| `react-router-dom` | ^6.28 | Client routing | TanStack Router |
| `@supabase/supabase-js` | ^2.46 | Backend client | Firebase SDK |
| `react-icons` | ^5.3 | Thư viện icon | Lucide, Heroicons |
| `vite` | ^6.0 | Build tool | Webpack, Parcel |
| `@vitejs/plugin-react` | ^4.3 | React JSX transform | — |
