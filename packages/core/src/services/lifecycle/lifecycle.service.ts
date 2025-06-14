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

import type { Observable } from 'rxjs';
import { BehaviorSubject, filter, firstValueFrom, map, merge, of, skip } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';
import { takeAfter } from '../../shared/rxjs';
import { ILogService } from '../log/log.service';
import { LifecycleNameMap, LifecycleStages } from './lifecycle';

/**
 * An error that indicates a lifecycle stage will never be reached, mostly due to the Univer instance is
 * disposed.
 */
export class LifecycleUnreachableError extends Error {
    constructor(stage: LifecycleStages) {
        super(`[LifecycleService]: lifecycle stage "${LifecycleNameMap[stage]}" will never be reached!`);
        this.name = 'LifecycleUnreachableError';
    }
}

/**
 * This service controls the lifecycle of a Univer instance. Other modules can
 * inject this service to read the current lifecycle stage or subscribe to
 * lifecycle changes.
 */
export class LifecycleService extends Disposable {
    private _lifecycle$ = new BehaviorSubject<LifecycleStages>(LifecycleStages.Starting);
    readonly lifecycle$ = this._lifecycle$.asObservable();

    private _lock = false;

    constructor(@ILogService private readonly _logService: ILogService) {
        super();

        this._reportProgress(LifecycleStages.Starting);
    }

    get stage(): LifecycleStages {
        return this._lifecycle$.getValue();
    }

    set stage(stage: LifecycleStages) {
        if (this._lock) throw new Error('[LifecycleService]: cannot set new stage when related logic is all handled!');
        if (stage < this.stage) throw new Error('[LifecycleService]: lifecycle stage cannot go backward!');
        if (stage === this.stage) return;

        this._lock = true;
        this._reportProgress(stage);
        this._lifecycle$.next(stage);
        this._lock = false;
    }

    override dispose(): void {
        this._lifecycle$.complete();
        super.dispose();
    }

    /**
     * Wait for a specific lifecycle stage to be reached.
     * @param stage The lifecycle stage to wait for.
     * If the current stage is already at or beyond the specified stage, it will
     * resolve immediately.
     * If the specified stage is unreachable, it will reject with a
     * `LifecycleUnreachableError`.
     * @returns A promise that resolves when the specified stage is reached.
     */
    onStage(stage: LifecycleStages): Promise<void> {
        return firstValueFrom(this.lifecycle$.pipe(
            filter((s) => s >= stage),
            takeAfter((s) => s === stage),
            map(() => void 0)
        )).catch((err) => {
            if (err.name === 'EmptyError') {
                return Promise.reject(new LifecycleUnreachableError(stage));
            }

            return Promise.reject(err);
        });
    }

    /**
     * Subscribe to lifecycle changes and all previous stages and the current
     * stage will be emitted immediately.
     * @returns An observable that emits the lifecycle stages, including the current
     */
    subscribeWithPrevious(): Observable<LifecycleStages> {
        return merge(getLifecycleStagesAndBefore(this.stage), this._lifecycle$.pipe(skip(1)))
            .pipe(takeAfter((s) => s === LifecycleStages.Steady));
    }

    private _reportProgress(stage: LifecycleStages): void {
        this._logService.debug('[LifecycleService]', `lifecycle progressed to "${LifecycleNameMap[stage]}".`);
    }
}

export function getLifecycleStagesAndBefore(lifecycleStage: LifecycleStages): Observable<LifecycleStages> {
    switch (lifecycleStage) {
        case LifecycleStages.Starting:
            return of(LifecycleStages.Starting);
        case LifecycleStages.Ready:
            return of(LifecycleStages.Starting, LifecycleStages.Ready);
        case LifecycleStages.Rendered:
            return of(LifecycleStages.Starting, LifecycleStages.Ready, LifecycleStages.Rendered);
        default:
            return of(
                LifecycleStages.Starting,
                LifecycleStages.Ready,
                LifecycleStages.Rendered,
                LifecycleStages.Steady
            );
    }
}
