import { createIdentifier } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

import { Disposable } from '../../Shared/lifecycle';

export interface IContextService {
    contextChanged$: Observable<void>;

    getContextValue(key: string): boolean;
    setContextValue(key: string, value: boolean): void;
}

export const IContextService = createIdentifier<IContextService>('univer.context-service');

export class ContextService extends Disposable implements IContextService {
    private _contextChanged$ = new Subject<void>();

    contextChanged$: Observable<void> = this._contextChanged$.asObservable();

    private readonly _contextMap = new Map<string, boolean>();

    override dispose(): void {
        super.dispose();
        this._contextChanged$.complete();
    }

    getContextValue(key: string): boolean {
        return this._contextMap.get(key) ?? false;
    }

    // matchContextValue(matchKey: string): boolean {
    //     let resultKey = '';
    //     for (const [key] of this._contextMap) {
    //         if (key.indexOf(matchKey) > -1) {
    //             resultKey = key;
    //             break;
    //         }
    //     }

    //     return this._contextMap.get(resultKey) ?? false;
    // }

    setContextValue(key: string, value: boolean): void {
        this._contextMap.set(key, value);
        this._contextChanged$.next();
    }
}
