import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'

import { superjson as SuperJSON } from './superjson'

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
				refetchOnReconnect: 'always',
				refetchOnWindowFocus: 'always',
				refetchOnMount: 'always',
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: query =>
					defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
		return makeQueryClient()
	}
	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient()
	return browserQueryClient
}
