'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type * as React from 'react'

import { cn } from '@/lib/utils'

interface CalendarToggleProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
	className?: string
	primaryCalendar?: boolean
}

export function CalendarToggle({ className, primaryCalendar, ...props }: CalendarToggleProps) {
	return (
		<CheckboxPrimitive.Root
			className={cn(
				'peer size-3 shrink-0 rounded-[4px] shadow-xs transition-shadow',
				'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
				'disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary',
				'bg-(--calendar-color)/40 data-[state=checked]:bg-(--calendar-color) dark:aria-invalid:ring-destructive/40',
				primaryCalendar && 'outline-(--calendar-color) outline-2 outline-offset-2',
				className,
			)}
			data-slot="checkbox"
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className="flex items-center justify-center text-current transition-none"
				data-slot="checkbox-indicator"
			/>
		</CheckboxPrimitive.Root>
	)
}
