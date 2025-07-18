'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

interface DarkModeToggleProps {
	className?: string
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
	const { theme, setTheme } = useTheme()

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	return (
		<Button
			className={className}
			onClick={toggleTheme}
			size="icon"
			variant="ghost"
		>
			<Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">
				{theme === 'light' ? 'Switch to light mode' : 'Switch to dark mode'}
			</span>
		</Button>
	)
}
