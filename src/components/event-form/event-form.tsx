'use client'

import { useQuery } from '@tanstack/react-query'
import { RepeatIcon } from 'lucide-react'
import * as React from 'react'

import { type CalendarSettings, useCalendarSettings } from '@/atoms/calendar-settings'
import {
	createDefaultEvent,
	parseCalendarEvent,
	parseDraftEvent,
	toCalendarEvent,
} from '@/components/event-form/utils'
import * as Icons from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import type { Calendar, CalendarEvent, DraftEvent } from '@/lib/interfaces'
import { useTRPC } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { createEventId, isDraftEvent } from '@/lib/utils/calendar'

import { AttendeeList, AttendeeListInput, AttendeeListItem } from './attendee-list'
import { CalendarField } from './calendar-field'
import { DateInputSection } from './date-input-section'
import { DescriptionField } from './description-field'
import { defaultValues, type FormValues, formSchema, useAppForm } from './form'
import { RepeatSelect } from './repeat-select'

interface EventFormProps {
	selectedEvent?: CalendarEvent | DraftEvent
	handleEventSave: (event: CalendarEvent) => void
	defaultCalendar?: Calendar
}

interface GetDefaultValuesOptions {
	event?: CalendarEvent | DraftEvent
	defaultCalendar?: Calendar
	settings: CalendarSettings
}

function getDefaultValues({
	event,
	defaultCalendar,
	settings,
}: GetDefaultValuesOptions): FormValues {
	if (!defaultCalendar) {
		return {
			...defaultValues,
			id: createEventId(),
		}
	}

	if (!event) {
		return createDefaultEvent({ settings, defaultCalendar })
	}

	if (isDraftEvent(event)) {
		return parseDraftEvent({
			event,
			defaultCalendar,
			settings,
		})
	}

	return parseCalendarEvent({ event, settings })
}

export function EventForm({ selectedEvent, handleEventSave, defaultCalendar }: EventFormProps) {
	const settings = useCalendarSettings()

	const trpc = useTRPC()
	const query = useQuery(trpc.calendars.list.queryOptions())

	const [event, setEvent] = React.useState(selectedEvent)
	const disabled = event?.readOnly

	const form = useAppForm({
		defaultValues: getDefaultValues({ event, defaultCalendar, settings }),
		validators: {
			onBlur: formSchema,
		},
		onSubmit: async ({ value }) => {
			const calendar = query.data?.accounts
				.flatMap(a => a.calendars)
				.find(c => c.id === value.calendar.calendarId)

			if (!calendar) {
				return
			}

			handleEventSave(toCalendarEvent({ values: value, event, calendar }))
		},
		listeners: {
			onBlur: async ({ formApi }) => {
				if (!formApi.state.isValid) {
					return
				}

				await formApi.handleSubmit()
			},
		},
	})

	React.useEffect(() => {
		// If the form is modified and the event changes, keep the modified values
		if (form.state.isDirty && selectedEvent?.id === event?.id) {
			return
		}

		setEvent(selectedEvent)

		form.reset()
	}, [selectedEvent, event, form])

	return (
		<form
			className={cn('flex flex-col gap-y-1')}
			onSubmit={async e => {
				e.preventDefault()
				e.stopPropagation()

				await form.handleSubmit()
			}}
		>
			<div className="p-1">
				<form.Field name="title">
					{field => (
						<>
							<label
								className="sr-only"
								htmlFor={field.name}
							>
								Title
							</label>
							<Input
								className="border-none bg-transparent px-3.5 text-base shadow-none dark:bg-transparent"
								disabled={disabled}
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								placeholder="Title"
								value={field.state.value}
							/>
						</>
					)}
				</form.Field>
			</div>
			<FormContainer>
				<div className="px-2.5">
					<DateInputSection
						disabled={disabled}
						form={form}
					/>
				</div>
				<Separator />
				<FormRow className="gap-x-1">
					<div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
						<div className="col-start-3 ps-1.5">
							<RepeatIcon className="size-4 text-muted-foreground opacity-50 peer-hover:text-foreground" />
						</div>
					</div>
					<form.Field name="isAllDay">
						{field => (
							<>
								<div className="col-start-1 flex ps-2">
									<Switch
										checked={field.state.value}
										disabled={disabled}
										id={field.name}
										onBlur={field.handleBlur}
										onCheckedChange={field.handleChange}
										size="sm"
									/>
								</div>
								<Label
									className={cn('col-start-2 ps-3.5', disabled && 'text-muted-foreground/70')}
									htmlFor={field.name}
								>
									All Day
								</Label>
							</>
						)}
					</form.Field>
					<form.Field name="repeat">
						{field => (
							<div className="relative col-span-2 col-start-3">
								<label
									className="sr-only"
									htmlFor={field.name}
								>
									Repeat
								</label>
								<RepeatSelect
									className="ps-8 shadow-none"
									disabled={disabled}
									id={field.name}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>
				</FormRow>
				<Separator />
				<FormRow>
					<div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-start gap-2 pt-2">
						<div className="col-start-1 ps-4">
							<Icons.Attendees className="size-4 text-muted-foreground opacity-50 peer-hover:text-foreground" />
						</div>
					</div>
					<form.Field
						mode="array"
						name="attendees"
					>
						{field => {
							return (
								<>
									<div className="col-span-4 col-start-1 flex flex-col">
										<AttendeeList className={cn(field.state.value.length > 0 && 'py-2')}>
											{field.state.value.map((v, i) => {
												return (
													<form.Field
														key={`${field.name}-${v.email}`}
														name={`attendees[${i}]`}
													>
														{subField => {
															return (
																<AttendeeListItem
																	email={subField.state.value.email}
																	name={subField.state.value.name}
																	status={subField.state.value.status}
																	type={subField.state.value.type}
																/>
															)
														}}
													</form.Field>
												)
											})}
										</AttendeeList>
									</div>
									<div
										className={cn(
											'col-span-4 col-start-1',
											field.state.value.length > 0 && 'col-span-3 col-start-2',
										)}
									>
										<AttendeeListInput
											className={cn('ps-8', field.state.value.length > 0 && 'ps-3')}
											disabled={disabled}
											onComplete={email => {
												field.pushValue({
													email,
													status: 'unknown',
													type: 'required',
												})
											}}
										/>
									</div>
								</>
							)
						}}
					</form.Field>
				</FormRow>
				<Separator />
				<FormRow>
					<div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-start gap-2 pt-2">
						<div className="col-start-1 ps-4">
							<Icons.Notes className="size-4 text-muted-foreground opacity-50 peer-hover:text-foreground" />
						</div>
					</div>
					<form.Field name="description">
						{field => (
							<div className="col-span-4 col-start-1">
								<label
									className="sr-only"
									htmlFor={field.name}
								>
									Description
								</label>
								<DescriptionField
									disabled={disabled}
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>
				</FormRow>
			</FormContainer>
			<div className="">
				<form.Field name="calendar">
					{field => (
						<>
							<label
								className="sr-only"
								htmlFor={field.name}
							>
								Title
							</label>
							<CalendarField
								className="px-4 text-base"
								disabled={disabled}
								id={field.name}
								items={query.data?.accounts ?? []}
								onChange={value => {
									field.handleChange(value)
									field.handleBlur()
								}}
								value={field.state.value}
							/>
						</>
					)}
				</form.Field>
			</div>
		</form>
	)
}

function FormRow({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('relative grid grid-cols-(--grid-event-form) items-center px-2', className)}
			{...props}
		>
			{children}
		</div>
	)
}

function FormContainer({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col gap-y-2 rounded-2xl border border-input bg-background px-0.5 py-2.5',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
