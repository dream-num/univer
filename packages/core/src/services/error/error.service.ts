import { Subject } from 'rxjs';

import { Disposable } from '../../Shared/lifecycle';

export interface IError {
    errorKey: string;
}

export class ErrorService extends Disposable {
    private readonly _error$ = new Subject<IError>();
    error$ = this._error$.asObservable();

    override dispose(): void {
        this._error$.complete();
    }

    emit(key: string): void {
        this._error$.next({ errorKey: key });
    }
}
