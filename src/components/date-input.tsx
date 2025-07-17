'use client'

import { format, sameDay } from '@formkit/tempo'
import { toDate } from '@repo/temporal'
import { parseDate } from 'chrono-node'
import { useAtomValue } from 'jotai'
import * as React from 'react'
import { Temporal } from 'temporal-polyfill'

import { calendarSettingsAtom } from '@/atoms'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FormatDateOptions {
	date?: Date | undefined
	locale?: string
}

function formatDate({ date, locale }: FormatDateOptions) {
	if (!date) {
		return ''
	}

	const isThisYear = date.getFullYear() === new Date().getFullYear()

	return format(date, isThisYear ? 'ddd D MMM' : 'ddd D MMM YYYY', locale)
}

interface DateInputProps {
	className?: string
	id?: string
	value: Temporal.ZonedDateTime
	onChange: (value: Temporal.ZonedDateTime) => void
	minValue?: Temporal.ZonedDateTime
	disabled?: boolean
}

export function DateInput({ className, id, value, onChange, minValue, disabled }: DateInputProps) {
	const { locale } = useAtomValue(calendarSettingsAtom)
	const [open, setOpen] = React.useState(false)
	const [date, setDate] = React.useState<Date | undefined>(new Date())
	const [month, setMonth] = React.useState<Date | undefined>(date)
	const [input, setInput] = React.useState(formatDate({ date, locale }))

	const minDate = React.useMemo(() => {
		if (!minValue) {
			return undefined
		}

		return toDate({ value: minValue, timeZone: minValue.timeZoneId })
	}, [minValue])

	React.useEffect(() => {
		const date = toDate({ value, timeZone: value.timeZoneId })
		setDate(date)
		setMonth(date)
		setInput(formatDate({ date, locale }))
	}, [value, locale])

	const onComplete = React.useCallback(
		(date: Date) => {
			const zonedDateTime = value.with({
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				day: date.getDate(),
			})

			if (minValue && Temporal.ZonedDateTime.compare(zonedDateTime, minValue) < 0) {
				return
			}

			setDate(date)
			setMonth(date)
			setInput(formatDate({ date, locale }))
			onChange(zonedDateTime)
		},
		[value, onChange, locale, minValue],
	)

	const onInput = React.useCallback(
		(newValue: string) => {
			const date = parseDate(newValue)

			if (!date || (minDate && date < minDate)) {
				const date = toDate({ value, timeZone: value.timeZoneId })
				setDate(date)
				setMonth(date)
				setInput(formatDate({ date, locale }))
				return
			}

			onComplete(date)
		},
		[minDate, onComplete, value, locale],
	)

	const onInputChange = React.useCallback((newValue: string) => {
		setInput(newValue)

		const date = parseDate(newValue)

		if (!date) {
			return
		}

		setDate(date)
		setMonth(date)
	}, [])

	const triggerRef = React.useRef<HTMLButtonElement>(null)
	const inputRef = React.useRef<HTMLInputElement>(null)

	const onOpenChange = React.useCallback(
		(open: boolean) => {
			if (disabled) {
				return
			}
			setOpen(open)
		},
		[disabled],
	)

	return (
		<Popover
			onOpenChange={onOpenChange}
			open={open && !disabled}
		>
			<PopoverTrigger
				className="hidden"
				ref={triggerRef}
			/>
			<PopoverAnchor asChild>
				<Input
					className={cn(
						'col-span-2 col-start-1 h-8 border-none bg-transparent ps-7 font-medium text-sm md:text-sm dark:bg-transparent',
						minDate && date && sameDay(date, minDate) && 'text-muted-foreground',
						className,
					)}
					disabled={disabled}
					id={id}
					onBlur={e => onInput(e.target.value)}
					onChange={e => onInputChange(e.target.value)}
					onFocus={() => {
						if (open) {
							return
						}
						setOpen(true)
					}}
					onKeyDown={e => {
						if (e.key !== 'Enter') {
							return
						}
						setOpen(false)
						onInput(input)
					}}
					ref={inputRef}
					value={input}
				/>
			</PopoverAnchor>
			<PopoverContent
				align="end"
				className="w-auto overflow-hidden p-0"
				onFocusOutside={e => {
					if (inputRef.current?.contains(e.target as Node)) {
						e.preventDefault()
					}
				}}
				onInteractOutside={e => {
					if (inputRef.current?.contains(e.target as Node)) {
						e.preventDefault()
					}
				}}
				onOpenAutoFocus={e => e.preventDefault()}
				onPointerDownOutside={e => {
					if (inputRef.current?.contains(e.target as Node)) {
						e.preventDefault()
					}
				}}
			>
				<Calendar
					mode="single"
					modifiers={{
						min: minDate,
					}}
					// TODO: styling currently broken, see whether we can fix this
					// captionLayout="dropdown"
					month={month}
					onMonthChange={setMonth}
					onSelect={date => {
						React.startTransition(() => {
							if (!date) {
								return
							}

							onComplete(date)
						})

						setOpen(false)
					}}
					selected={date}
				/>
			</PopoverContent>
		</Popover>
	)
}
