'use client'

import { authClient } from '@repo/auth/client'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

import { SettingsDialog } from '@/components/settings-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/accounts'

export function NavUser() {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data: user, isLoading } = useCurrentUser()
	const { theme, setTheme } = useTheme()

	if (isLoading) {
		return <NavUserSkeleton />
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							size="lg"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									alt={user?.name}
									src={user?.image ?? undefined}
								/>
								<AvatarFallback className="rounded-lg bg-accent-foreground text-background">
									{user?.name
										?.split(' ')
										.map(name => name.charAt(0))
										.join('')}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user?.name}</span>
								<span className="truncate text-muted-foreground text-xs">{user?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side="top"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										alt={user?.name}
										src={user?.image ?? undefined}
									/>
									<AvatarFallback className="rounded-lg" />
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user?.name}</span>
									<span className="truncate text-muted-foreground text-xs">{user?.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<SettingsDialog>
								<DropdownMenuItem onSelect={e => e.preventDefault()}>
									<Settings />
									Settings
								</DropdownMenuItem>
							</SettingsDialog>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="ps-8">Theme</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent className="min-w-64">
									<DropdownMenuRadioGroup
										onValueChange={setTheme}
										value={theme}
									>
										<DropdownMenuRadioItem value="system">Automatic (system)</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={async () =>
								await authClient.signOut({
									fetchOptions: {
										onSuccess: () => {
											queryClient.removeQueries()
											router.push('/login')
										},
									},
								})
							}
						>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}

export function NavUserSkeleton() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div className="flex items-center gap-2">
					<Skeleton className="size-8 animate-shimmer rounded-lg bg-neutral-500/20" />
					<div className="flex-1 space-y-1">
						<Skeleton className="rounded- h-4 w-full animate-shimmer bg-neutral-500/20" />
						<Skeleton className="rounded- h-2 w-full animate-shimmer bg-neutral-500/20" />
					</div>
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
