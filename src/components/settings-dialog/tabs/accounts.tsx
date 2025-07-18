import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { AddAccountDialog } from '@/components/add-account-dialog'
import { Google, Microsoft } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { RouterOutputs } from '@/trpc'
import { useTRPC } from '@/trpc/client'

import {
	SettingsPage,
	SettingsSection,
	SettingsSectionDescription,
	SettingsSectionHeader,
	SettingsSectionTitle,
} from './settings-page'

export function Accounts() {
	return (
		<SettingsPage>
			<DefaultCalendarSection />

			<ConnectedAccountsSection />
		</SettingsPage>
	)
}

function DefaultCalendarSection() {
	return (
		<SettingsSection>
			<SettingsSectionHeader>
				<SettingsSectionTitle>Default Calendar</SettingsSectionTitle>
				<SettingsSectionDescription>
					Events will be created in this calendar by default
				</SettingsSectionDescription>
			</SettingsSectionHeader>

			<DefaultCalendarPicker />
		</SettingsSection>
	)
}

function DefaultCalendarPicker() {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const query = useQuery(trpc.calendars.list.queryOptions())
	const mutation = useMutation(
		trpc.calendars.setDefault.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() })
			},
		}),
	)

	if (query.isPending) {
		return <DefaultCalendarPickerSkeleton />
	}

	if (query.isError) {
		return (
			<div className="py-4 text-center text-muted-foreground">
				<p>No calendars available.</p>
				<p className="mt-1 text-sm">Add an account to get started.</p>
			</div>
		)
	}

	const handleChange = (value: string) => {
		const accountId = query.data.accounts.find(account =>
			account.calendars.some(calendar => calendar.id === value),
		)?.id

		if (!accountId) {
			return
		}

		mutation.mutate({ calendarId: value, accountId })
	}

	return (
		<div className="space-y-2">
			<Label
				className="sr-only"
				htmlFor="default-calendar"
			>
				Default Calendar
			</Label>
			<Select
				onValueChange={handleChange}
				value={query.data.defaultCalendar.id}
			>
				<SelectTrigger
					className="w-fit min-w-48 max-w-full"
					id="default-calendar"
				>
					<SelectValue placeholder="Select default calendar" />
				</SelectTrigger>
				<SelectContent>
					{query.data.accounts.map(account => (
						<SelectGroup key={account.id}>
							<SelectLabel className="py-1.5 text-xs">{account.name}</SelectLabel>
							{account.calendars.map(calendar => (
								<SelectItem
									className="py-1.5 text-sm"
									disabled={calendar.readOnly}
									key={`${account.id}-${calendar.id}`}
									value={calendar.id}
								>
									<div className="flex items-center gap-2">
										<div
											className="h-2.5 w-2.5 rounded-[4px] bg-(--calendar-color)"
											style={
												{
													'--calendar-color': calendar.color ?? '#3B82F6',
												} as React.CSSProperties
											}
										/>
										{calendar.name}
										{calendar.readOnly ? (
											<span className="text-muted-foreground text-xs">(read-only)</span>
										) : null}
									</div>
								</SelectItem>
							))}
						</SelectGroup>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

function AccountsList() {
	const trpc = useTRPC()
	const query = useQuery(trpc.accounts.list.queryOptions())

	if (query.isPending) {
		return <AccountsListSkeleton />
	}

	if (query.isError) {
		return (
			<div className="py-8 text-center text-muted-foreground">
				<p>Error loading accounts.</p>
			</div>
		)
	}

	if (query.data.accounts.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground">
				<p>No accounts connected yet.</p>
				<p className="mt-1 text-sm">Add an account to get started.</p>
			</div>
		)
	}

	return (
		<ul className="flex flex-col gap-y-2">
			{query.data.accounts.map((account: Account) => (
				<React.Fragment key={account.id}>
					<AccountListItem account={account} />
					<Separator className="last:hidden" />
				</React.Fragment>
			))}
		</ul>
	)
}

function ConnectedAccountsSection() {
	return (
		<SettingsSection>
			<div className="flex items-center justify-between">
				<SettingsSectionHeader>
					<SettingsSectionTitle>Connected Accounts</SettingsSectionTitle>
					<SettingsSectionDescription>
						Accounts that Analog can read and write to
					</SettingsSectionDescription>
				</SettingsSectionHeader>
				<AddAccountButton />
			</div>

			<AccountsList />
		</SettingsSection>
	)
}

function AccountIcon({ provider }: { provider: 'google' | 'microsoft' | 'zoom' }) {
	switch (provider) {
		case 'google':
			return <Google className="size-4" />
		case 'microsoft':
			return <Microsoft className="size-4" />
		default:
			return null
	}
}

type Account = RouterOutputs['accounts']['list']['accounts'][number]

interface AccountListItemProps {
	account: Account
}

function AccountListItem({ account }: AccountListItemProps) {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const mutation = useMutation(
		trpc.accounts.unlink.mutationOptions({
			onSuccess: () => {
				// toast.success("Account disconnected");
				queryClient.invalidateQueries({ queryKey: trpc.accounts.pathKey() })
				queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() })
			},
			onError: error => {
				toast.error(`Failed to disconnect account: ${error.message}`)
			},
		}),
	)

	const handleDisconnect = () => {
		mutation.mutate({ id: account.accountId, providerId: account.providerId })
	}

	return (
		<li className="group flex items-center gap-3">
			<AccountIcon provider={account.providerId} />

			<p className="pointer-events-none flex-1 font-medium text-sm">{account.email}</p>

			{mutation.isPending ? (
				<LoaderCircle className="size-4 animate-spin text-muted-foreground" />
			) : (
				<Button
					className="text-destructive hover:bg-destructive/10 hover:text-destructive"
					onClick={handleDisconnect}
					variant="ghost"
				>
					Disconnect
				</Button>
			)}
		</li>
	)
}

function AddAccountButton() {
	return (
		<AddAccountDialog>
			<Button variant="outline">Add Account</Button>
		</AddAccountDialog>
	)
}

function AccountsListSkeleton() {
	return (
		<div className="space-y-3">
			<AccountListItemSkeleton />
		</div>
	)
}

function AccountListItemSkeleton() {
	return (
		<div className="flex items-center gap-3 rounded-xl">
			{/* Provider icon skeleton */}
			<Skeleton className="size-4" />

			{/* Email skeleton */}
			<Skeleton className="h-4 flex-1" />

			{/* Action button skeleton */}
			<Skeleton className="h-8 w-20" />
		</div>
	)
}

function DefaultCalendarPickerSkeleton() {
	return (
		<div className="w-fit">
			<Skeleton className="h-10 w-64" />
		</div>
	)
}
