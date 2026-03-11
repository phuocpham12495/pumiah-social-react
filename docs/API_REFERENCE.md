# 📡 Tham Chiếu API — Pumiah Social

> Tài liệu Người Viết Kỹ Thuật: Tất cả endpoints Supabase, schemas, mã lỗi và yêu cầu xác thực.

---

## Tổng Quan

Pumiah Social sử dụng **Supabase** làm backend, cung cấp API RESTful được tạo tự động cho tất cả bảng cơ sở dữ liệu. Client giao tiếp qua SDK `@supabase/supabase-js`.

**URL cơ sở**: `https://syaappwmkvajximwyhhj.supabase.co`

**Xác thực**: Tất cả endpoints yêu cầu JWT hợp lệ trong header `Authorization`. Supabase client xử lý điều này tự động sau khi đăng nhập.

---

## API Xác Thực

### Đăng Ký

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,   // Bắt buộc. Địa chỉ email hợp lệ
  password: string  // Bắt buộc. Tối thiểu 6 ký tự
})
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `data.user` | `User \| null` | Đối tượng user đã tạo |
| `data.session` | `Session \| null` | null cho đến khi email được xác nhận |
| `error` | `AuthError \| null` | Chi tiết lỗi nếu thất bại |

**Mã lỗi:**

| Mã | Thông báo | Nguyên nhân |
|----|-----------|-------------|
| `422` | "User already registered" | Email đã tồn tại |
| `422` | "Password should be at least 6 characters" | Mật khẩu quá ngắn |
| `429` | "Rate limit exceeded" | Quá nhiều lần thử đăng ký |

---

### Đăng Nhập

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string
})
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `data.user` | `User` | User đã xác thực |
| `data.session` | `Session` | Chứa access_token, refresh_token |

**Mã lỗi:**

| Mã | Thông báo | Nguyên nhân |
|----|-----------|-------------|
| `400` | "Invalid login credentials" | Sai email hoặc mật khẩu |
| `429` | "Rate limit exceeded" | Quá nhiều lần thử đăng nhập |

---

### Đăng Xuất

```typescript
const { error } = await supabase.auth.signOut()
```

---

### Lấy Phiên

```typescript
const { data: { session } } = await supabase.auth.getSession()
```

---

## Schema Dữ Liệu (TypeScript)

### Hồ Sơ (Profile)

```typescript
interface Profile {
  id: string              // UUID, tham chiếu auth.users
  username: string         // Duy nhất, chữ thường
  full_name: string        // Tên hiển thị
  bio: string              // Tối đa ~500 ký tự
  profile_photo_url: string// URL công khai từ storage
  cover_photo_url: string  // URL công khai từ storage
  location: string         // Văn bản tự do (thành phố, quốc gia)
  date_of_birth: string | null  // Ngày ISO (YYYY-MM-DD)
  created_at: string       // Dấu thời gian ISO
}
```

### Bài Đăng (Post)

```typescript
interface Post {
  id: string              // UUID
  profile_id: string       // ID hồ sơ tác giả
  post_type: 'text' | 'image' | 'link'
  content: string          // Nội dung văn bản
  media_url: string | null // URL ảnh (cho loại 'image')
  link_url: string | null  // URL bên ngoài (cho loại 'link')
  created_at: string       // Dấu thời gian ISO
  // Quan hệ join:
  author?: Profile
  likes?: Like[]
  comments?: Comment[]
}
```

### Bình Luận (Comment)

```typescript
interface Comment {
  id: string
  post_id: string         // Bài đăng cha
  profile_id: string       // Tác giả
  content: string          // Nội dung bình luận
  created_at: string
  // Join:
  author?: Profile
  likes?: Like[]
}
```

### Lượt Thích (Like)

```typescript
interface Like {
  id: string
  profile_id: string       // Ai đã thích
  target_id: string        // ID bài đăng hoặc bình luận
  target_type: 'post' | 'comment'
  created_at: string
}
```

### Yêu Cầu Kết Bạn (FriendRequest)

```typescript
interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  // Join:
  sender?: Profile
  receiver?: Profile
}
```

### Tình Bạn (Friendship)

```typescript
interface Friendship {
  id: string
  user1_id: string        // Luôn < user2_id (có thứ tự)
  user2_id: string
  created_at: string
  // Join:
  user1?: Profile
  user2?: Profile
}
```

### Thông Báo (Notification)

```typescript
interface Notification {
  id: string
  recipient_id: string
  sender_id: string | null
  type: 'like_post' | 'like_comment' | 'comment_post'
       | 'friend_request_received' | 'friend_request_accepted'
  message: string          // Thông báo dễ đọc
  target_url: string | null// URL điều hướng trong ứng dụng
  is_read: boolean
  created_at: string
  // Join:
  sender?: Profile
}
```

---

## Thao Tác Cơ Sở Dữ Liệu

### Hồ Sơ (Profiles)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Lấy hồ sơ** | `supabase.from('profiles').select('*').eq('id', userId).single()` | Bất kỳ người dùng đã xác thực |
| **Tạo/Cập nhật** | `supabase.from('profiles').upsert({ id, ...data }).select().single()` | Chỉ hồ sơ của mình |
| **Tìm kiếm** | `supabase.from('profiles').select('*').ilike('username', '%query%')` | Bất kỳ người dùng đã xác thực |

### Bài Đăng (Posts)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Lấy bảng tin** | `supabase.from('posts').select('*, author:profiles(...)').in('profile_id', friendIds).order('created_at', { ascending: false })` | Bất kỳ người dùng đã xác thực |
| **Tạo** | `supabase.from('posts').insert({ profile_id, post_type, content, ... })` | Chỉ bài đăng của mình |
| **Xóa** | `supabase.from('posts').delete().eq('id', postId)` | Chỉ bài đăng của mình |

### Bình Luận (Comments)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Lấy bình luận** | `supabase.from('comments').select('*, author:profiles(...)').eq('post_id', postId)` | Bất kỳ người dùng đã xác thực |
| **Thêm** | `supabase.from('comments').insert({ post_id, profile_id, content })` | Chỉ bình luận của mình |
| **Xóa** | `supabase.from('comments').delete().eq('id', commentId)` | Chỉ bình luận của mình |

### Lượt Thích (Likes)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Thích** | `supabase.from('likes').insert({ profile_id, target_id, target_type })` | Chỉ lượt thích của mình |
| **Bỏ thích** | `supabase.from('likes').delete().eq('profile_id', userId).eq('target_id', targetId)` | Chỉ lượt thích của mình |

### Yêu Cầu Kết Bạn (Friend Requests)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Gửi** | `supabase.from('friend_requests').insert({ sender_id, receiver_id })` | Chỉ với vai trò người gửi |
| **Chấp nhận** | `supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId)` | Chỉ với vai trò người nhận |
| **Từ chối** | `supabase.from('friend_requests').update({ status: 'declined' }).eq('id', reqId)` | Chỉ với vai trò người nhận |

### Tình Bạn (Friendships)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Lấy bạn bè** | `supabase.from('friendships').select('*, user1:profiles(...), user2:profiles(...)').or(...)` | Tình bạn của mình |
| **Xóa** | `supabase.from('friendships').delete().eq('user1_id', id1).eq('user2_id', id2)` | Tình bạn của mình |

### Thông Báo (Notifications)

| Thao tác | Phương thức | Chính sách RLS |
|----------|-------------|----------------|
| **Lấy** | `supabase.from('notifications').select('*, sender:profiles(...)').eq('recipient_id', userId)` | Thông báo của mình |
| **Đánh dấu đã đọc** | `supabase.from('notifications').update({ is_read: true }).eq('id', notifId)` | Thông báo của mình |
| **Đánh dấu tất cả đã đọc** | `supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId).eq('is_read', false)` | Thông báo của mình |

---

## API Lưu Trữ

### Tải Ảnh Hồ Sơ

```typescript
const { error } = await supabase.storage
  .from('profile_photos')
  .upload(`${userId}/profile.${ext}`, file, { upsert: true })

const { data: { publicUrl } } = supabase.storage
  .from('profile_photos')
  .getPublicUrl(`${userId}/profile.${ext}`)
```

### Tải Ảnh Bài Đăng

```typescript
const { error } = await supabase.storage
  .from('post_images')
  .upload(`${userId}/${timestamp}.${ext}`, file)

const { data: { publicUrl } } = supabase.storage
  .from('post_images')
  .getPublicUrl(`${userId}/${timestamp}.${ext}`)
```

### Chính Sách Lưu Trữ

| Bucket | Đọc | Ghi | Cập nhật |
|--------|-----|-----|----------|
| `profile_photos` | Công khai | Đã xác thực | Đã xác thực |
| `post_images` | Công khai | Đã xác thực | — |

---

## Đăng Ký Thời Gian Thực

### Kênh Bài Đăng

```typescript
supabase
  .channel('public-posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'posts'
  }, callback)
  .subscribe()
```

### Kênh Thông Báo

```typescript
supabase
  .channel(`notifications:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, callback)
  .subscribe()
```

---

## Xử Lý Lỗi

| Mã HTTP | Ý nghĩa | Nguyên nhân thường gặp |
|---------|---------|----------------------|
| `400` | Yêu cầu không hợp lệ | Tham số truy vấn không đúng |
| `401` | Chưa xác thực | JWT thiếu hoặc hết hạn |
| `403` | Bị cấm | Chính sách RLS từ chối truy cập |
| `404` | Không tìm thấy | Tài nguyên không tồn tại |
| `409` | Xung đột | Vi phạm ràng buộc unique |
| `422` | Không thể xử lý | Lỗi validation (ràng buộc check) |
| `429` | Quá nhiều yêu cầu | Bị giới hạn tốc độ |
| `500` | Lỗi nội bộ | Database trigger thất bại |

### Đối Tượng Lỗi Supabase

```typescript
interface PostgrestError {
  message: string    // Thông báo dễ đọc
  details: string    // Thông tin lỗi chi tiết
  hint: string       // Gợi ý sửa lỗi
  code: string       // Mã lỗi PostgreSQL
}
```
