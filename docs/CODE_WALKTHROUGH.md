# 🗺️ Hướng Dẫn Duyệt Mã — Pumiah Social

> Hướng dẫn Mentor Lập Trình Viên Cao Cấp: Duyệt điểm vào, luồng quản lý state, chiến lược fetch dữ liệu và các mẫu thiết kế chính.

---

## 1. Điểm Vào → Cây Component

### `main.jsx` — Khởi động ứng dụng

```jsx
// src/main.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />        // ← Điểm vào. Bọc mọi thứ trong BrowserRouter + AuthProvider
  </React.StrictMode>
)
// Cũng đăng ký service worker để hỗ trợ PWA
```

### `App.jsx` — Phân cấp Router + Provider

```
<BrowserRouter>
  <AuthProvider>                    // ← Cung cấp state xác thực cho TOÀN BỘ ứng dụng
    <Routes>
      ├── /login, /signup           // AuthLayout (không có sidebar)
      │   └── <AuthLayout>
      │       └── <Outlet />        // LoginPage hoặc SignupPage
      │
      ├── /create-profile           // Độc lập (không có bố cục bọc)
      │   └── <CreateProfilePage />
      │
      └── /feed, /profile/:id, ... // Routes được bảo vệ (có sidebar)
          └── <ProtectedRoute>      // ← Bảo vệ: phải đăng nhập + có hồ sơ
              └── <FriendsProvider>  // ← Context bạn bè BÊN TRONG vùng được bảo vệ
                  └── <NotificationsProvider>  // ← Thông báo với thời gian thực
                      └── <ChatProvider>       // ← Nhắn tin với thời gian thực
                          └── <AppLayout>
                              └── <Outlet />  // ← Trang render ở đây
```

**Insight quan trọng**: `FriendsProvider`, `NotificationsProvider` và `ChatProvider` được lồng BÊN TRONG `ProtectedRoute`. Điều này đảm bảo chúng chỉ fetch dữ liệu khi người dùng đã xác thực.

---

## 2. Luồng Quản Lý State

### Máy Trạng Thái Xác Thực

```
[Chưa Xác Thực]
    │
    ├── signUp(email, password) → [Cần Xác Nhận Email]
    │                                  │
    │                                  └── Người dùng nhấp liên kết → [Đã Xác Thực, Chưa Có Hồ Sơ]
    │                                                               │
    │                                                               └── createProfile() → [Đã Xác Thực, Có Hồ Sơ]
    │
    └── signIn(email, password) ────────────────────────────────────→ [Đã Xác Thực, Có Hồ Sơ]
                                                                          │
                                                                          └── signOut() → [Chưa Xác Thực]
```

### Luồng dữ liệu AuthContext:

```
Supabase Auth → onAuthStateChange → setUser(user)
                                  → fetchProfile(user.id) → setProfile(profile)
                                  → setLoading(false)

Khi signOut → setProfile(null) → chuyển hướng đến /login
```

### Luồng dữ liệu FriendsContext:

```
Khi mount (user thay đổi):
  ├── fetchFriends() → Truy vấn Supabase friendships → setFriends([])
  └── fetchFriendRequests() → Truy vấn Supabase friend_requests → setFriendRequests([])

Các hàm trợ giúp:
  ├── getFriendStatus(userId) → 'self' | 'friends' | 'request_sent' | 'request_received' | 'none'
  ├── sendRequest(receiverId) → INSERT friend_requests → refetch
  ├── acceptRequest(requestId) → UPDATE status → INSERT friendship → refetch
  └── removeFriend(userId) → DELETE friendship → cập nhật state cục bộ

Tìm bạn bè (FriendsPage tab Find):
  ├── Tìm kiếm: supabase.from('profiles').or(ilike username, ilike full_name)
  ├── Debounce 300ms trước khi query
  └── Hiển thị nút hành động dựa trên getFriendStatus()
```

### Luồng dữ liệu NotificationsContext:

```
Khi mount:
  ├── fetchNotifications() → Truy vấn Supabase với join sender → setNotifications([])
  └── Đăng ký kênh Supabase realtime → khi INSERT → thêm vào đầu danh sách

Khi có thông báo mới:
  └── Sự kiện realtime → fetch thông báo đầy đủ với join → thêm vào đầu → tăng unreadCount
```

### Luồng dữ liệu ChatContext:

```
Khi mount (user thay đổi):
  ├── fetchConversations() → Truy vấn conversations + join profiles → setConversations([])
  └── fetchUnreadCount() → Đếm messages chưa đọc → setUnreadCount(n)

Khi chọn hội thoại:
  ├── setActiveConversation(conv) → setMessages([])
  ├── fetchMessages(convId) → Truy vấn messages theo conversation → setMessages([])
  ├── markAsRead(convId) → UPDATE is_read = true cho tin nhắn chưa đọc
  └── Đăng ký realtime → lắng nghe INSERT trên messages WHERE conversation_id = convId

Khi gửi tin nhắn:
  ├── INSERT message → Realtime phát tin cho người nhận
  └── UPDATE conversation.last_message_at → Sắp xếp lại danh sách

Khi có tin nhắn mới (realtime):
  └── Sự kiện INSERT → thêm vào cuối messages → cập nhật preview + unreadCount
```

---

## 3. Chiến Lược Fetch Dữ Liệu

### Chiến lược 1: Fetch khi mount (hầu hết các trang)

```jsx
// Mẫu sử dụng trong FeedPage, ProfilePage, FriendsPage
useEffect(() => {
  fetchData()
}, [dependencies])  // Fetch lại khi user/friends thay đổi
```

### Chiến lược 2: Đăng ký thời gian thực (bảng tin + thông báo + tin nhắn)

```jsx
// Mẫu sử dụng trong FeedPage cho bài đăng mới
useEffect(() => {
  const channel = supabase
    .channel('channel-name')
    .on('postgres_changes', { event: 'INSERT', ... }, () => {
      fetchData()  // Fetch lại toàn bộ danh sách khi có insert mới
    })
    .subscribe()

  return () => supabase.removeChannel(channel)  // Dọn dẹp khi unmount
}, [user])
```

### Chiến lược 3: Cập nhật lạc quan (lượt thích)

```jsx
// Mẫu sử dụng trong PostCard cho lượt thích
async function handleLike() {
  // 1. Cập nhật UI ngay lập tức
  setLiked(true)
  setLikeCount(prev => prev + 1)

  // 2. Sau đó lưu vào cơ sở dữ liệu
  await supabase.from('likes').insert({ ... })
  // Nếu lỗi, có thể rollback (chưa triển khai — tỷ lệ thất bại thấp)
}
```

### Chiến lược 4: Gửi form (bài đăng, bình luận, hồ sơ)

```jsx
// Mẫu: vô hiệu hóa nút, hiện spinner, xóa form khi thành công
async function handleSubmit(e) {
  e.preventDefault()
  setLoading(true)
  try {
    await supabase.from('table').insert({ ... })
    resetForm()
    onSuccess?.()
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

## 4. Các Mẫu Thiết Kế Chính

### Mẫu 1: Provider + Custom Hook

Mọi context đều tuân theo cùng một mẫu:

```jsx
// 1. Tạo context
const MyContext = createContext({})

// 2. Export custom hook (API sạch sẽ)
export function useMyContext() {
  return useContext(MyContext)
}

// 3. Export provider (bọc children)
export default function MyProvider({ children }) {
  const [state, setState] = useState(...)
  // ... logic
  return <MyContext.Provider value={{ state, methods }}>{children}</MyContext.Provider>
}
```

**Tại sao mẫu này?** Người tiêu thụ không bao giờ import context trực tiếp — chỉ import hook. Điều này cho phép tái cấu trúc nội bộ context mà không thay đổi code phía người tiêu thụ.

### Mẫu 2: Tệp CSS Ghép Đôi

Mỗi component có một tệp `.css` ghép đôi tương ứng:

```
Button.jsx  ←→  Button.css
PostCard.jsx ←→ PostCard.css
```

Styles sử dụng đặt tên kiểu BEM gắn với component:
```css
.btn { }              /* Khối */
.btn__icon { }        /* Phần tử */
.btn--primary { }     /* Bổ sung */
.btn--loading { }     /* Bổ sung trạng thái */
```

### Mẫu 3: Truy Vấn Join Supabase

Ứng dụng sử dụng cú pháp quan hệ khóa ngoại của Supabase cho joins:

```javascript
// Mẫu khóa ngoại: table!foreign_key_name(columns)
supabase
  .from('posts')
  .select(`
    *,
    author:profiles(id, full_name, username, profile_photo_url),
    comments(id)
  `)
// Lưu ý: likes được fetch riêng vì bảng likes dùng target_id đa hình (không có FK trực tiếp đến posts)
```

### Mẫu 4: Render Điều Hướng Có Điều Kiện

`AppLayout` sidebar render các mục điều hướng khác nhau dựa trên kích thước màn hình:

```
Desktop (>1024px):  Sidebar đầy đủ với icons + nhãn
Tablet (768-1024):  Thanh sidebar chỉ có icon
Di động (<768px):   Thanh tab phía dưới + header phía trên với hamburger
```

Điều này đạt được hoàn toàn qua CSS media queries — không cần phát hiện kích thước bằng JS.

### Mẫu 5: Bảo Vệ Route

```jsx
// ProtectedRoute kiểm tra 3 điều kiện:
if (loading) return <PageSpinner />           // Auth đang tải
if (!user) return <Navigate to="/login" />     // Chưa xác thực
if (!profile) return <Navigate to="/create-profile" />  // Chưa có hồ sơ
return children                                // Tất cả OK, render trang
```

---

## 5. Lý Do Tổ Chức Tệp

```
src/
├── components/      ← Các phần UI tái sử dụng (không có logic nghiệp vụ)
│   ├── ui/          ← Chung: Button, Input, Card, v.v.
│   ├── layout/      ← Khung trang: AppLayout, AuthLayout
│   ├── posts/       ← Theo miền: CreatePost, PostCard
│   └── comments/    ← Theo miền: CommentSection
├── contexts/        ← Các provider state toàn cục (auth, friends, notifications, chat)
├── lib/             ← Client dịch vụ bên ngoài (supabase.js)
└── pages/           ← Components cấp route (một component mỗi route)
```

**Quy tắc**: Trang tổ hợp các component. Component không import trang. Context được tiêu thụ bởi cả hai.
