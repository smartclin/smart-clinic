import { useKeyboardEvent, useToggle } from '@react-hookz/web'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { apiKeysAtom } from '@/atoms/api-keys'
import {
	aiInputPredicate,
	generateEventFormData,
} from '@/components/event-form/ai-input/support/ai-input'
import type { AiOutputData } from '@/lib/schemas/event-form'

export const useAiInput = (getPrompt: () => string) => {
	const [isLoading, toggleLoading] = useToggle(false)
	const [data, setData] = useState<AiOutputData | null>(null)
	const apiKeys = useAtomValue(apiKeysAtom)

	const aiKey = useMemo(() => apiKeys.openai || null, [apiKeys])

	const enabled = aiKey !== null

	const generateInput = useCallback(
		async (userInput: string) => {
			if (!aiKey) return
			toggleLoading()
			try {
				const generatedInput = await generateEventFormData(userInput, aiKey)
				setData(generatedInput)
			} catch {
				toast.error('Failed to get AI input')
			} finally {
				toggleLoading()
			}
		},
		[toggleLoading, aiKey],
	)

	useKeyboardEvent(
		aiInputPredicate,
		() => enabled && generateInput(getPrompt()),
		[getPrompt, generateInput, enabled],
		{ eventOptions: { passive: true } },
	)

	return { isLoading, generateInput, data, enabled }
}
