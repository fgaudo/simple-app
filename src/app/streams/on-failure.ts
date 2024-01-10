import { reader as R } from 'fp-ts'
import { Observable } from 'rxjs'

import { Failure } from '@/app/types/failure'

export type OnFailure = Observable<Failure>

export type R_OnFailure<ENV> = R.Reader<
	ENV,
	Observable<Failure>
>
