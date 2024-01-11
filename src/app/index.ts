import * as Rx from 'rxjs'

import {
	Controller,
	fromViewModel,
} from '@/core/controller'

import { AddFailure } from './commands/add-failure'
import { DeleteFoodsByIds } from './commands/delete-foods-by-ids'
import { EnqueueProcess } from './commands/enqueue-process'
import { Log } from './commands/log'
import { RemoveProcess } from './commands/remove-process'
import { GenerateUUID } from './queries/generate-uuid'
import { GetProcesses } from './queries/get-processes'
import { GetTimestamp } from './queries/get-timestamp'
import { scheduler } from './schedulers/process'
import { OnChangeProcesses } from './streams/on-change-processes'
import { OnFoods } from './streams/on-foods'
import * as Overview from './view-models/overview'

export type AppUseCases = Readonly<{
	deleteFoodsByIds: DeleteFoodsByIds
	enqueueProcess: EnqueueProcess
	getProcesses: GetProcesses
	processes$: OnChangeProcesses
	addFailure: AddFailure
	removeProcess: RemoveProcess
	foods$: OnFoods
	uiLog: Log
	appLog: Log
	generateUUID: GenerateUUID
	getTimestamp: GetTimestamp
}>

export class App {
	constructor(useCases: AppUseCases) {
		this.overview = fromViewModel(
			Overview.viewModel,
		)({
			...useCases,
			log: useCases.appLog,
		})

		this.log = useCases.uiLog

		this.scheduler = scheduler({
			interval: 5000,
			...useCases,
		})
	}

	init(): void {
		if (this.isRunning) {
			return
		}

		this.isRunning = true

		this.scheduler.subscribe()
	}

	readonly overview: Controller<
		Overview.Command,
		Overview.Model
	>

	readonly log: Log

	private isRunning = false

	private readonly scheduler: Rx.Observable<unknown>
}
