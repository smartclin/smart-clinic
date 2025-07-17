import { z } from 'zod'

export const PatientFormSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(2, 'First name must be at least 2 characters')
		.max(30, "First name can't be more than 50 characters"),
	lastName: z
		.string()
		.trim()
		.min(2, 'dLast name must be at least 2 characters')
		.max(30, "First name can't be more than 50 characters"),
	dateOfBirth: z.coerce.date(),
	gender: z.enum(['MALE', 'FEMALE'], { message: 'Gender is required' }),

	phone: z.string().min(10, 'Enter phone number').max(10, 'Enter phone number'),
	email: z.email('Invalid email address.'),
	address: z
		.string()
		.min(5, 'Address must be at least 5 characters')
		.max(500, 'Address must be at most 500 characters'),
	maritalStatus: z.enum(['married', 'single', 'divorced', 'widowed', 'separated'], {
		message: 'Marital status is required.',
	}),
	nutritionalStatus: z.enum(['normal', 'wasted', 'stunted', 'malnourished', 'obese'], {
		message: 'Nutritional status is required.',
	}),
	emergencyContactName: z
		.string()
		.min(2, 'Emergency contact name is required.')
		.max(50, 'Emergency contact must be at most 50 characters'),
	emergencyContactNumber: z.string().min(10, 'Enter phone number').max(10, 'Enter phone number'),
	relation: z.enum(['mother', 'father', 'husband', 'wife', 'other'], {
		message: 'Relations with contact person required',
	}),
	bloodGroup: z.string().optional(),
	allergies: z.string().optional(),
	medicalConditions: z.string().optional(),
	medicalHistory: z.string().optional(),
	insuranceProvider: z.string().optional(),
	insuranceNumber: z.string().optional(),
	privacyConsent: z
		.boolean()
		.default(false)
		.refine(val => val === true, {
			message: 'You must agree to the privacy policy.',
		}),
	serviceConsent: z
		.boolean()
		.default(false)
		.refine(val => val === true, {
			message: 'You must agree to the terms of service.',
		}),
	medicalConsent: z
		.boolean()
		.default(false)
		.refine(val => val === true, {
			message: 'You must agree to the medical treatment terms.',
		}),
	img: z.string().optional(),
})

export const AppointmentSchema = z.object({
	doctorId: z.string().min(1, 'Select physician'),
	patientId: z.string().min(1, 'Select patient'),
	type: z.string().min(1, 'Select type of appointment'),
	appointmentDate: z.string().min(1, 'Select appointment date'),
	time: z.string().min(1, 'Select appointment time'),
	note: z.string().optional(),
})

export const DoctorSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be at most 50 characters'),
	phone: z.string().min(10, 'Enter phone number').max(10, 'Enter phone number'),
	email: z.email('Invalid email address.'),
	address: z
		.string()
		.min(5, 'Address must be at least 5 characters')
		.max(500, 'Address must be at most 500 characters'),
	specialization: z.string().min(2, 'Specialization is required.'),
	licenseNumber: z.string().min(2, 'License number is required'),
	type: z.enum(['FULL', 'PART'], { message: 'Type is required.' }),
	department: z.string().min(2, 'Department is required.'),
	img: z.string().optional(),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long!' })
		.optional()
		.or(z.literal('')),
})

export const workingDaySchema = z.object({
	day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
	startTime: z.string(),
	closeTime: z.string(),
})
export const WorkingDaysSchema = z.array(workingDaySchema).optional()

export const StaffSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be at most 50 characters'),
	role: z.enum(['STAFF'], { message: 'Role is required.' }),
	phone: z.string().min(10, 'Contact must be 10-digits').max(10, 'Contact must be 10-digits'),
	email: z.email('Invalid email address.'),
	address: z
		.string()
		.min(5, 'Address must be at least 5 characters')
		.max(500, 'Address must be at most 500 characters'),
	licenseNumber: z.string().optional(),
	department: z.string().optional(),
	img: z.string().optional(),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long!' })
		.optional()
		.or(z.literal('')),
})
export const StaffAuthSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	phone: z.string().min(1),
	address: z.string().min(1),
	department: z.string().optional().nullable(),
	img: z.string().optional().nullable(),
	licenseNumber: z.string().optional().nullable(),
	colorCode: z.string().optional().nullable(),
	hireDate: z.date().optional(),
	salary: z.number().optional().nullable(),
	role: z.enum(['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']),
	status: z.enum(['ACTIVE', 'INACTIVE', 'DORMANT']).optional(),
	password: z.string().min(6, 'Password should be at least 6 characters long'),
})
export const VitalSignsSchema = z.object({
	patientId: z.string(),
	medicalId: z.number(),
	bodyTemperature: z.coerce.number({
		message: 'Enter recorded body temperature',
	}),
	heartRate: z.string({ message: 'Enter recorded heartbeat rate' }),
	systolic: z.coerce.number({
		message: 'Enter recorded systolic blood pressure',
	}),
	diastolic: z.coerce.number({
		message: 'Enter recorded diastolic blood pressure',
	}),
	respiratoryRate: z.coerce.number().optional(),
	oxygenSaturation: z.coerce.number().optional(),
	weight: z.coerce.number({ message: 'Enter recorded weight (Kg)' }),
	height: z.coerce.number({ message: 'Enter recorded height (Cm)' }),
})

export const DiagnosisSchema = z.object({
	patientId: z.string(),
	medicalId: z.number(),
	doctorId: z.string(),
	symptoms: z.string({ message: 'Symptoms required' }),
	diagnosis: z.string({ message: 'Diagnosis required' }),
	notes: z.string().optional(),
	prescribedMedications: z.string().optional(),
	followUpPlan: z.string().optional(),
})

export const PaymentSchema = z.object({
	id: z.string(),
	// patientId: z.string(),
	// appointmentId: z.string(),
	billDate: z.coerce.date(),
	// paymentDate: z.string(),
	discount: z.string({ message: 'discount' }),
	totalAmount: z.string(),
	// amountPaid: z.string(),
})

export const PatientBillSchema = z.object({
	billId: z.string(),
	serviceId: z.number(),
	serviceDate: z.string(),
	appointmentId: z.number(),
	quantity: z.string({ message: 'Quantity is required' }),
	unitCost: z.string({ message: 'Unit cost is required' }),
	totalCost: z.string({ message: 'Total cost is required' }),
})

export const ServicesSchema = z.object({
	serviceName: z.string({ message: 'Service name is required' }),
	price: z.string({ message: 'Service price is required' }),
	description: z.string({ message: 'Service description is required' }),
})

export const PrescriptionSchema = z.object({
	// id will be auto-generated by Drizzle, so it's not typically part of the input schema for creation
	// For updates, it would be z.number().int().positive()

	appointmentId: z.number().int().positive().optional(), // Nullable in Drizzle, so optional here.
	// Use .nullish() if you expect null explicitly.
	doctorId: z.string().min(1, 'Doctor ID is required'),
	dosage: z.string().min(1, 'Dosage is required'),
	duration: z.string().min(1, 'Duration is required'),
	frequency: z.string().min(1, 'Frequency is required'),
	instructions: z.string().optional().nullable(), // Optional and can be null
	issuedDate: z.coerce.date().default(() => new Date()), // Automatically set to current date if not provided
	medicationName: z.string().min(1, 'Medication name is required'),
	patientId: z.string().min(1, 'Patient ID is required'),
	prescriptionName: z.string().min(1, 'Prescription name is required'),
	status: z.enum(['active', 'inactive', 'archived', 'pending']).default('active'), // Example statuses. Adjust to your actual needs.
	// createdAt and updatedAt are handled by Drizzle timestamps
})

export const VaccinationSchema = z.object({
	// id will be auto-generated by Drizzle
	administeredBy: z.string().min(1, 'Administering staff ID is required').optional().nullable(), // Nullable in Drizzle
	administeredDate: z.coerce.date().refine(date => date <= new Date(), {
		// Administered date cannot be in the future
		message: 'Administered date cannot be in the future',
	}),
	nextDueDate: z.coerce.date().optional().nullable(), // Nullable
	notes: z.string().optional().nullable(), // Nullable
	patientId: z.string().min(1, 'Patient ID is required'),
	vaccineName: z.string().min(1, 'Vaccine name is required'),
	// createdAt and updatedAt are handled by Drizzle timestamps
})

export const WHOGrowthStandardSchema = z.object({
	// id will be auto-generated by Drizzle
	ageDays: z.number().int().min(0, 'Age in days cannot be negative'),
	gender: z.enum(['MALE', 'FEMALE'], { message: "Gender must be 'MALE' or 'FEMALE'" }), // Matches your Gender enum
	lValue: z.number(), // Assuming it can't be zero. Adjust if needed.
	measurementType: z.string().min(1, 'Measurement type is required'),
	mValue: z.number(),
	sValue: z.number(), // Assuming it can't be zero. Adjust if needed.

	// Standard deviation values
	sd0: z.number(),
	sd1neg: z.number(),
	sd1pos: z.number(),
	sd2neg: z.number(),
	sd2pos: z.number(),
	sd3neg: z.number(),
	sd3pos: z.number(),
	sd4neg: z.number().optional().nullable(), // Nullable
	sd4pos: z.number().optional().nullable(), // Nullable
})

export const PatientCreateInputSchema = z.object({
	pid: z.string(), // This 'pid' will be the "new-patient" string or an existing ID
	data: PatientFormSchema, // The actual form data for the patient
})

// Schema for updating an existing patient
export const PatientUpdateInputSchema = z.object({
	pid: z.string(), // The ID of the patient to update (required)
	data: PatientFormSchema.partial(), // The data to update, making fields optional for partial updates
})

export const DoctorAuthSchema = DoctorSchema.extend({
	password: z.string().min(6, 'Password should be at least 6 characters long'),
})

// Define a common success message output schema
export const SuccessOutputSchema = z.object({
	msg: z.string(),
})

export const reviewSchema = z.object({
	patientId: z.string(),
	staffId: z.string(),
	rating: z.number().min(1).max(5),
	comment: z
		.string()
		.min(1, 'Review must be at least 10 characters long')
		.max(500, 'Review must not exceed 500 characters'),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
export type DiagnosisFormData = z.infer<typeof DiagnosisSchema>
export const AddNewBillInputSchema = PatientBillSchema.extend({
	appointmentId: z.number().int().positive().optional(), // Nullable in Drizzle, so optional here.
	billId: z
		.union([z.number(), z.null(), z.undefined()])
		.optional()
		.transform(val => (val === 0 ? undefined : val)),
})
