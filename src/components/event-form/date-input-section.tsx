import { useField } from '@tanstack/react-form'
import { ArrowRight, Clock } from 'lucide-react'
import * as React from 'react'
import type { Temporal } from 'temporal-polyfill'

import { DateInput } from '@/components/date-input'
import { TimeInput } from '@/components/time-input'
import { TimezoneSelect } from '@/components/timezone-select'
import { cn } from '@/lib/utils'

import { defaultValues, withForm } from './form'

export const DateInputSection = withForm({
	defaultValues,
	props: {
		disabled: false as boolean | undefined,
	},
	render: function Render({ form, disabled }) {
		const startField = useField({ name: 'start', form })
		const endField = useField({ name: 'end', form })
		const isAllDayField = useField({ name: 'isAllDay', form })
		const isSameTimezone = startField.state.value.timeZoneId === endField.state.value.timeZoneId

		const onTimezoneChange = React.useCallback(
			(value: string) => {
				startField.handleChange(startField.state.value.withTimeZone(value))
				startField.handleBlur()
				endField.handleChange(endField.state.value.withTimeZone(value))
				endField.handleBlur()
			},
			[startField, endField],
		)

		const onStartTimezoneChange = React.useCallback(
			(value: string) => {
				startField.handleChange(startField.state.value.withTimeZone(value))
				startField.handleBlur()
			},
			[startField],
		)

		const onEndTimezoneChange = React.useCallback(
			(value: string) => {
				endField.handleChange(endField.state.value.withTimeZone(value))
				endField.handleBlur()
			},
			[endField],
		)

		const onStartChange = React.useCallback(
			(value: Temporal.ZonedDateTime) => {
				const duration = startField.state.value.until(endField.state.value)

				startField.handleChange(value)

				if (!isSameTimezone) {
					const newEnd = value.add(duration).withTimeZone(endField.state.value.timeZoneId)
					endField.handleChange(newEnd)
					endField.handleBlur()

					return
				}

				endField.handleChange(value.add(duration))
				endField.handleBlur()
			},
			[startField, endField, isSameTimezone],
		)

		const onEndChange = React.useCallback(
			(value: Temporal.ZonedDateTime) => {
				endField.handleChange(value)
				endField.handleBlur()
			},
			[endField],
		)

		const isAllDay = isAllDayField.state.value

		return (
			<section className="flex flex-col gap-y-2.5">
				<div
					className={cn(
						'relative grid grid-cols-(--grid-event-form) items-center gap-1',
						isAllDay && 'hidden',
					)}
				>
					<label
						className="sr-only"
						htmlFor="start.time"
					>
						Start time
					</label>
					<TimeInput
						className="col-span-2 col-start-1 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
						disabled={disabled}
						id="start.time"
						onChange={onStartChange}
						value={startField.state.value}
					/>
					<label
						className="sr-only"
						htmlFor="end.time"
					>
						End time
					</label>
					<TimeInput
						className="col-span-2 col-start-3 h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent"
						disabled={disabled}
						id="end.time"
						onChange={onEndChange}
						value={endField.state.value}
					/>
					<div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
						<div className="col-start-1 ps-1.5">
							<Clock className="size-4 text-muted-foreground peer-hover:text-foreground" />
						</div>
						<div className="col-start-3 ps-1.5">
							<ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
						</div>
					</div>
				</div>
				<div className="relative grid grid-cols-(--grid-event-form) items-center gap-1">
					<label
						className="sr-only"
						htmlFor="start.date"
					>
						Start date
					</label>
					<DateInput
						className={cn(
							'col-span-1 col-start-2 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent',
							isAllDay && 'col-span-2 col-start-1 ps-8',
						)}
						disabled={disabled}
						id="start.date"
						onChange={onStartChange}
						value={startField.state.value}
					/>
					<label
						className="sr-only"
						htmlFor="end.date"
					>
						End date
					</label>
					<DateInput
						className={cn(
							'col-span-1 col-start-4 h-8 border-none bg-transparent ps-3 shadow-none dark:bg-transparent',
							isAllDay && 'col-span-2 col-start-3 ps-8',
						)}
						disabled={disabled}
						id="end.date"
						minValue={startField.state.value}
						onChange={onEndChange}
						value={endField.state.value}
					/>
					{isAllDay ? (
						<div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
							<div className="col-start-1 ps-1.5">
								<Clock className="size-4 text-muted-foreground peer-hover:text-foreground" />
							</div>
							<div className="col-start-3 ps-1.5">
								<ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
							</div>
						</div>
					) : null}
				</div>
				{isSameTimezone ? (
					<>
						<label
							className="sr-only"
							htmlFor="timezone"
						>
							Select a timezone
						</label>
						<TimezoneSelect
							className="w-full"
							disabled={disabled}
							id="timezone"
							onChange={onTimezoneChange}
							value={startField.state.value.timeZoneId}
						/>
					</>
				) : (
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label
								className="sr-only"
								htmlFor="start-timezone"
							>
								Start timezone
							</label>
							<TimezoneSelect
								className="w-full"
								disabled={disabled}
								id="start-timezone"
								onChange={onStartTimezoneChange}
								value={startField.state.value.timeZoneId}
							/>
						</div>
						<div>
							<label
								className="sr-only"
								htmlFor="end-timezone"
							>
								End timezone
							</label>
							<TimezoneSelect
								className="w-full"
								disabled={disabled}
								id="end-timezone"
								onChange={onEndTimezoneChange}
								value={endField.state.value.timeZoneId}
							/>
						</div>
					</div>
				)}
			</section>
		)
	},
})
