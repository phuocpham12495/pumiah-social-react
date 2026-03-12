# 🏗️ Nhật Ký Xây Dựng — Pumiah Social

> Nhật ký Người Quan Sát Xây Dựng: Ghi chép từng bước với dấu thời gian và lý do quyết định.

---

## Phiên 1: 2026-03-11

### [05:40] Khởi Tạo Dự Án
- **Hành động**: Phân tích user stories (19), đặc tả kỹ thuật và test cases (40+)
- **Quyết định**: Chọn Vite + React thay vì Next.js — SPA là đủ cho ứng dụng xã hội; không cần SSR
- **Lý do**: Cold start dev server nhanh hơn, triển khai đơn giản hơn, phù hợp hơn cho tích hợp Supabase thời gian thực

### [05:41] Tạo Dự Án Supabase
- **Hành động**: Tạo dự án Supabase "Pumiah Social" qua MCP Server
- **Project ID**: `syaappwmkvajximwyhhj`
- **Khu vực**: `ap-southeast-1` (Singapore) — gần nhất với người dùng
- **Chi phí**: Gói miễn phí ($0/tháng)
- **Quyết định**: Dùng MCP server để thiết lập lập trình thay vì giao diện dashboard

### [05:42] Cấu Hình Package
- **Hành động**: Tạo `package.json` với các dependencies
- **Dependencies đã chọn**:
  - `@supabase/supabase-js` v2 — client chính thức
  - `react-router-dom` v6 — client routing
  - `react-icons` — bộ icon Feather cho UI nhất quán
- **Quyết định**: Dependencies tối thiểu để giữ bundle size nhỏ
- **Lý do**: Tránh các phương án nặng hơn (MUI, Chakra) ưu tiên vanilla CSS để kiểm soát thiết kế toàn diện

### [05:43] Cấu Hình Vite
- **Hành động**: Tạo `vite.config.js` với React plugin
- **Quyết định**: Cấu hình Vite mặc định là đủ, không cần PWA plugin
- **Lý do**: Service worker thủ công cung cấp kiểm soát cache chi tiết hơn

### [05:44] Hệ Thống Thiết Kế (index.css)
- **Hành động**: Tạo hệ thống thiết kế CSS toàn diện với hơn 60 biến
- **Chủ đề**: Glassmorphism tối (lấy cảm hứng từ thẩm mỹ Apple Vision Pro)
- **Font**: Inter từ Google Fonts (chuyên nghiệp, dễ đọc)
- **Bảng màu**: Gradient accent tím-hồng (#7C3AED → #DB2777)
- **Quyết định**: CSS variables thay vì CSS-in-JS
- **Lý do**: Không tốn chi phí runtime, dễ bảo trì, kiểm soát cascade toàn diện, không thêm dependency

### [05:45] Thư Viện Component UI (7 components)
- **Các components đã xây dựng**: Button, Input, Avatar, Card, Modal, Spinner, OfflineBanner
- **Mẫu**: Mỗi component có cặp tệp `.jsx` + `.css` module
- **Quyết định**: Quy ước đặt tên kiểu BEM (`.component__element--modifier`)
- **Lý do**: Ngăn chặn xung đột class mà không tốn chi phí CSS modules, cấu trúc tự tài liệu hóa

### [05:46] Các Component Bố Cục
- **AppLayout**: Sidebar responsive (desktop) → icon rail (tablet) → tab phía dưới (di động)
- **AuthLayout**: Card glassmorphism căn giữa với các quả cầu trang trí nổi
- **Quyết định**: Ba breakpoints (di động < 768px < tablet < 1024px < desktop)
- **Lý do**: Bao phủ 95%+ kích thước thiết bị, phương pháp nâng cấp dần dần

### [05:47] Kiến Trúc Context
- **AuthContext**: Phiên, user, hồ sơ, phương thức xác thực, tải ảnh
- **FriendsContext**: Danh sách bạn bè, yêu cầu kết bạn, gửi/chấp nhận/từ chối/xóa
- **NotificationsContext**: Thời gian thực qua kênh Supabase, đánh dấu đã đọc
- **Quyết định**: React Context thay vì Redux/Zustand
- **Lý do**: State ứng dụng có độ phức tạp vừa phải, Context tránh dependency và boilerplate không cần thiết

### [05:48] Các Trang Xác Thực
- **LoginPage**: Email/mật khẩu với validation và xử lý lỗi
- **SignupPage**: Với xác nhận mật khẩu, trạng thái thành công hiển thị xác minh email
- **CreateProfilePage**: Thiết lập lần đầu với tải avatar, tên người dùng, tiểu sử
- **Quyết định**: Tách luồng tạo hồ sơ khỏi đăng ký
- **Lý do**: Supabase auth tạo user trước, hồ sơ là mối quan tâm cấp ứng dụng

### [05:49] Các Trang Tính Năng (5 trang)
- **FeedPage**: Bảng tin bạn bè theo thứ tự thời gian với cập nhật thời gian thực
- **ProfilePage**: Ảnh bìa, avatar, tiểu sử, lưới bạn bè, danh sách bài đăng, nút hành động bạn bè
- **FriendsPage**: Ba tab (Bạn bè / Yêu cầu / Tìm kiếm)
- **NotificationsPage**: Icon theo loại, trạng thái đã đọc/chưa đọc, đánh dấu tất cả đã đọc
- **SettingsPage**: Chỉnh sửa hồ sơ, thay đổi avatar và ảnh bìa

### [05:50] Các Component Bài Đăng & Bình Luận
- **CreatePost**: Hỗ trợ bài đăng văn bản, tải ảnh, liên kết với xem trước
- **PostCard**: Thông tin tác giả, nội dung, hành động thích/bình luận, menu xóa, cập nhật lạc quan
- **CommentSection**: Thêm/xóa bình luận, thích bình luận, có thể mở rộng

### [05:51] Schema Cơ Sở Dữ Liệu
- **Bảng**: 7 (profiles, friend_requests, friendships, posts, comments, likes, notifications)
- **RLS**: Tất cả bảng có chính sách bảo mật cấp hàng
- **Triggers**: 4 hàm tự động tạo thông báo
- **Indexes**: 8 index trên các cột thường xuyên truy vấn
- **Quyết định**: ID tình bạn có thứ tự (`user1_id < user2_id`) để ngăn trùng lặp
- **Lý do**: Một ràng buộc duy nhất thay vì kiểm tra unique hai chiều

### [05:52] Điểm Vào Ứng Dụng
- **App.jsx**: BrowserRouter → AuthProvider → Routes với bố cục lồng nhau
- **main.jsx**: Đăng ký Service worker khi cửa sổ tải
- **Routing**: Routes xác thực (không sidebar) → Routes được bảo vệ (có sidebar) → Chuyển hướng dự phòng

### [13:25] Hoàn Thiện Backend
- **Hành động**: Lấy anon key qua MCP, cập nhật `.env`
- **Hành động**: Tạo storage buckets (`profile_photos`, `post_images`) qua SQL
- **Hành động**: Áp dụng RLS policies cho storage (đọc công khai, tải lên đã xác thực)
- **Người dùng**: Áp dụng database schema qua Supabase SQL Editor

---

## Phiên 2: 2026-03-11

### [18:00] Sửa Lỗi Bài Đăng Không Hiển Thị
- **Vấn đề**: Bài đăng không hiển thị trong bảng tin và hồ sơ (400 Bad Request)
- **Nguyên nhân gốc**: Bảng `likes` sử dụng `target_id` đa hình — không có FK trực tiếp đến `posts` → join `likes(id, profile_id)` trong Supabase query thất bại
- **Giải pháp**: Tách fetch likes thành truy vấn riêng, lọc theo `target_type = 'post'`
- **Tệp sửa**: `FeedPage.jsx`, `ProfilePage.jsx`

### [18:05] Thêm Tính Năng Tìm Bạn Bè
- **Hành động**: Thêm tab "Find" thứ 3 vào FriendsPage
- **Tính năng**: Tìm kiếm debounce 300ms, truy vấn `ilike` trên username/full_name, nút hành động động (Add Friend / Request Sent / Accept / Friends ✓), danh sách gợi ý
- **Tệp sửa**: `FriendsPage.jsx`, `FriendsPage.css`

### [18:28] Sửa Lỗi Cập Nhật Avatar & Ảnh Bìa
- **Vấn đề 1**: Upload avatar lỗi "null value in column username violates not-null constraint"
- **Nguyên nhân**: `updateProfile` dùng `upsert` → coi dữ liệu partial như INSERT mới → thiếu `username` NOT NULL
- **Giải pháp**: Đổi `upsert` → `update().eq('id', user.id)` trong `AuthContext.jsx`
- **Vấn đề 2**: Ảnh không cập nhật sau upload do browser cache
- **Giải pháp**: Thêm `?t=Date.now()` vào URL ảnh để phá cache

### [18:30] Di Chuyển Chỉnh Sửa Ảnh Bìa
- **Hành động**: Xóa nút "Change Cover" khỏi ProfilePage, thêm vào SettingsPage
- **Lý do**: Trang hồ sơ chỉ để xem, chỉnh sửa tập trung trong Settings
- **UI**: Overlay chỉ có icon camera (giống avatar), không có text

---

## Phiên 3: 2026-03-12

### [13:37] Lên Kế Hoạch Tính Năng Pumiah Messenger
- **Hành động**: Phân tích codebase hiện tại để hiểu kiến trúc
- **Quyết định**: Nhắn tin 1-1 chỉ giữa bạn bè, sử dụng Supabase Realtime
- **Lý do**: Tận dụng hạ tầng đã có (friendships, realtime, RLS), giảm spam

### [13:45] Schema Cơ Sở Dữ Liệu Messenger
- **Hành động**: Thêm bảng `conversations` và `messages` vào schema.sql
- **Thiết kế**: ID có thứ tự (`user1_id < user2_id`), cùng mẫu với friendships
- **RLS**: 3 policies cho conversations, 3 cho messages (select/insert/update)
- **Indexes**: 6 index mới (user1, user2, last_msg, conversation+created, sender, unread)
- **Realtime**: Bật cho cả conversations và messages

### [13:46] ChatContext — Quản Lý State Nhắn Tin
- **Hành động**: Tạo `ChatContext.jsx` với đầy đủ state management
- **Tính năng**: Danh sách hội thoại, tin nhắn active, đếm chưa đọc, Realtime subscription
- **Mẫu**: Cùng mẫu Provider + Custom Hook như AuthContext/FriendsContext/NotificationsContext
- **Quyết định**: useCallback + useRef cho subscriber management
- **Lý do**: Tránh re-subscription khi dependency thay đổi

### [13:47] MessengerPage — Giao Diện Chat
- **Hành động**: Tạo `MessengerPage.jsx` + `MessengerPage.css`
- **UI**: Split-panel (danh sách hội thoại trái + chat phải), responsive mobile
- **Tính năng**: Bong bóng tin nhắn gradient, date dividers, auto-scroll, Enter-to-send
- **Modal**: "New Chat" cho chọn bạn bè để bắt đầu hội thoại
- **Quyết định**: CSS thuần với design tokens đã có
- **Lý do**: Nhất quán với phong cách thiết kế glassmorphism tối

### [13:48] Tích Hợp Điều Hướng
- **Hành động**: Thêm ChatProvider, route /messenger, nav item vào sidebar/bottom tabs
- **Tệp sửa**: `App.jsx`, `AppLayout.jsx`
- **Huy hiệu**: Hiển thị số tin nhắn chưa đọc trên icon Messenger

### [13:57] Xác Minh & Migration
- **Hành động**: Test đăng nhập và xem Messenger page trong browser
- **Kết quả**: Trang tải thành công, split-panel hiển thị đúng, nav item hoạt động
- **Migration**: Áp dụng thành công lên Supabase project

---

## Tóm Tắt Chỉ Số Xây Dựng

| Chỉ số | Giá trị |
|--------|---------|
| Tổng tệp đã tạo/sửa | 54 |
| React components | 16 |
| Tệp CSS | 14 |
| Trang | 9 |
| Contexts | 4 |
| Bảng Supabase | 9 |
| RLS policies | 27 |
| Database triggers | 4 |
| Lỗi đã sửa | 4 |
| Tính năng mới | 2 (Tìm Bạn Bè, Pumiah Messenger) |
| Thời gian build (npm install) | ~14 giây |
| Vite cold start | ~935ms |
| Không có lỗi runtime | ✅ |
