'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CustomMDX } from '@/components/post/mdx'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn, slugify } from '@/lib/utils'
import { api } from '@/trpc/react'

export default function PostEditor() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const slug = searchParams.get('slug')

	// State for post data
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [summary, setSummary] = useState('')
	const [tags, setTags] = useState('')
	const [category, setCategory] = useState('')
	const [image, setImage] = useState('')
	const [published, setPublished] = useState(false)
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [customSlug, setCustomSlug] = useState('')
	const [useCustomSlug, setUseCustomSlug] = useState(false)
	const [postId, setPostId] = useState<string | null>(null)

	// Fetch post data if slug is provided
	const { data: postData } = api.post.getBySlug.useQuery(
		{ slug: slug ?? '' },
		{
			enabled: !!slug,
		},
	)

	useEffect(() => {
		if (postData) {
			console.log('Post data loaded:', postData)
			setTitle(postData.title)
			setContent(postData.content)
			setSummary(postData.summary ?? '')
			setTags(postData.tags ?? '')
			setCategory(postData.category ?? '')
			setImage(postData.image ?? '')
			setPublished(postData.published)
			setDate(postData.publishedAt ?? new Date())
			setPostId(postData.id)
			setCustomSlug(postData.slug)
			setUseCustomSlug(true)
		}
	}, [postData])

	// Create or update post
	const createMutation = api.post.create.useMutation({
		onSuccess: data => {
			toast.success('Post created successfully!')
			router.push(`/admin/editor?slug=${data?.slug}`)
		},
		onError: error => {
			toast.error(error.message || 'Failed to create post')
		},
	})

	const updateMutation = api.post.update.useMutation({
		onSuccess: () => {
			toast.success('Post updated successfully!')
		},
		onError: error => {
			toast.error(error.message || 'Failed to update post')
		},
	})

	const handleSave = () => {
		if (!title) {
			toast.error('Title is required')
			return
		}

		const postSlug = useCustomSlug && customSlug ? customSlug : slugify(title)

		if (postId) {
			updateMutation.mutate({
				id: postId,
				title,
				content,
				summary,
				tags,
				category,
				image,
				published,
				publishedAt: date,
				slug: postSlug,
			})
		} else {
			createMutation.mutate({
				title,
				content,
				summary,
				tags,
				category,
				image,
				published,
				publishedAt: date,
				slug: postSlug,
			})
		}
	}

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-2xl">{slug ? 'Edit Post' : 'Create New Post'}</h1>
				<div className="flex flex-col gap-4">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={published}
							id="published"
							onCheckedChange={checked => setPublished(checked as boolean)}
						/>
						<Label htmlFor="published">Published</Label>
					</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className={cn(
									'w-[240px] justify-start text-left font-normal',
									!date && 'text-muted-foreground',
								)}
								variant={'outline'}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date ? format(date, 'PPP') : <span>Pick a date</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							className="w-auto p-0"
						>
							<Calendar
								initialFocus
								mode="single"
								onSelect={setDate}
								selected={date}
							/>
						</PopoverContent>
					</Popover>
					<Button
						disabled={createMutation.isPending || updateMutation.isPending}
						onClick={handleSave}
					>
						{createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</div>

			<div className="mb-6 space-y-4">
				<div>
					<Label htmlFor="title">Title</Label>
					<Input
						className="mt-1"
						id="title"
						onChange={e => setTitle(e.target.value)}
						placeholder="Post title"
						value={title}
					/>
				</div>

				<div className="flex items-start space-x-4">
					<div className="flex-1">
						<Label htmlFor="summary">Summary</Label>
						<Textarea
							className="mt-1 h-20"
							id="summary"
							onChange={e => setSummary(e.target.value)}
							placeholder="Brief summary of the post"
							value={summary}
						/>
					</div>
					<div className="flex-1">
						<div>
							<Label htmlFor="tags">Tags (comma separated)</Label>
							<Input
								className="mt-1"
								id="tags"
								onChange={e => setTags(e.target.value)}
								placeholder="React, TypeScript, etc."
								value={tags}
							/>
						</div>
						<div className="mt-4">
							<Label htmlFor="category">Category</Label>
							<Input
								className="mt-1"
								id="category"
								onChange={e => setCategory(e.target.value)}
								placeholder="Tutorial, Project, etc."
								value={category}
							/>
						</div>
					</div>
				</div>

				<div>
					<Label htmlFor="image">Featured Image URL</Label>
					<Input
						className="mt-1"
						id="image"
						onChange={e => setImage(e.target.value)}
						placeholder="/images/posts/my-image.png"
						value={image}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						checked={useCustomSlug}
						id="customSlug"
						onCheckedChange={checked => {
							setUseCustomSlug(checked as boolean)
							if (checked && !customSlug && title) {
								setCustomSlug(slugify(title))
							}
						}}
					/>
					<Label htmlFor="customSlug">Custom Slug</Label>
					{useCustomSlug && (
						<Input
							className="ml-2 max-w-xs"
							onChange={e => setCustomSlug(e.target.value)}
							placeholder="custom-url-slug"
							value={customSlug}
						/>
					)}
				</div>
			</div>

			<Tabs
				className="w-full"
				defaultValue="edit"
			>
				<TabsList className="mb-4">
					<TabsTrigger value="split">Split View</TabsTrigger>
					<TabsTrigger value="edit">Editor</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
				</TabsList>

				<TabsContent
					className="mt-0"
					value="split"
				>
					<div className="grid grid-cols-2 gap-4">
						<div className="rounded-md border p-4">
							<Textarea
								className="min-h-[600px] w-full resize-none font-mono"
								onChange={e => setContent(e.target.value)}
								placeholder="Write your content in MDX..."
								value={content}
							/>
						</div>
						<div className="max-h-[600px] overflow-auto rounded-md border p-4">
							<div className="prose prose-invert max-w-none">
								<CustomMDX source={content} />
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent
					className="mt-0"
					value="edit"
				>
					<Textarea
						className="min-h-[600px] w-full resize-none font-mono"
						onChange={e => setContent(e.target.value)}
						placeholder="Write your content in MDX..."
						value={content}
					/>
				</TabsContent>

				<TabsContent
					className="mt-0"
					value="preview"
				>
					<div className="max-h-[600px] overflow-auto rounded-md border p-4">
						<div className="prose prose-invert max-w-none">
							<CustomMDX source={content} />
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
