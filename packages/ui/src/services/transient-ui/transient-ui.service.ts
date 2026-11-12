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
import { Subject } from 'rxjs';

export interface ITransientUIService {
    readonly dismissed$: Observable<void>;
    /** Changes whenever pending menu interactions must be discarded. */
    readonly revision: number;
    readonly suspended: boolean;
    /** Close transient menus without returning focus to their triggers. */
    dismiss(): void;
    /** Suspend host menus until the replacing view releases its lease. */
    suspend(): IDisposable;
}

export const ITransientUIService = createIdentifier<ITransientUIService>('ui.transient-ui.service');

export class TransientUIService extends Disposable implements ITransientUIService {
    private readonly _dismissed$ = new Subject<void>();
    private readonly _suspensions = new Set<symbol>();
    private _revision = 0;
    readonly dismissed$ = this._dismissed$.asObservable();

    get revision(): number {
        return this._revision;
    }

    get suspended(): boolean {
        return this._disposed || this._suspensions.size > 0;
    }

    dismiss(): void {
        if (this._disposed) {
            return;
        }
        ++this._revision;
        this._dismissed$.next();
    }

    suspend(): IDisposable {
        this.ensureNotDisposed();
        const token = Symbol('transient-ui-suspension');
        this._suspensions.add(token);
        this.dismiss();
        return toDisposable(() => this._suspensions.delete(token));
    }

    override dispose(): void {
        if (this._disposed) {
            return;
        }
        super.dispose();
        ++this._revision;
        this._dismissed$.next();
        this._dismissed$.complete();
        this._suspensions.clear();
    }
}
