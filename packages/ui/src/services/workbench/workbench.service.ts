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

import type { IDisposable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IWorkbenchService {
    readonly skeletonVisible$: Observable<boolean>;

    acquireSkeleton(): IDisposable;
}

export const IWorkbenchService = createIdentifier<IWorkbenchService>('univer.ui.workbench.service');

export class WorkbenchService extends Disposable implements IWorkbenchService {
    private readonly _tokens = new Set<symbol>();
    private readonly _skeletonVisible$ = new BehaviorSubject(false);

    readonly skeletonVisible$ = this._skeletonVisible$.asObservable();

    acquireSkeleton(): IDisposable {
        const token = Symbol('workbench-skeleton');
        this._tokens.add(token);
        if (this._tokens.size === 1) {
            this._skeletonVisible$.next(true);
        }

        const disposable = toDisposable(() => {
            if (!this._tokens.delete(token) || this._tokens.size > 0) {
                return;
            }

            this._skeletonVisible$.next(false);
        });
        return this.disposeWithMe(disposable);
    }

    override dispose(): void {
        super.dispose();
        this._tokens.clear();
        this._skeletonVisible$.complete();
    }
}
