import {
	Outlet,
	ReactRouter,
	RootRoute,
	Route,
	RouterProvider
} from '@tanstack/react-router'
import { StrictMode, createContext, useContext } from 'react'
import { render } from 'react-dom'

import { UseCases } from '@/application'

import { AddFoodPage } from '@/presentation/react/pages/add-food'
import { FoodsPage } from '@/presentation/react/pages/main'

interface Config {
	readonly useCases: UseCases
	readonly title: string
}

export const GlobalContext = createContext<Config>(null as any)
export const useGlobalContext: () => Config = () => useContext(GlobalContext)

const rootRoute = new RootRoute({
	component: () => <Outlet />
})

const routeTree = rootRoute.addChildren([
	new Route({
		getParentRoute: () => rootRoute,
		path: '/',
		component: FoodsPage
	}),
	new Route({
		getParentRoute: () => rootRoute,
		path: '/about',
		component: AddFoodPage
	})
])

const router = new ReactRouter({ routeTree })

export function renderApp(element: Element, config: Config): void {
	render(
		<StrictMode>
			<GlobalContext.Provider value={config}>
				<RouterProvider router={router} />
			</GlobalContext.Provider>
		</StrictMode>,
		element
	)
}
