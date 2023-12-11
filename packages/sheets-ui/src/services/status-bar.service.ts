/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Nullable } from '@univerjs/core';
import type { IFunctionNames } from '@univerjs/engine-formula';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IStatusBarService {
    state$: Observable<Nullable<IStatusBarServiceStatus>>;
    dispose(): void;
    setState(param: IStatusBarServiceStatus | null): void;
    getState(): Readonly<Nullable<IStatusBarServiceStatus>>;
    getFunctions(): Readonly<IFunctionNames[]>;
}

export type IStatusBarServiceStatus = Array<{
    func: IFunctionNames;
    value: number;
}>;

export class StatusBarService implements IStatusBarService, IDisposable {
    private readonly _functions = [
        FUNCTION_NAMES_MATH.SUM,
        FUNCTION_NAMES_STATISTICAL.MAX,
        FUNCTION_NAMES_STATISTICAL.MIN,
        FUNCTION_NAMES_STATISTICAL.AVERAGE,
        FUNCTION_NAMES_STATISTICAL.COUNT,
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

    getFunctions(): Readonly<IFunctionNames[]> {
        return this._functions;
    }
}

export const IStatusBarService = createIdentifier<StatusBarService>('univer.sheet-status-bar.service');
