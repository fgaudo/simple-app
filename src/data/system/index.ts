import { reader as R } from 'fp-ts'

import type { Contracts } from '@/app/index'

import { log } from './write/log'

export interface Deps {
	appLogPrefix: string
	uiLogPrefix: string
}

export const implementations: R.Reader<
	Deps,
	Pick<Contracts, 'appLog' | 'uiLog'>
> = ({ appLogPrefix: prefix, uiLogPrefix }) => ({
	appLog: log({ prefix }),
	uiLog: log({ prefix: uiLogPrefix }),
})
