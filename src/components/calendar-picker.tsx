'use client'

import { useResizeObserver } from '@react-hookz/web'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'

import { useCalendarsVisibility } from '@/atoms'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Calendar } from '@/lib/interfaces'
import type { RouterOutputs } from '@/lib/trpc'
import { useTRPC } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

import { CalendarToggle } from './calendar-toggle'

interface VisibleCalendarProps {
	calendars?: Calendar[]
}

function VisibleCalendars({ calendars }: VisibleCalendarProps) {
	return (
		<div className="-space-x-1 flex">
			{calendars?.slice(0, calendars.length > 3 ? 3 : calendars.length).map(calendar => (
				<div
					className="size-4 rounded-full bg-(--calendar-color) ring-2 ring-background group-hover/trigger:ring-border"
					key={`${calendar.accountId}.${calendar.id}`}
					style={
						{
							'--calendar-color': calendar.color ?? 'var(--color-muted)',
						} as React.CSSProperties
					}
				/>
			))}
		</div>
	)
}

function useCalendarList() {
	const trpc = useTRPC()

	return useQuery(trpc.calendars.list.queryOptions())
}

function CalendarListItem({ calendar }: { calendar: Calendar }) {
	const [calendarsVisibility, setCalendarsVisibility] = useCalendarsVisibility()
	const textRef = React.useRef<HTMLSpanElement>(null)
	const [_isTextTruncated, setIsTextTruncated] = React.useState(false)

	// Check for text truncation whenever the element resizes
	useResizeObserver(textRef, () => {
		const element = textRef.current
		if (element) {
			setIsTextTruncated(element.scrollWidth > element.clientWidth)
		}
	})

	const handleCalendarVisibilityChange = React.useCallback(
		(checked: boolean, calendarId: string) => {
			const newHiddenCalendars = checked
				? calendarsVisibility.hiddenCalendars.filter(id => id !== calendarId)
				: [...calendarsVisibility.hiddenCalendars, calendarId]

			setCalendarsVisibility({
				hiddenCalendars: newHiddenCalendars,
			})
		},
		[calendarsVisibility.hiddenCalendars, setCalendarsVisibility],
	)

	const checked = !calendarsVisibility.hiddenCalendars.includes(calendar.id)

	return (
		<CommandItem
			className="gap-3 ps-3"
			onSelect={() => {
				handleCalendarVisibilityChange(!checked, calendar.id)
			}}
			value={`${calendar.name}`}
		>
			<CalendarToggle
				checked={checked}
				className="dark:border-neutral-700"
				onCheckedChange={(checked: boolean) => {
					handleCalendarVisibilityChange(checked, calendar.id)
				}}
				primaryCalendar={calendar.primary}
				style={
					{
						'--calendar-color': calendar.color ?? 'var(--color-muted-foreground)',
					} as React.CSSProperties
				}
			/>
			{calendar.name}
		</CommandItem>
	)
}

export function CalendarPicker() {
	const [open, setOpen] = React.useState(false)

	const { data } = useCalendarList()

	const [calendarVisibility] = useCalendarsVisibility()

	const visibleCalendars = React.useMemo(() => {
		return data?.accounts
			.flatMap(account => account.calendars)
			.filter(calendar => !calendarVisibility.hiddenCalendars.includes(calendar.id))
	}, [data, calendarVisibility])

	if (!data) {
		return null
	}

	return (
		<div className="flex items-center space-x-4">
			<Popover
				onOpenChange={setOpen}
				open={open}
			>
				<PopoverTrigger asChild>
					<Button
						className="group/trigger w-10 p-0 hover:bg-transparent dark:hover:bg-transparent"
						variant="ghost"
					>
						<span className="sr-only">Select calendars</span>
						<VisibleCalendars calendars={visibleCalendars} />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="center"
					className="w-fit min-w-64 max-w-72 p-0"
					side="bottom"
				>
					<Command>
						<CommandInput placeholder="Search calendars..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							{data.accounts.map(account => (
								<CommandGroup
									heading={account.name}
									key={account.id}
									value={account.name}
								>
									{account.calendars.map(calendar => (
										<CalendarListItem
											calendar={calendar}
											key={`${account.id}-${calendar.id}`}
										/>
									))}
								</CommandGroup>
							))}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export type CalenderAccount = RouterOutputs['calendars']['list']['accounts'][0]

interface CalendarListPickerProps extends React.ComponentProps<typeof Popover> {
	items: CalenderAccount[]
	value?: Calendar
	onSelect?: (calendar: Calendar) => void
}

export function CalendarListPicker({
	children,
	items,
	onSelect,
	...props
}: CalendarListPickerProps) {
	const [open, setOpen] = React.useState(false)

	return (
		<div className="flex items-center space-x-4">
			<Popover
				onOpenChange={setOpen}
				open={open}
				{...props}
			>
				{children}
				<PopoverContent
					align="end"
					className="w-fit min-w-(--radix-popper-anchor-width) max-w-96 p-0"
					side="bottom"
					sideOffset={4}
				>
					<Command>
						<CommandInput placeholder="Search calendars..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>

							{items.map(account => (
								<CommandGroup
									heading={account.name}
									key={account.id}
									value={account.name}
								>
									{account.calendars.map(calendar => (
										<CommandItem
											disabled={calendar.readOnly}
											key={`${account.id}-${calendar.id}`}
											onSelect={() => {
												onSelect?.(calendar)
												setOpen(false)
											}}
											value={`${calendar.name}`}
										>
											<div className="size-5 p-1">
												<div
													className={cn(
														'size-3 rounded-[4px] bg-(--calendar-color)',
														calendar.primary &&
															'outline-(--calendar-color) outline-2 outline-offset-2',
													)}
													style={
														{
															'--calendar-color': calendar.color ?? 'var(--color-muted-foreground)',
														} as React.CSSProperties
													}
												/>
											</div>
											{calendar.name}
										</CommandItem>
									))}
								</CommandGroup>
							))}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
