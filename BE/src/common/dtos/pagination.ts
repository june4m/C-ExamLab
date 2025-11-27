import { t } from 'elysia'

export interface Pagination {
	total: number // Tổng số item
	page: number // Trang hiện tại
	limit: number // Số item/trang
	totalPages?: number // Tổng số trang (tính toán)
}

/**
 * Schema cho Pagination
 */
export const PaginationSchema = t.Object({
	page: t.Number(),
	limit: t.Number(),
	total: t.Number(),
	totalPages: t.Number()
})
