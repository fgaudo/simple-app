import { fc, test } from '@fast-check/vitest'
import { describe, expect } from 'vitest'

import {
	Eff,
	Int,
	L,
	NETS,
	NNInt,
	O,
} from '@/core/imports.ts'
import * as H from '@/core/test-helpers.ts'
import { testRuntime } from '@/core/utils.ts'

import {
	GetSortedProductsService,
	type ProductDTO,
} from '@/app/interfaces/get-sorted-products.ts'

import type { FridgySqlitePlugin } from '../fridgy-sqlite-plugin.ts'
import { CapacitorService } from '../index.ts'
import { query } from './get-sorted-products.ts'

const record = fc.record({
	id: H.numberOrUndefined,
	creationDate: H.numberOrUndefined,
	expirationDate: H.numberOrUndefined,
	name: H.stringOrUndefined,
})

function toModel(product: {
	id: number | undefined
	name: string | undefined
	creationDate: number | undefined
	expirationDate: number | undefined
}): ProductDTO {
	if (
		Int.isInteger(product.id) &&
		product.name !== undefined &&
		NETS.isNonBlank(product.name) &&
		Int.isInteger(product.creationDate) &&
		(product.expirationDate === undefined ||
			Int.isInteger(product.expirationDate))
	) {
		return {
			isValid: true,
			id: product.id.toString(10),
			name: NETS.unsafe_fromString(product.name),
			creationDate: Int.unsafe_fromNumber(
				product.creationDate,
			),
			expirationDate: O.fromNullable(
				product.expirationDate,
			).pipe(O.map(Int.unsafe_fromNumber)),
		}
	}

	return {
		isValid: false,
		name: O.fromNullable(product.name).pipe(
			O.flatMap(NETS.fromString),
		),
		id: O.fromNullable(product.id).pipe(
			O.map(id => id.toString(10)),
		),
	}
}

const mockUsecase = Eff.gen(function* () {
	return yield* yield* GetSortedProductsService
})

describe('Get products', () => {
	test.concurrent.prop([record, record, record])(
		'Should return a list',
		async (a, b, c) => {
			const products = [a, b, c]

			const useCase = Eff.provide(
				mockUsecase,
				L.provide(
					query,
					L.succeed(CapacitorService, {
						db: {
							getAllProductsWithTotal: () =>
								Promise.resolve({
									total: products.length,
									products,
								}),
						} as unknown as FridgySqlitePlugin,
					}),
				),
			)

			const exit =
				await testRuntime.runPromiseExit(useCase)

			H.assertExitIsSuccess(exit)

			expect(exit.value).toStrictEqual({
				total: NNInt.unsafe_fromNumber(
					products.length,
				),
				products: products.map(toModel),
			})
		},
	)

	test.concurrent(
		'Should return an error',
		async () => {
			const useCase = Eff.provide(
				mockUsecase,
				L.provide(
					query,
					L.succeed(CapacitorService, {
						db: {
							getAllProductsWithTotal: () =>
								Promise.resolve({}),
						} as unknown as FridgySqlitePlugin,
					}),
				),
			)

			const exit =
				await testRuntime.runPromiseExit(useCase)

			H.assertExitIsFailure(exit)
		},
	)

	test.concurrent(
		'Should return an error',
		async () => {
			const useCase = Eff.provide(
				mockUsecase,
				L.provide(
					query,
					L.succeed(CapacitorService, {
						db: {
							getAllProductsWithTotal: () =>
								Promise.reject(new Error()),
						} as unknown as FridgySqlitePlugin,
					}),
				),
			)

			const exit =
				await testRuntime.runPromiseExit(useCase)

			H.assertExitIsFailure(exit)
		},
	)

	test.concurrent(
		'Should return an error',
		async () => {
			const useCase = Eff.provide(
				mockUsecase,
				L.provide(
					query,
					L.succeed(CapacitorService, {
						db: {
							getAllProductsWithTotal: () =>
								Promise.resolve({
									total: 3.5,
									products: [],
								}),
						} as unknown as FridgySqlitePlugin,
					}),
				),
			)

			const exit =
				await testRuntime.runPromiseExit(useCase)

			H.assertExitIsFailure(exit)
		},
	)

	test.concurrent('Should crash', async () => {
		const useCase = Eff.provide(
			mockUsecase,
			L.provide(
				query,
				L.succeed(CapacitorService, {
					db: {
						getAllProductsWithTotal: () => {
							throw new Error()
						},
					} as unknown as FridgySqlitePlugin,
				}),
			),
		)

		const exit =
			await testRuntime.runPromiseExit(useCase)

		H.assertExitIsDie(exit)
	})
})
