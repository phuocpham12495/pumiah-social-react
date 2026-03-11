# 🧪 Kế Hoạch Kiểm Thử — Pumiah Social

> Tài liệu Kiến Trúc Sư QA: Mẫu unit test, kịch bản integration, luồng E2E và cấu hình CI/CD.

---

## Tổng Quan Chiến Lược Kiểm Thử

| Lớp | Công cụ | Mục tiêu phủ sóng |
|-----|---------|-------------------|
| **Unit** | Vitest + React Testing Library | 80% logic component |
| **Integration** | Vitest + MSW (Mock Service Worker) | Tất cả tương tác API |
| **E2E** | Playwright | Tất cả 19 user stories |
| **Visual** | Thủ công / Ảnh chụp Playwright | Tất cả trang, 3 breakpoints |

---

## Mẫu Unit Test

### Mẫu: Render Component

```javascript
// tests/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../src/components/ui/Button'

describe('Button', () => {
  it('render với văn bản children', () => {
    render(<Button>Nhấp Tôi</Button>)
    expect(screen.getByText('Nhấp Tôi')).toBeInTheDocument()
  })

  it('gọi handler onClick', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Nhấp</Button>)
    fireEvent.click(screen.getByText('Nhấp'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('hiện spinner khi đang tải', () => {
    render(<Button loading>Gửi</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
  })

  it('áp dụng class variant', () => {
    render(<Button variant="danger">Xóa</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--danger')
  })

  it('render với icon', () => {
    render(<Button icon={<span data-testid="icon">★</span>}>Sao</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
```

### Mẫu: Context Hook

```javascript
// tests/contexts/AuthContext.test.jsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthProvider, { useAuth } from '../../src/contexts/AuthContext'

// Giả lập Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockReturnThis(),
    }),
  }
}))

describe('useAuth', () => {
  it('bắt đầu với trạng thái đang tải', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })
    expect(result.current.loading).toBe(true)
  })

  it('cung cấp phương thức signIn', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })
    expect(typeof result.current.signIn).toBe('function')
  })

  it('cung cấp phương thức signUp', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })
    expect(typeof result.current.signUp).toBe('function')
  })
})
```

### Mẫu: Component Trang

```javascript
// tests/pages/LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../../src/pages/LoginPage'
import AuthProvider from '../../src/contexts/AuthContext'

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('render form đăng nhập', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('hiện lỗi khi thông tin đăng nhập không hợp lệ', async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@test.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument()
    })
  })

  it('có liên kết đến trang đăng ký', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText(/sign up/i)).toHaveAttribute('href', '/signup')
  })
})
```

---

## Kịch Bản Integration Test

### IT-001: Luồng Xác Thực
```
Kịch bản: Hoàn thành đăng ký → đăng nhập → tạo hồ sơ
  Cho rằng người dùng truy cập /signup
  Khi người dùng nhập email và mật khẩu hợp lệ
  Thì người dùng nhận được thông báo xác nhận
  Khi người dùng nhấp liên kết xác nhận
  Và người dùng đăng nhập với thông tin đăng nhập
  Thì người dùng được chuyển hướng đến /create-profile
  Khi người dùng điền tên, tên người dùng, tiểu sử
  Và người dùng nhấp "Hoàn Thành Hồ Sơ"
  Thì người dùng được chuyển hướng đến /feed
  Và hồ sơ hiển thị trong sidebar
```

### IT-002: Luồng Yêu Cầu Kết Bạn
```
Kịch bản: Gửi → Chấp nhận → Tình bạn
  Cho rằng Người dùng A và Người dùng B đã đăng ký
  Khi Người dùng A truy cập hồ sơ Người dùng B
  Và Người dùng A nhấp "Thêm Bạn"
  Thì nút chuyển thành "Đã Gửi Yêu Cầu"
  Và Người dùng B nhận được thông báo
  Khi Người dùng B đi đến /friends
  Và Người dùng B nhấp "Chấp Nhận"
  Thì cả hai người dùng xuất hiện trong danh sách bạn bè của nhau
  Và Người dùng B nhận thông báo "friend_request_accepted"
```

### IT-003: Luồng Bài Đăng + Bình Luận + Thích
```
Kịch bản: Tạo bài đăng → Bình luận → Thích
  Cho rằng Người dùng A và Người dùng B là bạn bè
  Khi Người dùng A tạo bài đăng văn bản "Xin chào Thế giới"
  Thì bài đăng xuất hiện trong bảng tin của Người dùng A
  Và bài đăng xuất hiện trong bảng tin của Người dùng B
  Khi Người dùng B thích bài đăng
  Thì số lượt thích hiển thị 1
  Và Người dùng A nhận thông báo "like_post"
  Khi Người dùng B bình luận "Bài đăng hay!"
  Thì số bình luận hiển thị 1
  Và Người dùng A nhận thông báo "comment_post"
```

### IT-004: Luồng Tải Ảnh
```
Kịch bản: Tải ảnh hồ sơ và ảnh bài đăng
  Cho rằng người dùng đã đăng nhập và có hồ sơ
  Khi người dùng đi đến /settings
  Và người dùng nhấp avatar và chọn một ảnh
  Thì ảnh được tải lên bucket profile_photos
  Và avatar cập nhật trên toàn ứng dụng
  Khi người dùng tạo bài đăng với ảnh
  Thì ảnh được tải lên bucket post_images
  Và bài đăng hiển thị ảnh trong bảng tin
```

### IT-005: Chế Độ Ngoại Tuyến
```
Kịch bản: Ứng dụng xử lý ngoại tuyến một cách duyên dáng
  Cho rằng người dùng đang ở /feed với bài đăng đã tải
  Khi mất kết nối mạng
  Thì banner ngoại tuyến xuất hiện
  Và các bài đăng đã cache vẫn hiển thị
  Khi kết nối mạng được khôi phục
  Thì banner ngoại tuyến biến mất
  Và các bài đăng mới được tải
```

---

## Luồng Kiểm Thử E2E (User Stories)

| ID | User Story | Các bước | Kết quả mong đợi |
|----|-----------|----------|-------------------|
| US-01 | Đăng ký | Nhập email + mật khẩu → Gửi | Hiển thị xác nhận |
| US-02 | Đăng nhập | Nhập thông tin đăng nhập → Gửi | Chuyển hướng đến /feed |
| US-03 | Tạo hồ sơ | Điền tên, tên người dùng, tiểu sử, ảnh → Gửi | Chuyển hướng đến /feed |
| US-04 | Xem hồ sơ bản thân | Nhấp avatar trong sidebar | Trang hồ sơ với thông tin bản thân |
| US-05 | Chỉnh sửa hồ sơ | Đi đến /settings → Đổi tên → Lưu | Thông báo thành công, tên đã cập nhật |
| US-06 | Xem hồ sơ người khác | Nhấp tên người dùng khác | Trang hồ sơ của họ |
| US-07 | Gửi yêu cầu kết bạn | Truy cập hồ sơ → Nhấp "Thêm Bạn" | Nút → "Đã Gửi Yêu Cầu" |
| US-08 | Chấp nhận yêu cầu | Đi đến /friends → Tab yêu cầu → Chấp nhận | Người dùng chuyển sang danh sách bạn bè |
| US-09 | Từ chối yêu cầu | Đi đến /friends → Tab yêu cầu → Từ chối | Yêu cầu bị xóa |
| US-10 | Xem bạn bè | Đi đến /friends | Danh sách bạn bè phân trang |
| US-11 | Xóa bạn bè | Danh sách bạn bè → Nhấp Xóa → Xác nhận | Bạn bè bị xóa |
| US-12 | Tạo bài đăng văn bản | Bảng tin → Nhập văn bản → Nhấp Đăng | Bài đăng xuất hiện trong bảng tin |
| US-13 | Tạo bài đăng ảnh | Bảng tin → Nhấp nút ảnh → Chọn tệp → Đăng | Bài đăng có ảnh trong bảng tin |
| US-14 | Tạo bài đăng liên kết | Bảng tin → Nhấp nút liên kết → Dán URL → Đăng | Bài đăng có xem trước liên kết |
| US-15 | Thích bài đăng | Nhấp biểu tượng trái tim trên bài đăng | Trái tim đầy, số lượng +1 |
| US-16 | Bình luận bài đăng | Nhấp bình luận → Nhập → Gửi | Bình luận xuất hiện dưới bài đăng |
| US-17 | Xóa bài đăng | Bài đăng của mình → Menu → Xóa → Xác nhận | Bài đăng bị xóa khỏi bảng tin |
| US-18 | Xem thông báo | Nhấp biểu tượng chuông | Danh sách thông báo theo loại |
| US-19 | Đánh dấu đã đọc | Nhấp thông báo | Chấm xanh biến mất |

---

## Cấu Hình Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: Pumiah Social CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Kiểm tra kiểu
        run: npx tsc --noEmit || true

      - name: Unit tests
        run: npx vitest run --coverage

      - name: Build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Cài đặt Playwright
        run: npx playwright install --with-deps chromium

      - name: Chạy kiểm thử E2E
        run: npx playwright test
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [lint-and-test, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Triển khai lên hosting
        run: echo "Bước triển khai ở đây (Vercel/Netlify/Firebase)"
```

---

## Dữ Liệu Test Seed

```sql
-- Người dùng test (chỉ dùng cho phát triển cục bộ)
-- Sử dụng Supabase Dashboard > Authentication để tạo người dùng test
-- Sau đó chèn hồ sơ tương ứng:

-- INSERT INTO profiles (id, username, full_name, bio)
-- VALUES
--   ('<user-1-uuid>', 'testuser1', 'Test User One', 'Tài khoản test đầu tiên'),
--   ('<user-2-uuid>', 'testuser2', 'Test User Two', 'Tài khoản test thứ hai');
```
