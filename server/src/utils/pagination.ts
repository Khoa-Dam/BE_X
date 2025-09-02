export const parsePagination = (q: any) => {
    const page = Math.max(1, Number(q?.qpge || 1))
    const limit = Math.min(100, Math.max(1, Number(q?.limit || 10)))
    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit
    }
}

export const buildMeta = (total: number, page: number, limit: number) => ({
    page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit))
})