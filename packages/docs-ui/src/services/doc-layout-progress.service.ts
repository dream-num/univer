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

import type { DocumentDataModel } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, takeUntil } from 'rxjs';

export interface IDocLayoutProgressState {
    progress: number;
    unitId: string;
}

export class DocLayoutProgressService extends RxDisposable {
    private readonly _progressByUnit$ = new BehaviorSubject<ReadonlyMap<string, number>>(new Map());

    readonly currentProgress$: Observable<IDocLayoutProgressState | null>;

    constructor(@IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService) {
        super();

        this.currentProgress$ = combineLatest([
            this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
            this._progressByUnit$,
        ]).pipe(
            map(([document, progressByUnit]): IDocLayoutProgressState | null => {
                if (!document) {
                    return null;
                }

                const unitId = document.getUnitId();
                const progress = progressByUnit.get(unitId);
                return progress == null ? null : { progress, unitId };
            }),
            distinctUntilChanged((previous, current) => previous?.unitId === current?.unitId && previous?.progress === current?.progress),
            takeUntil(this.dispose$)
        );
    }

    setProgress(unitId: string, progress: number): void {
        const current = this._progressByUnit$.value;
        if (current.get(unitId) === progress) {
            return;
        }

        this._progressByUnit$.next(new Map(current).set(unitId, progress));
    }

    clearProgress(unitId: string): void {
        const current = this._progressByUnit$.value;
        if (!current.has(unitId)) {
            return;
        }

        const next = new Map(current);
        next.delete(unitId);
        this._progressByUnit$.next(next);
    }

    override dispose(): void {
        this._progressByUnit$.complete();
        super.dispose();
    }
}
