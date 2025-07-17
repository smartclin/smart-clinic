'use client'

import { Plus } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { authClient } from '@/lib/auth/auth-client'
import { providers } from '@/lib/constants'

interface AddAccountDialogProps {
	children: React.ReactNode
}

export function AddAccountDialog({ children }: AddAccountDialogProps) {
	const [open, setOpen] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState<string | null>(null)

	const handleLinkAccount = async (provider: string) => {
		try {
			setIsLoading(provider)
			await authClient.linkSocial({
				provider: provider as 'google' | 'microsoft',
				callbackURL: '/calendar',
			})
			setOpen(false)
		} catch {
			toast.error('Failed to link account')
		} finally {
			setIsLoading(null)
		}
	}

	return (
		<Dialog
			onOpenChange={setOpen}
			open={open}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Account</DialogTitle>
					<DialogDescription>
						Link an additional email account to your profile. Choose from the available providers
						below.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					{providers.map(provider => (
						<Button
							className="w-full justify-start"
							disabled={isLoading === provider.providerId}
							key={provider.providerId}
							onClick={() => handleLinkAccount(provider.providerId)}
							variant="outline"
						>
							<Plus className="mr-2 h-4 w-4" />
							{isLoading === provider.providerId ? 'Connecting...' : `Add ${provider.name}`}
						</Button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
