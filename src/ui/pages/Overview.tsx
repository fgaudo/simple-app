import { useNavigate } from '@solidjs/router'
import { fromIO } from 'fp-ts/lib/Task'
import { flow, pipe } from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import {
	For,
	Match,
	Show,
	Switch,
	createRenderEffect,
	createSignal,
	from,
	useContext,
} from 'solid-js'

import { AppContext } from '@/ui/context'
import { useWindowScroll } from '@/ui/core/helpers'
import { useDispatcher } from '@/ui/core/solid-js'
import { joinClasses } from '@/ui/core/utils'
import { Title } from '@/ui/widgets/Title'
import { TopAppBar } from '@/ui/widgets/TopAppBar'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Command = { type: 'openAddProduct' }

function Overview() {
	const app = useContext(AppContext)!
	const model = from(app.overview.stream)
	const scroll = useWindowScroll()
	const navigate = useNavigate()

	const [
		isOpeningAddProduct,
		setOpeningAddProduct,
	] = createSignal(false)

	const dispatch = useDispatcher<Command>(
		flow(
			Rx.tap(
				cmd => `Dispatched '${cmd.type}' command`,
			),
			Rx.exhaustMap(() =>
				pipe(
					fromIO(() => {
						setOpeningAddProduct(true)
					}),
					Rx.defer,
					Rx.delay(250),
					Rx.tap(() => {
						navigate('/add-product')
					}),
				),
			),
			Rx.ignoreElements(),
		),
	)

	const ready = () => {
		const val = model()

		if (val?.type === 'ready') {
			return val
		}
	}
	createRenderEffect(() => {
		if (!model())
			app.log('debug', 'Rendering loading screen')
	})

	return (
		<div class="pb-[128px] pt-[56px]">
			<TopAppBar>
				<div class="ml-[16px]">
					<Title>Overview</Title>
				</div>
				<md-icon-button class="ml-auto mr-[8px]">
					<md-icon>more_vert</md-icon>
				</md-icon-button>
			</TopAppBar>
			<Switch
				fallback={
					<md-circular-progress
						prop:indeterminate={true}
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
					/>
				}>
				<Match when={ready()}>
					{onReady => (
						<md-list>
							<For each={onReady().products}>
								{(productModel, i) => {
									createRenderEffect(() => {
										app.log(
											'debug',
											`Received change for element ${i()} \n${JSON.stringify(productModel, null, 2)}`,
										)
									})
									return (
										<>
											<Show when={i() !== 0}>
												<md-divider />
											</Show>
											<md-list-item prop:type="button">
												<md-icon slot="start">
													ac_unit
												</md-icon>

												<div slot="headline">
													{productModel.name}
												</div>
											</md-list-item>
										</>
									)
								}}
							</For>
						</md-list>
					)}
				</Match>
			</Switch>

			<div
				class="fixed transition-all duration-[0.25s]"
				classList={{
					[joinClasses([
						'bg-transparent',
						'bottom-[16px]',
						'right-[16px]',
						'h-[96px]',
						'w-[96px]',
					])]: !isOpeningAddProduct(),
					'opacity-50': scroll().isScrolling,
					'opacity-100': !scroll().isScrolling,
					[joinClasses([
						'bg-[var(--md-sys-color-surface)]',
						'h-screen',
						'w-screen',
						'right-0',
						'bottom-0',
					])]: isOpeningAddProduct(),
				}}>
				<md-fab
					classList={{
						'opacity-0': isOpeningAddProduct(),
					}}
					onClick={() => {
						dispatch({
							type: 'openAddProduct',
						})
					}}
					prop:variant="primary"
					prop:size="large">
					<md-icon slot="icon">add</md-icon>
				</md-fab>
			</div>
		</div>
	)
}

export default Overview
