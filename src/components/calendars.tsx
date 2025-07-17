'use client'

import { useResizeObserver } from '@react-hookz/web'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Fragment, useMemo, useRef, useState } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/trpc/react'

import { CalendarToggle } from './calendar-toggle'

export type CalendarItem = {
	id: string
	providerId: string
	name: string
	primary: boolean | undefined
}

function useCalendarList() {
	const trpc = useTRPC()

	return useQuery(trpc.calendars.list.queryOptions())
}

export function Calendars() {
	const { data, isLoading } = useCalendarList()

	if (isLoading) {
		return <CalendarsSkeleton />
	}

	if (!data) {
		return null
	}

	return (
		<div className="scrollbar-hidden relative flex flex-1 flex-col gap-2 overflow-auto">
			{data.accounts.map((account, index) => (
				<Fragment key={account.name}>
					<SidebarGroup
						className="py-0"
						key={account.name}
					>
						<Collapsible
							className="group/collapsible"
							defaultOpen={index === 0}
						>
							<CalendarName name={account.name} />
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{account.calendars.map((item: CalendarItem) => (
											<ItemWithToggle
												item={item}
												key={item.id}
											/>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</Collapsible>
					</SidebarGroup>
				</Fragment>
			))}
		</div>
	)
}

function CalendarsSkeleton() {
	const accountsData = [{ calendars: 3 }, { calendars: 2 }]

	return (
		<div className="flex flex-col gap-2 pb-2">
			{accountsData.map((account, accountIndex) => (
				<div key={accountIndex}>
					<div className="flex items-center gap-2 px-2 py-2">
						<Skeleton className="h-4 w-24 animate-shimmer bg-neutral-500/20" />
						<div className="ml-auto">
							<Skeleton className="h-4 w-4 bg-neutral-500/20" />
						</div>
					</div>
					<div className="space-y-1 pl-0.5">
						{Array.from({ length: account.calendars }).map((_, calendarIndex) => (
							<div
								className="flex items-center gap-2 px-2 py-2"
								key={calendarIndex}
							>
								<Skeleton className="h-4 w-4 rounded bg-neutral-500/20" />
								<Skeleton className="h-4 flex-1 animate-shimmer bg-neutral-500/20" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	)
}

function CalendarName({ name }: { name: string }) {
	const nameParts = useMemo(() => {
		if (name.includes('@')) {
			const parts = name.split('@')
			return [parts[0], `@${parts[1]}`]
		}
		return [name, '']
	}, [name])

	return (
		<SidebarGroupLabel
			asChild
			className="group/label w-full text-sm hover:bg-sidebar-accent"
		>
			<CollapsibleTrigger className="flex w-full items-center justify-between">
				<span className="truncate">{nameParts[0]}</span>
				<span className="mr-1 block flex-1 text-left">{nameParts[1]}</span>
				<ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
			</CollapsibleTrigger>
		</SidebarGroupLabel>
	)
}

function ItemWithToggle({ item }: { item: CalendarItem }) {
	const textRef = useRef<HTMLSpanElement>(null)
	const [isTextTruncated, setIsTextTruncated] = useState(false)

	// Check for text truncation whenever the element resizes
	useResizeObserver(textRef, () => {
		const element = textRef.current
		if (element) {
			setIsTextTruncated(element.scrollWidth > element.clientWidth)
		}
	})

	// const handleCalendarVisibilityChange = useCallback(
	//   (checked: boolean, calendarId: string) => {
	//     const newHiddenCalendars = checked
	//       ? calendarsVisibility.hiddenCalendars.filter((id) => id !== calendarId)
	//       : [...calendarsVisibility.hiddenCalendars, calendarId];

	//     setCalendarsVisibility({
	//       hiddenCalendars: newHiddenCalendars,
	//     });
	//   },
	//   [calendarsVisibility.hiddenCalendars, setCalendarsVisibility],
	// );

	const tooltipProps = {
		side: 'bottom' as const,
		align: 'start' as const,
		sideOffset: 8,
		className: 'bg-sidebar-accent text-sidebar-accent-foreground',
		children: item.name,
	}

	return (
		<SidebarMenuItem
			className="group/item"
			key={item.id}
		>
			<SidebarMenuButton
				asChild
				className="hover:bg-neutral-600/20"
				tooltip={isTextTruncated ? tooltipProps : undefined}
			>
				<div className="relative flex items-center gap-3">
					<CalendarToggle
						className="dark:border-neutral-700"
						primaryCalendar={item.primary}
						// checked={!calendarsVisibility.hiddenCalendars.includes(item.id)}
						// onCheckedChange={(checked: boolean) => {
						//   handleCalendarVisibilityChange(checked, item.id);
						// }}
						style={
							{
								'--calendar-color': 'var(--color-red-500)',
							} as React.CSSProperties
						}
					/>
					<span
						className="line-clamp-1 block select-none"
						ref={textRef}
					>
						{item.name}
					</span>
				</div>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}
