import { AppointmentDetails } from '@/components/appointment/appointment-details'
import AppointmentQuickLinks from '@/components/appointment/appointment-quick-links'
import { BillsContainer } from '@/components/appointment/bills-container'
import ChartContainer from '@/components/appointment/chart-container'
import { DiagnosisContainer } from '@/components/appointment/diagnosis-container'
import { PatientDetailsCard } from '@/components/appointment/patient-details-card'
import { PaymentsContainer } from '@/components/appointment/payment-container'
import { VitalSigns } from '@/components/appointment/vital-signs'
import { MedicalHistoryContainer } from '@/components/medical-history-container'
import { api } from '@/trpc/server'

const AppointmentDetailsPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
	const { id } = await params
	const search = await searchParams
	const cat = (search?.cat as string) || 'charts'

	// const { data } = await getAppointmentWithMedicalRecordsById(Number(id))
const { data }= await api.appointment.getAppointmentWithMedicalRecordsById(Number(id))
	return (
		<div className="flex min-h-screen w-full flex-col-reverse gap-10 p-6 lg:flex-row">
			{/* LEFT */}
			<div className="flex w-full flex-col gap-6 lg:w-[65%]">
				{cat === 'charts' && <ChartContainer id={data?.patientId as string} />}
				{cat === 'appointments' && (
					<>
						<AppointmentDetails
							appointmentDate={data?.appointmentDate ?? new Date()}
							id={data?.id as number}
							notes={data?.note ?? 'N/A'}
							patientId={data?.patientId as string}
							time={data?.time ?? '10:00'}
						/>

						<VitalSigns
							doctorId={data?.doctorId as string}
							id={id}
							patientId={data?.patientId as string}
						/>
					</>
				)}
				{cat === 'diagnosis' && (
					<DiagnosisContainer
						doctorId={data?.doctorId as string}
						id={id}
						patientId={data?.patientId as string}
					/>
				)}
				{cat === 'medical-history' && (
					<MedicalHistoryContainer
						id={id as string}
						patientId={data?.patientId as string}
					/>
				)}
				{cat === 'billing' && <BillsContainer id={id} />}
				{cat === 'payments' && <PaymentsContainer patientId={data?.patientId as string} />}
			</div>
			{/* RIGHT */}
			<div className="flex-1 space-y-6">
				<AppointmentQuickLinks staffId={data?.doctorId as string} />
				{data?.patient && <PatientDetailsCard data={data.patient} />}
			</div>
		</div>
	)
}

export default AppointmentDetailsPage
