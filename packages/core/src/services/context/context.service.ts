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

import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';

export interface IContextService {
    readonly contextChanged$: Observable<void>;

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

    setContextValue(key: string, value: boolean): void {
        this._contextMap.set(key, value);
        this._contextChanged$.next();
    }
}
