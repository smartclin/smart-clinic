'use client'

import type { AppointmentStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { trpc } from '@/trpc/react' // Assuming this is your tRPC client setup

import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface ActionProps {
	id: number // Assuming 'id' is a string (UUID) for Prisma. Adjust if it's a number.
	status: AppointmentStatus // Type as AppointmentStatus directly
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
	// `localLoading` is for any internal component loading states not directly tied to the mutation.
	// `isMutating` will come directly from the tRPC hook.
	const [localLoading, setLocalLoading] = useState(false)
	const [selected, setSelected] = useState<AppointmentStatus | ''>('') // 'selected' will hold the new status
	const [reason, setReason] = useState('')
	const router = useRouter()

	// Initialize the tRPC mutation hook
	// `mutate` is the function to call to trigger the mutation
	// `isLoading` (aliased to `isMutating`) from the hook tracks the mutation's pending state.
	// This is the correct way to destructure the loading state.
	const { mutate, isPending: isMutating } = trpc.appointment.updateAppointmentStatus.useMutation({
		onSuccess: data => {
			if (data.success) {
				toast.success(data.success || 'Appointment status updated successfully!')
				router.refresh() // Refresh the page to show updated status
				setSelected('') // Reset selected action
				setReason('') // Reset reason
			} else {
				toast.error(data.error || 'Failed to update appointment status.')
			}
		},
		onError: error => {
			console.error('TRPC Error updating appointment status:', error)
			toast.error(error.message || 'Something went wrong. Please try again.')
		},
		// `onSettled` is good for common cleanup, regardless of success or error.
		// We'll use this to manage our `localLoading` state.
		onSettled: () => {
			setLocalLoading(false) // End local loading
		},
	})

	const handleAction = async () => {
		// Prevent multiple clicks while an action is in progress
		if (isMutating || localLoading || !selected) return

		setLocalLoading(true) // Start local loading state for UI feedback

		const newReason =
			reason ||
			`Appointment has been ${selected.toLowerCase()} on ${new Date().toLocaleDateString()}`

		// FIX: Pass the object with property names that match your tRPC procedure's input.
		// Assuming your server-side tRPC input is defined like:
		// z.object({ id: z.string(), status: z.nativeEnum(AppointmentStatus), reason: z.string().optional() })
		mutate({
			id: id, // Changed from appointmentId to id
			status: selected, // Changed from newStatus to status
			reason: newReason,
		})
	}

	// Determine if a status button should be disabled
	const isDisabled = (buttonStatus: AppointmentStatus) => {
		// Combine local loading and tRPC mutation loading
		const anyLoading = localLoading || isMutating
		return (
			anyLoading ||
			status === 'COMPLETED' || // If current status is COMPLETED, disable all other actions.
			status === buttonStatus // Disable button if its status already matches current appointment status
		)
	}

	return (
		<div>
			<div className="flex items-center space-x-3">
				<Button
					className="bg-yellow-200 text-black"
					disabled={isDisabled('PENDING')}
					onClick={() => setSelected('PENDING')}
					variant="outline"
				>
					Pending
				</Button>
				<Button
					className="bg-blue-200 text-black"
					disabled={isDisabled('SCHEDULED')}
					onClick={() => setSelected('SCHEDULED')}
					variant="outline"
				>
					Approve
				</Button>
				<Button
					className="bg-emerald-200 text-black"
					disabled={isDisabled('COMPLETED')}
					onClick={() => setSelected('COMPLETED')}
					variant="outline"
				>
					Completed
				</Button>
				<Button
					className="bg-red-200 text-black"
					disabled={isDisabled('CANCELLED')}
					onClick={() => setSelected('CANCELLED')}
					variant="outline"
				>
					Cancel
				</Button>
			</div>
			{/* Show reason textarea only if 'CANCELLED' is selected */}
			{selected === 'CANCELLED' && (
				<Textarea
					className="mt-4"
					disabled={localLoading || isMutating}
					onChange={e => setReason(e.target.value)}
					placeholder="Enter reason..."
					value={reason} // Controlled component
				/>
			)}

			{/* Show confirmation only if an action is selected */}
			{selected && (
				<div className="mt-6 flex items-center justify-between rounded bg-red-100 p-4">
					<p className="">Are you sure you want to perform this action?</p>
					<Button
						disabled={localLoading || isMutating}
						onClick={handleAction}
						type="button"
					>
						Yes
					</Button>
				</div>
			)}
		</div>
	)
}
