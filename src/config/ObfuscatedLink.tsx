// src/config/obfuscatedLink.tsx (assuming you moved it from src/components/links/ObfuscatedLink.tsx to src/config)

'use client'

import type { KeyboardEvent, MouseEvent } from 'react' // Correctly import generic MouseEvent and KeyboardEvent
import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { useRouter } from '@/i18n/navigation' // Assuming this is your next-intl router

type AppRouter = ReturnType<typeof useRouter>

// Step 2: Extract the type of the 'push' method
type RouterPush = AppRouter['push']

// Step 3: Extract the type of the first parameter of the 'push' method (which is the href type)
type HrefType = Parameters<RouterPush>[0]

// Define the props for the ObfuscatedLink component.
// It now extends ButtonHTMLAttributes as the root element is a <button>
interface ObfuscatedLinkProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onKeyDown'> {
	href: HrefType // Use the extracted HrefType here
	children: React.ReactNode
	className?: string
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void // Redefine onClick for button
	onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void // Redefine onKeyDown for button
}

export const ObfuscatedLink = forwardRef<HTMLButtonElement, ObfuscatedLinkProps>(
	({ href, children, onClick, className, onKeyDown, ...rest }, ref) => {
		const router = useRouter()

		// This function will perform the navigation. It doesn't need to receive the event directly.
		const navigate = () => {
			router.push(href)
		}

		const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
			e.preventDefault() // Prevent default button submission if it's inside a form
			navigate()
			onClick?.(e) // Call original onClick if provided
		}

		const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault() // Prevent default space/enter key behavior (e.g., scrolling)
				navigate()
			}
			onKeyDown?.(e) // Call original onKeyDown if provided
		}

		return (
			<button
				aria-label={typeof children === 'string' ? children : undefined}
				className={`cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
				onClick={handleButtonClick}
				onKeyDown={handleButtonKeyDown}
				ref={ref}
				title={typeof children === 'string' ? children : undefined}
				type="button" // Explicitly set type to "button" to prevent form submission behavior
				{...rest}
			>
				{children}
			</button>
		)
	},
)

ObfuscatedLink.displayName = 'ObfuscatedLink'
