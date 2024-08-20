import { pipe } from 'effect'

import {
	fallback,
	tryPromise,
} from '@/core/helper'
import { E, Eff, O, Sc } from '@/core/imports'
import * as Int from '@/core/integer'

import {
	type ProductDTO,
	ProductsServiceError,
} from '@/app/interfaces/read/get-sorted-products'

import { CapacitorService } from '..'

const ProductsListSchema = Sc.Struct({
	total: Sc.Number,
	products: Sc.Array(
		Sc.Struct({
			id: Sc.optional(
				Sc.UndefinedOr(Sc.Number).annotations({
					decodingFallback: fallback(undefined),
				}),
			),
			name: Sc.optional(
				Sc.UndefinedOr(Sc.String).annotations({
					decodingFallback: fallback(undefined),
				}),
			),
			expirationDate: Sc.optional(
				Sc.UndefinedOr(Sc.Number).annotations({
					decodingFallback: fallback(undefined),
				}),
			),
			creationDate: Sc.optional(
				Sc.UndefinedOr(Sc.Number).annotations({
					decodingFallback: fallback(undefined),
				}),
			),
		}).annotations({
			decodingFallback: fallback({}),
		}),
	),
})

export const query: Eff.Effect<
	{
		total: Int.Integer
		products: ProductDTO[]
	},
	ProductsServiceError,
	CapacitorService
> = Eff.gen(function* () {
	const { db } = yield* CapacitorService

	const result = yield* pipe(
		tryPromise(() =>
			db.getAllProductsWithTotal(),
		),
		Eff.either,
	)

	if (E.isLeft(result)) {
		yield* Eff.logError(result.left.toString())
		return yield* Eff.fail(
			ProductsServiceError(
				'There was an error while getting the data',
			),
		)
	}

	const decodeResult = yield* Sc.decodeUnknown(
		ProductsListSchema,
	)(result.right).pipe(Eff.either)

	if (E.isLeft(decodeResult)) {
		yield* Eff.logError(
			decodeResult.left.toString(),
		)

		return yield* Eff.fail(
			ProductsServiceError(
				'There was an error while decoding the data',
			),
		)
	}

	const totalResult = Int.fromNumber(
		decodeResult.right.total,
	)

	if (E.isLeft(totalResult)) {
		return yield* Eff.fail(
			ProductsServiceError(
				'There was an error while decoding the data',
			),
		)
	}

	const total = totalResult.right

	const products = yield* Eff.all(
		decodeResult.right.products.map(product =>
			Eff.gen(function* () {
				const {
					id,
					name,
					creationDate,
					expirationDate,
				} = product

				if (
					id === undefined ||
					creationDate === undefined ||
					name === undefined
				) {
					yield* Eff.logError(
						'Product is corrupt',
					).pipe(Eff.annotateLogs({ product }))

					return {
						isValid: false,
						id: pipe(
							O.fromNullable(id),
							O.map(id => id.toString(10)),
						),
						name: O.fromNullable(name),
					} as const
				}

				const result = E.all([
					Int.fromNumber(id),
					Int.fromNumber(creationDate),
					E.gen(function* () {
						if (expirationDate === undefined) {
							return O.none()
						}

						const exirationTimestamp =
							yield* Int.fromNumber(
								expirationDate,
							)

						return O.some(exirationTimestamp)
					}),
				])

				if (E.isLeft(result)) {
					yield* Eff.logError(
						'Product is corrupt',
					).pipe(Eff.annotateLogs({ product }))

					return {
						isValid: false,
						id: O.some(id.toString(10)),
						name: O.some(name),
					} as const
				}

				const [
					idInt,
					creationTimestamp,
					expirationTimestamp,
				] = result.right

				return {
					isValid: true,
					id: Int.toNumber(idInt).toString(10),
					name,
					creationDate: creationTimestamp,
					expirationDate: expirationTimestamp,
				} as const
			}),
		),
	)

	return {
		total,
		products,
	}
})
