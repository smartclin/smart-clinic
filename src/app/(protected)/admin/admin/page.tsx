'use client'

import { BarChart, Edit, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/trpc/react'

export default function AdminDashboard() {
	const router = useRouter()
	const { data: postsData } = api.post.getAll.useQuery({
		onlyPublished: false,
	})

	const totalPosts = postsData?.items.length ?? 0
	const publishedPosts = postsData?.items.filter(post => post.published).length ?? 0
	const draftPosts = totalPosts - publishedPosts

	return (
		<div className="container mx-auto py-6">
			<h1 className="mb-6 font-bold text-2xl">Dashboard</h1>

			<div className="mb-8 grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Posts</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{totalPosts}</div>
						<p className="mt-1 text-muted-foreground text-xs">All blog posts in the database</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Published</CardTitle>
						<BarChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{publishedPosts}</div>
						<p className="mt-1 text-muted-foreground text-xs">Posts visible to readers</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Drafts</CardTitle>
						<Edit className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{draftPosts}</div>
						<p className="mt-1 text-muted-foreground text-xs">Unpublished content</p>
					</CardContent>
				</Card>
			</div>

			<div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
				<Button
					className="flex items-center"
					onClick={() => router.push('/admin/posts')}
					size="lg"
				>
					<FileText className="mr-2 h-4 w-4" />
					Manage Posts
				</Button>

				<Button
					className="flex items-center"
					onClick={() => router.push('/admin/editor')}
					size="lg"
					variant="outline"
				>
					<Edit className="mr-2 h-4 w-4" />
					Create New Post
				</Button>
			</div>
		</div>
	)
}
