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

import type { EmbedFloatingStage, IEmbedFloatingActivation } from '../types/embed-ui';
import { BehaviorSubject } from 'rxjs';

export class EmbedFloatingActiveService {
    private readonly _active$ = new BehaviorSubject<IEmbedFloatingActivation | null>(null);

    readonly active$ = this._active$.asObservable();

    getActive(): IEmbedFloatingActivation | null {
        return this._active$.getValue();
    }

    getStage(embedId: string): EmbedFloatingStage {
        const active = this.getActive();
        return active?.embedId === embedId ? active.stage ?? 'stage1' : 'inactive';
    }

    activate(next: IEmbedFloatingActivation, stage?: Exclude<EmbedFloatingStage, 'inactive'>): void {
        const current = this.getActive();
        const sameTarget = current?.hostUnitId === next.hostUnitId &&
            current.embedId === next.embedId &&
            current.childUnitId === next.childUnitId;
        const nextActive = {
            ...next,
            stage: stage ?? next.stage ?? (sameTarget ? current.stage ?? 'stage1' : 'stage1'),
        };
        if (
            current?.hostUnitId === nextActive.hostUnitId &&
            current.embedId === nextActive.embedId &&
            current.childUnitId === nextActive.childUnitId &&
            (current.stage ?? 'stage1') === nextActive.stage
        ) {
            return;
        }

        this._active$.next(nextActive);
    }

    setStage(embedId: string, stage: Exclude<EmbedFloatingStage, 'inactive'>): void {
        const active = this.getActive();
        if (!active || active.embedId !== embedId) {
            return;
        }
        if ((active.stage ?? 'stage1') === stage) {
            return;
        }

        this._active$.next({ ...active, stage });
    }

    promote(embedId: string): void {
        if (this.getStage(embedId) === 'stage1') {
            this.setStage(embedId, 'stage2');
        }
    }

    clear(embedId?: string): void {
        const active = this.getActive();
        if (!active) {
            return;
        }

        if (!embedId || active.embedId === embedId) {
            this._active$.next(null);
        }
    }
}
