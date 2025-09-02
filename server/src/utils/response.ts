
export class AppError extends Error {
    constructor(public code: string, message: string, public status = 400, public details?: any) {
        super(message)
    }
}

export const success = <T>(data: T, meta: any = null) => ({
    success: true,
    data,
    error: null,
    meta
})

export const failBody = (code: string, message: string, details?: any) => ({
    success: false,
    data: null,
    error: {
        code,
        message,
        details
    }
})

