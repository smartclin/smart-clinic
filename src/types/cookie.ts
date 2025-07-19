import type { cookies } from 'next/headers'

type ReadonlyRequestCookies = ReturnType<typeof cookies> extends Promise<infer T> ? T : never

export type { ReadonlyRequestCookies }
