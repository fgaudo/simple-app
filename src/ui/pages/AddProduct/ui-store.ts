import { createEffect } from 'solid-js'
import * as SS from 'solid-js/store'

import { useFridgyNavigate } from '@/ui/router.tsx'

export interface UiState {
	isOpeningHome: boolean
}

export type UiStore = [
	SS.Store<UiState>,
	SS.SetStoreFunction<UiState>,
]

export const createStore: () => UiStore = () => {
	const [uiState, setUiState] =
		SS.createStore<UiState>({
			isOpeningHome: false,
		})
	const navigate = useFridgyNavigate()

	createEffect(() => {
		if (uiState.isOpeningHome) {
			navigate('home')
		}
	})

	return [uiState, setUiState]
}
