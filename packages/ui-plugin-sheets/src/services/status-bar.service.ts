import { FUNCTION_NAMES } from '@univerjs/base-formula-engine';
import { Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IStatusBarService {
    state$: Observable<Nullable<IStatusBarServiceStatus>>;
    dispose(): void;
    setState(param: IStatusBarServiceStatus | null): void;
    getState(): Readonly<Nullable<IStatusBarServiceStatus>>;
    getFunctions(): Readonly<FUNCTION_NAMES[]>;
}

export type IStatusBarServiceStatus = Array<{
    func: FUNCTION_NAMES;
    value: number;
}>;

export class StatusBarService implements IStatusBarService, IDisposable {
    private readonly _functions = [
        FUNCTION_NAMES.SUM,
        FUNCTION_NAMES.MAX,
        FUNCTION_NAMES.MIN,
        FUNCTION_NAMES.AVERAGE,
        FUNCTION_NAMES.COUNT,
    ];
    private readonly _state$ = new BehaviorSubject<Nullable<IStatusBarServiceStatus>>(null);
    readonly state$ = this._state$.asObservable();

    dispose(): void {
        this._state$.complete();
    }

    setState(param: IStatusBarServiceStatus | null) {
        this._state$.next(param);
    }

    getState(): Readonly<Nullable<IStatusBarServiceStatus>> {
        return this._state$.getValue();
    }

    getFunctions(): Readonly<FUNCTION_NAMES[]> {
        return this._functions;
    }
}

export const IStatusBarService = createIdentifier<StatusBarService>('univer.sheet-status-bar.service');
