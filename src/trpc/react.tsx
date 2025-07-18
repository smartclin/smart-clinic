'use client'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
// ^-- to make sure we can mount the Provider from a server component
import superjson from 'superjson'

import type { AppRouter } from '@/server/api/root'

import { makeQueryClient } from './query-client'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>() // <--- Problematic line
function getUrl() {
	if (typeof window !== 'undefined') return '' // Browser should use relative path
	return process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT ?? 3000}`
}
// 1. Create the tRPC React client instance that gives you the hooks
export const trpc = createTRPCReact<AppRouter>() // <--- This 'trpc' will have .admin.createNewStaff.useMutation

// 2. Memoize QueryClient for browser (if you don't use makeQueryClient directly)
let browserQueryClient: QueryClient | undefined
function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
		return makeQueryClient() // Or new QueryClient()
	}
	// Browser: make a new query client if we don't already have one
	if (!browserQueryClient) browserQueryClient = makeQueryClient() // Or new QueryClient()
	return browserQueryClient
}
export function TRPCReactProvider(
	props: Readonly<{
		children: React.ReactNode
	}>,
) {
	const queryClient = getQueryClient()
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			// This creates a vanilla tRPC client, not the React hooks client
			links: [
				httpBatchLink({
					transformer: superjson,
					url: getUrl(),
				}),
			],
		}),
	)
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider
				queryClient={queryClient}
				trpcClient={trpcClient}
			>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
