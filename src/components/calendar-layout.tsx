'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useEffect } from 'react'

import { calendarSettingsAtom, defaultTimeZone } from '@/atoms/calendar-settings'
import { AppSidebar } from '@/components/app-sidebar'
import { CalendarView } from '@/components/calendar-view'
import { useEventOperations } from '@/components/event-calendar'
import { EventForm } from '@/components/event-form/event-form'
import { RightSidebar } from '@/components/right-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { useTRPC } from '@/lib/trpc/client'

export function CalendarLayout() {
	const [, setSettings] = useAtom(calendarSettingsAtom)

	useEffect(() => {
		setSettings(prev => ({
			...prev,
			defaultTimeZone,
		}))
	}, [setSettings])

	return (
		<>
			<AppSidebar
				side="left"
				variant="inset"
			/>
			<IsolatedCalendarLayout />
		</>
	)
}

function IsolatedCalendarLayout() {
	const trpc = useTRPC()
	const query = useQuery(trpc.calendars.list.queryOptions())

	const {
		events,
		selectedEvents,
		handleEventMove,
		handleEventSelect,
		handleEventSave,
		handleEventCreate,
		dispatchAction,
	} = useEventOperations()

	return (
		<>
			<SidebarInset className="h-full overflow-hidden">
				<div className="flex h-[calc(100dvh-1rem)]">
					<CalendarView
						className="grow"
						dispatchAction={dispatchAction}
						events={events}
						handleEventCreate={handleEventCreate}
						handleEventMove={handleEventMove}
						handleEventSelect={handleEventSelect}
					/>
				</div>
			</SidebarInset>
			<RightSidebar
				side="right"
				variant="inset"
			>
				<EventForm
					defaultCalendar={query.data?.defaultCalendar}
					handleEventSave={handleEventSave}
					selectedEvent={selectedEvents[0]}
				/>
			</RightSidebar>
		</>
	)
}
