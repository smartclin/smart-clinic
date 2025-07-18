import { SlidersVertical, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Accounts } from './tabs/accounts'
import { General } from './tabs/general'

interface SettingsDialogProps {
	children?: React.ReactNode
}

export function SettingsDialog({ children }: SettingsDialogProps) {
	const [open, setOpen] = useState(false)

	return (
		<Dialog
			onOpenChange={setOpen}
			open={open}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="h-144 max-h-screen w-full rounded-2xl bg-background p-3 sm:max-w-4xl">
				<DialogTitle className="sr-only">Settings</DialogTitle>
				<div className="relative flex gap-3">
					<Tabs
						className="flex h-full w-full flex-row gap-3"
						defaultValue="accounts"
						orientation="vertical"
					>
						<TabsList className="h-fit w-56 shrink-0 flex-col gap-1 bg-transparent p-0">
							<TabsTrigger
								className="w-full justify-start gap-3 border-none data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="general"
							>
								<SlidersVertical className="size-4" /> General
							</TabsTrigger>
							<TabsTrigger
								className="w-full justify-start gap-3 border-none data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="accounts"
							>
								<UsersRound className="size-4" /> Accounts
							</TabsTrigger>
						</TabsList>
						<Separator
							className="bg-[linear-gradient(to_bottom_in_oklab,transparent_0%,var(--border)_15%,var(--border)_85%,transparent_100%)] bg-transparent"
							orientation="vertical"
						/>
						<div className="flex-1 px-3 text-start">
							<div className="h-full w-full overflow-auto">
								<TabsContent
									className="mt-0 h-full"
									value="accounts"
								>
									<Accounts />
								</TabsContent>
								<TabsContent
									className="mt-0 h-full"
									value="general"
								>
									<General />
								</TabsContent>
							</div>
						</div>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	)
}
