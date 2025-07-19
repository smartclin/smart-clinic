'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { VitalSignsSchema } from '@/lib/schema' // VERIFY THIS IS THE LATEST VERSION
import { trpc } from '@/trpc/react'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog'
import { Form } from '../ui/form'

interface AddVitalSignsProps {
	patientId: string
	doctorId: string
	appointmentId: number
	medicalId?: number
}

export type VitalSignsFormData = z.infer<typeof VitalSignsSchema>

export const AddVitalSigns = ({
	patientId,
	doctorId,
	appointmentId,
	medicalId,
}: AddVitalSignsProps) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const router = useRouter()

	const form = useForm<VitalSignsFormData>({
		resolver: zodResolver(VitalSignsSchema),
		defaultValues: {
			patientId: patientId,
			medicalId: medicalId,
			bodyTemperature: undefined, // These should now align with optional numbers
			heartRate: undefined,
			systolic: undefined,
			diastolic: undefined,
			respiratoryRate: undefined,
			oxygenSaturation: undefined,
			weight: undefined,
			height: undefined,
		},
	})

	const { mutateAsync: addVitalSignsMutation, isPending: isSubmitting } =
		trpc.appointment.addVitalSigns.useMutation({
			onSuccess: res => {
				if (res.success) {
					toast.success(res.msg || 'Vital signs added successfully!')
					form.reset()
					setIsDialogOpen(false)
					router.refresh()
				} else {
					toast.error(res.msg || 'Failed to add vital signs.')
				}
			},
			onError: error => {
				console.error('Error adding vital signs:', error)
				toast.error(error.message || 'Something went wrong. Please try again.')
			},
		})

	const handleOnSubmit = async (data: VitalSignsFormData) => {
		try {
			if (!patientId || !doctorId || appointmentId === undefined || appointmentId === null) {
				toast.error('Missing required IDs (Patient, Doctor, or Appointment).')
				return
			}

			await addVitalSignsMutation({
				data,
				appointmentId: appointmentId,
				doctorId: doctorId,
			})
		} catch (error) {
			console.error('Unexpected error during vital signs submission:', error)
			toast.error('An unexpected error occurred during submission. Please try again.')
		}
	}

	return (
		<Dialog
			onOpenChange={setIsDialogOpen}
			open={isDialogOpen}
		>
			<DialogTrigger asChild>
				<Button
					className="font-normal text-sm"
					size="sm"
					variant="outline"
				>
					<Plus
						className="text-gray-500"
						size={22}
					/>{' '}
					Add Vital Signs
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Vital Signs</DialogTitle>
					<DialogDescription>Add vital signs for the patient</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						className="space-y-8"
						onSubmit={form.handleSubmit(handleOnSubmit)}
					>
						<div className="flex items-center gap-4">
							<CustomInput
								control={form.control}
								 label="Body Temperature (°C)"
								name="bodyTemperature"
								placeholder="e.g.: 37.5"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Heart Rate (BPM)"
								name="heartRate"
								placeholder="e.g.: 54-123"
								type="input"
							/>
						</div>

						<div className="flex items-center gap-4">
							<CustomInput
								control={form.control}
								
								label="Systolic BP"
								name="systolic"
								placeholder="e.g.: 120"
								type="input"
							/>
							<CustomInput
								control={form.control}
								
								label="Diastolic BP"
								name="diastolic"
								placeholder="e.g.: 80"
								type="input"
							/>
						</div>

						<div className="flex items-center gap-4">
							<CustomInput
								control={form.control}
								
								label="Weight (Kg)"
								name="weight"
								placeholder="e.g.: 80"
								type="input"
							/>
							<CustomInput
								control={form.control}
								
								label="Height (Cm)"
								name="height"
								placeholder="e.g.: 175"
								type="input"
							/>
						</div>

						<div className="flex items-center gap-4">
							<CustomInput
								control={form.control}
								
								label="Respiratory Rate"
								name="respiratoryRate"
								placeholder="Optional"
								type="input"
							/>
							<CustomInput
								control={form.control}
								
								label="Oxygen Saturation"
								name="oxygenSaturation"
								placeholder="Optional"
								type="input"
							/>
						</div>

						<Button
							className="w-full"
							
							type="submit"
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
