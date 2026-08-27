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
import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Coordinates render-scoped interactions that require the current document
 * skeleton to stay stable until the interaction ends.
 */
export class DocLayoutInteractionService extends Disposable {
    private readonly _active$ = new BehaviorSubject(false);
    private _interactionCount = 0;

    readonly active$ = this._active$.asObservable();

    get isActive(): boolean {
        return this._interactionCount > 0;
    }

    beginInteraction(): IDisposable {
        this.ensureNotDisposed();
        this._interactionCount++;
        if (this._interactionCount === 1) {
            this._active$.next(true);
        }

        let disposed = false;
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }

                disposed = true;
                if (this._disposed) {
                    return;
                }
                this._interactionCount--;
                if (this._interactionCount === 0) {
                    this._active$.next(false);
                }
            },
        };
    }

    override dispose(): void {
        if (this._disposed) {
            return;
        }

        if (this._interactionCount > 0) {
            this._interactionCount = 0;
            this._active$.next(false);
        }
        this._active$.complete();
        super.dispose();
    }
}
