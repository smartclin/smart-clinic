import { GalleryVerticalEndIcon } from 'lucide-react'
import type { Metadata } from 'next'

import SignupForm from '@/app/(auth)/signup/signup-form'

export const metadata: Metadata = {
	title: 'Signup | Axiom PM',
}

export default function SignupPage() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex flex-col items-center gap-2">
					<a
						className="flex flex-col items-center gap-2 font-medium"
						href="#"
					>
						<div className="flex size-8 items-center justify-center rounded-md">
							<GalleryVerticalEndIcon className="size-6" />
						</div>
						<span className="sr-only">Acme Inc.</span>
					</a>
					<h1 className="font-bold text-xl">Welcome to Acme Inc.</h1>
					<div className="text-center text-sm">
						already have an account?{' '}
						<a
							className="underline underline-offset-4"
							href="/signin"
						>
							Sign in
						</a>
					</div>
				</div>
				<SignupForm />
				<div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
					By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
					<a href="#">Privacy Policy</a>.
				</div>
			</div>
		</main>
	)
}
