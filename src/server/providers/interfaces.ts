import type { Temporal } from 'temporal-polyfill'

import type { CreateEventInput, UpdateEventInput } from '../schemas/events'

export type TemporalDate = Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime

export interface Calendar {
	id: string
	providerId: 'google' | 'microsoft'
	name: string
	description?: string
	timeZone?: string
	primary: boolean
	accountId: string
	color?: string
	readOnly: boolean
}

export interface CalendarEvent {
	id: string
	title?: string
	description?: string
	start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime
	end: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime
	allDay?: boolean
	location?: string
	status?: string
	attendees?: Attendee[]
	url?: string
	color?: string
	readOnly: boolean
	providerId: 'google' | 'microsoft'
	accountId: string
	calendarId: string
	metadata?: Record<string, unknown>
}

export interface Attendee {
	id?: string
	email?: string
	name?: string
	status: 'accepted' | 'tentative' | 'declined' | 'unknown'
	type: 'required' | 'optional' | 'resource'
	comment?: string // Google only
	additionalGuests?: number // Google only
}

export type AttendeeStatus = Attendee['status']

export interface CalendarProvider {
	providerId: 'google' | 'microsoft'
	calendars(): Promise<Calendar[]>
	createCalendar(calendar: Omit<Calendar, 'id' | 'providerId'>): Promise<Calendar>
	updateCalendar(calendarId: string, calendar: Partial<Calendar>): Promise<Calendar>
	deleteCalendar(calendarId: string): Promise<void>
	events(
		calendar: Calendar,
		timeMin: Temporal.ZonedDateTime,
		timeMax: Temporal.ZonedDateTime,
	): Promise<CalendarEvent[]>
	createEvent(calendar: Calendar, event: CreateEventInput): Promise<CalendarEvent>
	updateEvent(calendar: Calendar, eventId: string, event: UpdateEventInput): Promise<CalendarEvent>
	deleteEvent(calendarId: string, eventId: string): Promise<void>
	responseToEvent(
		calendarId: string,
		eventId: string,
		response: {
			status: 'accepted' | 'tentative' | 'declined'
			comment?: string
		},
	): Promise<void>
}
