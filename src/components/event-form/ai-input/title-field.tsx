import { type Measures, useUpdateEffect } from '@react-hookz/web'
import { SparklesIcon } from 'lucide-react'
import { type MotionProps, motion } from 'motion/react'

import { useExpandingInput } from '@/components/event-form/ai-input/hooks/use-expanding-input'
import { useFieldContext } from '@/components/event-form/form'
import { BorderTrail } from '@/components/ui/border-trail'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const TitleField = ({
	cardSize,
	isLoading = false,
	aiEnabled = false,
}: {
	cardSize?: Measures
	isLoading?: boolean
	aiEnabled?: boolean
}) => {
	const field = useFieldContext<string>()
	const { expanded, setFocused, refs } = useExpandingInput(field.state.value)

	const isFormValid = field.form.state.isFormValid
	const isFieldValid = field.state.meta.isValid

	const overlayEnabled = expanded || isLoading
	const expandedTrailEnabled = expanded && isLoading
	const showAiInputHint = aiEnabled && ((isFormValid && !field.state.value) || expanded)

	useUpdateEffect(() => {
		if (!isLoading) {
			setFocused(false)
		}
	}, [isLoading])

	return (
		<div className="relative mb-2 h-9 w-full">
			<Label
				className="sr-only"
				htmlFor={field.name}
			>
				Event name
			</Label>
			<motion.div
				className={cn(
					'-left-[2px] absolute z-30 w-[calc(100%+4px)] rounded-2xl bg-muted/0 transition-colors duration-300',
					expanded && 'z-[100] bg-analog-neutral/90 dark:bg-muted/95',
				)}
				custom={{ expanded, aiEnabled }}
				{...fieldMotionConfig}
			>
				<AiInputHint
					className="absolute right-2"
					{...hintMotionConfig}
					custom={{
						enabled: showAiInputHint,
						expanded,
					}}
				/>
				{expandedTrailEnabled && (
					<BorderTrail
						className="bg-radial bg-transparent from-blue-600/80 to-70% to-blue-600/0 dark:from-blue-400/70 dark:to-blue-400/0"
						size={250}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
							duration: 2,
						}}
					/>
				)}
				{expanded ? (
					<Textarea
						className="scrollbar-hidden field-sizing-content relative h-full max-h-40 min-h-0 resize-none rounded-none border-none bg-transparent pt-0.5 pr-4 pl-0 text-lg leading-tight shadow-none focus:outline-hidden focus-visible:ring-0"
						disabled={isLoading}
						id={field.name}
						onBlur={() => !isLoading && setFocused(false)}
						onChange={e => field.handleChange(e.target.value)}
						placeholder={aiEnabled ? 'Event name or prompt...' : 'New event name...'}
						ref={refs.textarea}
						value={field.state.value}
					/>
				) : (
					<Input
						aria-invalid={!isFieldValid}
						className={cn(
							'h-auto w-full rounded-none border-none bg-transparent py-0 pr-10 pl-0 text-lg leading-tight shadow-none focus:outline-hidden focus-visible:ring-0 aria-invalid:text-destructive aria-invalid:placeholder:text-destructive/50',
							isFormValid && 'pr-1.5',
						)}
						disabled={isLoading}
						id={field.name}
						onChange={e => field.handleChange(e.target.value)}
						onFocus={() => setFocused(true)}
						placeholder={aiEnabled ? 'Event name or prompt...' : 'New event name...'}
						ref={refs.input}
						type="text"
						value={field.state.value}
					/>
				)}
			</motion.div>
			<motion.div
				animate={{
					backdropFilter: overlayEnabled ? 'blur(2px)' : 'blur(0px)',
				}}
				className={cn(
					'pointer-events-none absolute inset-0 z-20 translate-y-11 rounded-lg bg-transparent transition-colors duration-300',
					overlayEnabled && 'pointer-events-auto bg-background/10',
				)}
				style={{
					width: (cardSize?.width || 320) + 2,
					height: (cardSize?.height || 420) + 2,
				}}
				transition={{
					ease: 'easeInOut',
					duration: 0.3,
				}}
			>
				{!expanded && isLoading && (
					<BorderTrail
						className="bg-radial bg-transparent from-blue-600/80 to-70% to-blue-600/0 dark:from-blue-500/70 dark:to-blue-500/0"
						size={300}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
							duration: 3,
						}}
					/>
				)}
			</motion.div>
		</div>
	)
}

function AiInputHint({
	className,
	...props
}: { className?: string } & React.ComponentProps<typeof motion.div>) {
	return (
		<motion.div
			className={cn('flex select-none items-center gap-2 pt-[0.1rem]', className)}
			{...props}
		>
			<kbd className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded-md border border-ring/30 bg-transparent px-1.5 font-[inherit] font-medium text-[0.8rem] text-muted-foreground/70 dark:border-border">
				⌘↵
			</kbd>
			<SparklesIcon className="size-3.5 text-muted-foreground/70" />
		</motion.div>
	)
}

const fieldMotionConfig: MotionProps = {
	variants: {
		base: {
			y: 0,
			scale: 1,
			height: '100%',
			paddingTop: '0.4rem',
			paddingBottom: '0.5rem',
			paddingLeft: '0.375rem',
		},
		main: ({ expanded, aiEnabled }) => ({
			y: expanded ? '0.1rem' : 0,
			scaleY: expanded ? 1.05 : 1,
			height: expanded ? '400%' : '100%',
			paddingTop: expanded ? '1rem' : '0.4rem',
			paddingBottom: expanded && aiEnabled ? '2rem' : '0.5rem',
			paddingLeft: expanded ? '1rem' : '0.375rem',
		}),
	},
	initial: 'base',
	animate: 'main',
	transition: {
		type: 'spring',
		stiffness: 200,
		damping: 30,
	},
}

const hintMotionConfig: MotionProps = {
	variants: {
		base: {
			opacity: 0,
			top: '50%',
			y: '-50%',
			visibility: 'hidden',
		},
		main: ({ enabled, expanded }) => ({
			opacity: enabled ? 1 : 0,
			visibility: enabled ? 'visible' : 'hidden',
			top: expanded ? '100%' : '50%',
			y: expanded ? '-140%' : '-50%',
		}),
	},
	initial: 'base',
	animate: 'main',
	transition: {
		ease: 'easeInOut',
		duration: 0.2,
	},
}

export default TitleField
