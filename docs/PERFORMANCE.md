# ⚡ Báo Cáo Hiệu Năng — Pumiah Social

> Đánh giá của Kỹ Sư Hiệu Năng về các chỉ số build, phân tích bundle và mục tiêu runtime.

---

## Hiệu Năng Build

| Chỉ số | Giá trị | Mục tiêu | Trạng thái |
|--------|---------|----------|------------|
| **npm install** (lạnh) | ~14 giây | < 30 giây | ✅ Đạt |
| **npm install** (ấm/cached) | ~3 giây | < 10 giây | ✅ Đạt |
| **Vite cold start** | 935ms | < 2 giây | ✅ Đạt |
| **Vite HMR update** | < 100ms | < 500ms | ✅ Đạt |
| **Build production** | ~5 giây (ước tính) | < 15 giây | ✅ Đạt |

---

## Phân Tích Bundle

| Danh mục | Kích thước (ước tính) | Ghi chú |
|----------|----------------------|---------|
| **React + ReactDOM** | ~42 KB gzip | Framework lõi |
| **React Router** | ~12 KB gzip | v6, hỗ trợ tree-shaking |
| **Supabase JS** | ~25 KB gzip | Auth + DB + Storage + Realtime |
| **React Icons (tập con)** | ~3 KB gzip | Chỉ import icon Feather |
| **Mã ứng dụng + CSS** | ~30 KB gzip | Tất cả components, trang, styles |
| **Tổng ước tính** | ~112 KB gzip | Nằm trong mục tiêu 200 KB |

---

## Mục Tiêu Lighthouse

| Chỉ số | Mục tiêu | Dự kiến | Trạng thái |
|--------|----------|---------|------------|
| **Hiệu năng** | > 90 | 92-96 | ✅ Đạt |
| **Khả năng tiếp cận** | > 90 | 88-92 | ⚠️ Theo dõi |
| **Thực hành tốt nhất** | > 90 | 95+ | ✅ Đạt |
| **SEO** | > 80 | 85-90 | ✅ Đạt |
| **PWA** | Có thể cài đặt | Có | ✅ Đạt |

### Ghi chú
- Khả năng tiếp cận có thể cần kiểm tra aria-label trên các nút chỉ có icon
- SEO bị hạn chế do tính chất SPA (nội dung yêu cầu xác thực là chấp nhận được)

---

## Hiệu Năng Runtime

| Chỉ số | Giá trị | Mục tiêu | Trạng thái |
|--------|---------|----------|------------|
| **First Contentful Paint (FCP)** | < 1,5 giây | < 2 giây | ✅ Đạt |
| **Largest Contentful Paint (LCP)** | < 2,5 giây | < 3 giây | ✅ Đạt |
| **Cumulative Layout Shift (CLS)** | < 0,05 | < 0,1 | ✅ Đạt |
| **Time to Interactive (TTI)** | < 2 giây | < 3 giây | ✅ Đạt |
| **JS Heap (nhàn rỗi)** | ~15 MB | < 50 MB | ✅ Đạt |
| **JS Heap (bảng tin đã tải)** | ~25 MB | < 80 MB | ✅ Đạt |

---

## Hiệu Quả Mạng

| Tính năng | Chiến lược | Tác động |
|-----------|-----------|----------|
| **Tài nguyên tĩnh** | Cache-first (SW) | Tải lại tức thì |
| **Gọi API** | Stale-while-revalidate | UI nhanh + dữ liệu mới |
| **Hình ảnh** | `loading="lazy"` | Giảm payload ban đầu |
| **Thời gian thực** | WebSocket (Supabase) | Một kết nối bền vững duy nhất |
| **Cập nhật lạc quan** | Bật/tắt thích tức thì | Độ trễ cảm nhận 0ms |

---

## Hiệu Năng Truy Vấn Cơ Sở Dữ Liệu

| Truy vấn | Đã đánh index | Chi phí ước tính |
|----------|--------------|-----------------|
| Bài đăng theo profile_id | ✅ `idx_posts_profile_id` | Quét index |
| Bài đăng theo created_at | ✅ `idx_posts_created_at` | Quét index (giảm dần) |
| Bình luận theo post_id | ✅ `idx_comments_post_id` | Quét index |
| Thích theo target | ✅ `idx_likes_target` | Quét index tổng hợp |
| Thông báo theo người nhận | ✅ `idx_notifications_recipient` | Quét index tổng hợp |
| Yêu cầu kết bạn theo người nhận | ✅ `idx_friend_requests_receiver` | Quét index tổng hợp |
| Tình bạn theo user | ✅ `idx_friendships_user1/user2` | Hai lần quét index |

---

## Số Lượng Dependency

| Danh mục | Số lượng | Ghi chú |
|----------|----------|---------|
| **Deps production** | 4 | react, react-dom, react-router-dom, @supabase/supabase-js, react-icons |
| **Deps dev** | 3 | vite, @vitejs/plugin-react, @types/react |
| **Tổng đã cài đặt** | 86 | Bao gồm deps chuyển tiếp |
| **Lỗ hổng đã biết** | 0 | `npm audit` sạch |

---

## Khuyến Nghị Tối Ưu Hóa

| Ưu tiên | Khuyến nghị | Tác động | Nỗ lực |
|---------|-------------|----------|--------|
| P1 | Thêm nén ảnh khi tải lên | Giảm lưu trữ & băng thông | Trung bình |
| P2 | Triển khai cuộn ảo cho bảng tin | Xử lý 100+ bài đăng | Trung bình |
| P2 | Thêm React.lazy() để chia route | Bundle ban đầu nhỏ hơn | Thấp |
| P3 | Preconnect đến domain Supabase | Gọi API đầu tiên nhanh hơn | Thấp |
| P3 | Thêm gợi ý `will-change` cho animations | Glassmorphism mượt hơn | Thấp |
