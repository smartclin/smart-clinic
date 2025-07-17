import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { RepeatType } from './form'

interface RepeatSelectProps {
	className?: string
	id?: string
	value: RepeatType
	onChange: (value: RepeatType) => void
	onBlur: () => void
	disabled?: boolean
}

function getRepeatOptions() {
	return [
		{ label: 'Daily', value: 'daily' },
		{ label: 'Weekly', value: 'weekly' },
		{ label: 'Monthly', value: 'monthly' },
	]
}

export function RepeatSelect({
	className,
	id,
	value,
	onChange,
	onBlur,
	disabled,
}: RepeatSelectProps) {
	return (
		<Select>
			<SelectTrigger
				className={cn(
					'h-8 border-none bg-transparent dark:bg-transparent [&_svg]:hidden',
					className,
				)}
				disabled
				id={id}
				onBlur={onBlur}
			>
				<SelectValue placeholder="Repeat" />
			</SelectTrigger>
			<SelectContent>
				{getRepeatOptions().map(option => (
					<SelectItem
						key={option.value}
						value={option.value}
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
