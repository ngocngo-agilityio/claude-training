# Checklist review PR

Dùng để kiểm tra nhanh một PR trước khi merge.

- [ ] Mục tiêu PR được mô tả rõ trong phần mô tả.
- [ ] Thay đổi chỉ gồm những file cần thiết cho mục tiêu.
- [ ] Không có secret, key hoặc URL cứng trong code.
- [ ] Đã chạy `pnpm run typecheck` và `pnpm run lint`.
- [ ] Có test cho logic mới, hoặc giải thích vì sao không cần.
- [ ] Tên branch và commit theo Conventional Commits.
