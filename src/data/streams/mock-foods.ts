import * as RoA from 'fp-ts/ReadonlyArray'
import * as RoS from 'fp-ts/ReadonlySet'
import { fromEquals } from 'fp-ts/lib/Eq'
import { pipe } from 'fp-ts/lib/function'
import * as Rx from 'rxjs'

import type { R_OnProducts } from '@/app/streams/on-products'

const productSamples = [
	'Milk',
	'Eggs',
	'Philadelphia',
	'Yogurt',
	'Broccoli',
]

interface Deps {}

export const products: R_OnProducts<
	Deps,
	string
> = () =>
	pipe(
		Rx.timer(2000),
		Rx.map(() =>
			RoS.fromReadonlyArray(
				fromEquals(
					(
						a: { name: string; id: string },
						b: { name: string; id: string },
					) => a.id === b.id,
				),
			)(
				pipe(
					Array(20).keys(),
					Array.from<number>,
					RoA.fromArray,
					RoA.map(
						id =>
							({
								id: id.toString(10),
								name: productSamples[
									Math.floor(
										Math.random() *
											productSamples.length,
									)
								],
							}) as const,
					),
				),
			),
		),
	)
