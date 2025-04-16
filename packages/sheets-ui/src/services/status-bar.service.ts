/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { IFunctionNames } from '@univerjs/engine-formula';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import { createIdentifier } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IStatusBarService {
    state$: Observable<Nullable<IStatusBarServiceStatus>>;
    dispose(): void;
    setState(param: IStatusBarServiceStatus | null): void;
    getState(): Readonly<Nullable<IStatusBarServiceStatus>>;
    getFunctions(): Readonly<IStatusBarFunction[]>;
}

export interface IStatusBarServiceStatus {
    values: Array<{
        func: IFunctionNames;
        value: number;
    }>;
    pattern: Nullable<string>;
}

export interface IStatusBarFunction {
    func: IFunctionNames;
    filter?: (status: IStatusBarServiceStatus) => boolean;
}

export class StatusBarService implements IStatusBarService, IDisposable {
    private readonly _functions: IStatusBarFunction[] = [
        {
            func: FUNCTION_NAMES_STATISTICAL.MAX,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1 &&
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value ?? 0) > 0,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.MIN,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1 &&
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value ?? 0) > 0,
        },
        {
            func: FUNCTION_NAMES_MATH.SUM,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1 &&
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value ?? 0) > 0,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.COUNTA,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1,
        },
        {
            func: FUNCTION_NAMES_STATISTICAL.COUNT,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1 &&
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value ?? 0) > 0,
        },

        {
            func: FUNCTION_NAMES_STATISTICAL.AVERAGE,
            filter: (status: IStatusBarServiceStatus) =>
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value ?? 0) > 1 &&
                (status.values.find((item) => item.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value ?? 0) > 0,
        },
    ];

    private readonly _state$ = new BehaviorSubject<Nullable<IStatusBarServiceStatus>>(null);
    readonly state$ = this._state$.asObservable();

    dispose(): void {
        this._state$.complete();
    }

    setState(param: IStatusBarServiceStatus | null) {
        const newState: IStatusBarServiceStatus = {
            values: [],
            pattern: null,
        };
        // handle the filter.
        param?.values.forEach((item) => {
            const func = this._functions.find((func) => func.func === item.func);
            if (func && (func.filter === undefined || func.filter(param))) {
                newState.values.push(item);
            }
        });
        newState.pattern = param?.pattern ?? null;
        this._state$.next(newState);
    }

    getState(): Readonly<Nullable<IStatusBarServiceStatus>> {
        return this._state$.getValue();
    }

    getFunctions(): Readonly<IStatusBarFunction[]> {
        return this._functions;
    }

    addFunctions(functions: IStatusBarFunction[]) {
        this._functions.push(...functions);
    }
}

export const IStatusBarService = createIdentifier<StatusBarService>('univer.sheet-status-bar.service');
