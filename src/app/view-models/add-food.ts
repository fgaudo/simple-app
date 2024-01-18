import * as OE from '@fgaudo/fp-ts-rxjs/ObservableEither'
import * as RO from '@fgaudo/fp-ts-rxjs/ReaderObservable'
import * as ROE from '@fgaudo/fp-ts-rxjs/ReaderObservableEither'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import * as R from 'fp-ts/Reader'
import * as RT from 'fp-ts/ReaderTask'
import * as T from 'fp-ts/Task'
import { flip, flow, pipe } from 'fp-ts/function'
import * as Rx from 'rxjs'

import { ViewModel } from '@/core/view-model'

import { AddFood as AddFoodCommand } from '@/app/commands/add-food'

interface FoodData {
	readonly name: string
	readonly expDate: {
		timestamp: number
		isBestBefore: boolean
	}
}

export type Command = Readonly<
	| {
			type: 'add'
			food: FoodData
	  }
	| {
			type: 'fieldsChange'
			fields: FoodData
	  }
>

interface FieldsModel {
	name:
		| { status: 'ok' }
		| { status: 'init' }
		| {
				status: 'error'
				message: 'Cannot be empty'
		  }
	expDate:
		| { status: 'init' }
		| { status: 'ok' }
		| {
				status: 'error'
				message: 'Invalid date'
		  }
}

export const mandatoryFields = { name: true }

export const canBeSent = (fields: FieldsModel) =>
	fields.name.status === 'ok' &&
	fields.expDate.status !== 'error'

export type Model =
	| {
			type: 'ready'
			model: FieldsModel
	  }
	| { type: 'adding' }

export type Init = Readonly<{ type: 'init' }>

interface Deps {
	readonly addFood: AddFoodCommand
}

const validateInput = (
	fields: FoodData,
	timestamp: number,
): FieldsModel => ({
	expDate:
		timestamp > fields.expDate.timestamp
			? {
					status: 'error',
					message: 'Invalid date',
				}
			: { status: 'ok' },
	name:
		fields.name === ''
			? {
					status: 'error',
					message: 'Cannot be empty',
				}
			: { status: 'ok' },
})

const initFields: FieldsModel = {
	name: { status: 'init' },
	expDate: { status: 'init' },
}

export const viewModel: ViewModel<
	Deps,
	Command,
	Model,
	Init
> = {
	init: { type: 'init' },
	transformer: flow(
		R.of,
		RO.exhaustMap(cmd => {
			switch (cmd.type) {
				case 'fieldsChange':
					return pipe(
						T.fromIO(() => new Date().getDate()),
						Rx.defer,
						Rx.map(timestamp =>
							validateInput(
								cmd.fields,
								timestamp,
							),
						),
						Rx.map(
							fields =>
								({
									type: 'ready',
									model: fields,
								}) satisfies Model,
						),
						R.of,
					)
				case 'add':
					return pipe(
						T.fromIO(() => new Date().getDate()),
						Rx.defer,
						Rx.map(timestamp =>
							validateInput(
								cmd.fields,
								timestamp,
							),
						),

						R.asks((deps: Deps) =>
							deps.addFood(cmd.food),
						),
						R.map(Rx.defer),
						R.map(
							Rx.map(
								E.match(
									error =>
										({
											type: 'ready',
											model: {
												name: { status: 'ok' },
												expDate: { status: 'ok' },
											},
										}) satisfies Model,
									() =>
										({
											type: 'ready',
											model: initFields,
										}) satisfies Model,
								),
							),
						),

						R.map(() =>
							Rx.startWith({
								type: 'adding',
							} satisfies Model),
						),
					)
			}
		}),
	),
}
