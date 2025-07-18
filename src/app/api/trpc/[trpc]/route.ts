import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { NextRequest } from 'next/server'

import { env } from '@/env'
import { appRouter, createContext } from '@/server/api/root'

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req,
		router: appRouter,
		createContext: () => createContext({ headers: req.headers }),
		onError:
			env.NODE_ENV === 'development'
				? ({ path, error }) => {
						console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
					}
				: undefined,
	})

export { handler as GET, handler as POST }
