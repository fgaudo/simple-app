import '@fontsource-variable/comfortaa/index.css'
import '@fontsource-variable/material-symbols-rounded/full.css'
import '@fontsource-variable/roboto-flex/full.css'
import {
	Hct,
	SchemeTonalSpot,
	argbFromHex,
} from '@material/material-color-utilities'
import { Route, Router } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { render as solidRender } from 'solid-js/web'

import type { App } from '@/app'

import {
	AppContext,
	type FridgyContext,
} from '@/ui/context'
import '@/ui/index.css'
import { applyTheme } from '@/ui/material-web'
import AddProduct from '@/ui/pages/AddProduct'
import Home from '@/ui/pages/Home'

const MAIN_COLOR = '#DD7230'

export function render(
	app: App,
	root: HTMLElement,
): void {
	const scheme = new SchemeTonalSpot(
		Hct.fromInt(argbFromHex(MAIN_COLOR)),
		false,
		0.1,
	)

	applyTheme(document.body, scheme)

	solidRender(
		() => {
			const [isLoading, setLoading] =
				createSignal(false)

			const context: FridgyContext = {
				app,
				showLoading: setLoading,
			}

			return (
				<>
					<div
						class="fixed bottom-0 left-0 right-0 top-0 z-[99] bg-[#00000023]"
						classList={{
							hidden: !isLoading(),
						}}>
						<md-circular-progress
							class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
							prop:indeterminate={true}
						/>
					</div>
					<AppContext.Provider value={context}>
						<Router>
							<Route
								path="/"
								component={Home}
							/>
							<Route
								path="/add-product"
								component={AddProduct}
							/>
						</Router>
					</AppContext.Provider>
				</>
			)
		},

		root,
	)
}
