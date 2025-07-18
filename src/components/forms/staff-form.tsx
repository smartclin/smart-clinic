'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { TRPCClientErrorLike } from '@trpc/client'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { type CreateStaffOutputSchema, StaffSchema } from '@/lib/schema'
import type { AppRouter } from '@/server/api/root'
import { trpc } from '@/trpc/react'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const TYPES = [{ label: 'Nurse', value: 'NURSE' }]

export const StaffForm = () => {
	const router = useRouter()


	// Infer the types for the mutation's success and error callbacks
	type CreateNewStaffOutput = z.infer<typeof CreateStaffOutputSchema>

	type CreateNewStaffError = TRPCClientErrorLike<AppRouter>

	const { mutateAsync: createStaffMutation, isPending: isSubmitting } =
		trpc.admin.createNewStaff.useMutation({
			// <-- Revert to createNewStaff as per your router
			onSuccess: (res: CreateNewStaffOutput) => {
				// Now 'res' will have the correct type, and type guards can be used
				// You might need to refine these checks based on the exact final shape
				// from the server, especially if 'success' can be a generic boolean from other parts.
				if (res.success) {
					// This check should now be type-safe
					toast.success(res.msg || res.message || 'Staff added successfully!')
					form.reset()
					router.refresh()
				} else {
					toast.error(res.message || res.msg || 'Failed to add staff.')
				}
			},
			onError: (error: CreateNewStaffError) => {
				console.error('Error adding staff:', error)
				toast.error(error.message || 'Something went wrong. Try again later.')
			},
		})

	const handleSubmit = async (values: z.infer<typeof StaffSchema>) => {
		try {
			await createStaffMutation(values)
		} catch (error) {
			console.error('Unexpected error during staff submission:', error)
			toast.error('An unexpected error occurred during submission. Please try again.')
		}
	}

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<Plus size={20} />
					New Staff
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full overflow-y-scroll rounded-xl rounded-r-xl md:top-[5%] md:right-[1%] md:h-[90%]">
				<SheetHeader>
					<SheetTitle>Add New Staff</SheetTitle>
				</SheetHeader>

				<div>
					<Form {...form}>
						<form
							className="mt-5 space-y-8 2xl:mt-10"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<CustomInput
								control={form.control}
								label="Type"
								name="role"
								placeholder=""
								selectList={TYPES}
								type="radio"
							/>

							<CustomInput
								control={form.control}
								label="Full Name"
								name="name"
								placeholder="Staff name"
								type="input"
							/>

							<div className="flex items-center gap-2">
								<CustomInput
									control={form.control}
									label="Email Address"
									name="email"
									placeholder="john@example.com"
									type="input"
								/>

								<CustomInput
									control={form.control}
									label="Contact Number"
									name="phone"
									placeholder="9225600735"
									type="input"
								/>
							</div>

							<CustomInput
								control={form.control}
								label="License Number"
								name="licenseNumber"
								placeholder="License Number"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Department"
								name="department"
								placeholder="Children's ward"
								type="input"
							/>

							<CustomInput
								control={form.control}
								label="Address"
								name="address"
								placeholder="1479 Street, Apt 1839-G, NY"
								type="input"
							/>

							<CustomInput
								control={form.control}
								inputType="password"
								label="Password"
								name="password"
								placeholder=""
								type="input"
							/>

							<Button
								className="w-full"
								disabled={isSubmitting}
								type="submit"
							>
								{isSubmitting ? 'Submitting...' : 'Submit'}
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}
