import * as React from 'react'
import { z } from 'zod'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Combobox, ComboboxInput, ComboboxLabel } from '@/components/ui/combobox'
import { cn } from '@/lib/utils'

interface AttendeeListItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
	name?: string
	email: string
	status: 'accepted' | 'declined' | 'tentative' | 'unknown'
	type?: 'required' | 'optional' | 'resource'
}

export function AttendeeListItem({
	className,
	name,
	email,
	status,
	type,
	...props
}: AttendeeListItemProps) {
	return (
		<div
			className={cn('flex items-center gap-2 ps-8', className)}
			{...props}
		>
			<Avatar className="size-5">
				{/* <AvatarImage src="https://github.com/shadcn.png" /> */}
				<AvatarFallback className="text-xs">{name?.charAt(0) ?? email.charAt(0)}</AvatarFallback>
			</Avatar>
			<div className="flex flex-col">
				<p className="font-medium text-sm">{name}</p>
				<p className="text-muted-foreground text-xs">{email}</p>
			</div>
		</div>
	)
}

type AttendeeListProps = React.ComponentPropsWithoutRef<'div'>

export function AttendeeList({ children, className, ...props }: AttendeeListProps) {
	return (
		<div
			className={cn('flex flex-col gap-2', className)}
			{...props}
		>
			{children}
		</div>
	)
}

interface AttendeeListInputProps {
	onComplete: (email: string) => void
	className?: string
	disabled?: boolean
}

export function AttendeeListInput({ className, onComplete, disabled }: AttendeeListInputProps) {
	const [searchValue, setSearchValue] = React.useState<string>('')

	const onInputChange = (value: string) => {
		setSearchValue(value)

		if (z.string().email().safeParse(value).error) {
			return
		}

		onComplete(value)
		setSearchValue('')
	}

	return (
		<Combobox
			setValue={value => {
				setSearchValue(value)
			}}
			value={searchValue}
		>
			<ComboboxLabel
				className="sr-only"
				htmlFor="attendees"
			>
				Attendees
			</ComboboxLabel>
			<ComboboxInput
				className={cn(
					'h-8 border-none bg-transparent font-medium shadow-none dark:bg-transparent',
					className,
				)}
				disabled={disabled}
				id="attendees"
				onBlur={e => onInputChange(e.target.value)}
				onKeyDown={e => {
					if (e.key !== 'Enter') {
						return
					}

					onInputChange(searchValue)
				}}
				placeholder="Attendees"
			/>
		</Combobox>
	)
}
