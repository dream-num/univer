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
import { toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export type EmbedFloatingGeometryInvalidationReason =
    | 'host-scroll'
    | 'child-scroll'
    | 'resize'
    | 'stage-change'
    | 'wheel'
    | 'manual';

export interface IEmbedFloatingGeometryInvalidation {
    embedId?: string;
    reason: EmbedFloatingGeometryInvalidationReason;
}

export interface IEmbedFloatingGeometryRegistration {
    embedId: string;
    childUnitId?: string;
    root: HTMLElement;
    viewport?: HTMLElement | null;
    contentRoot?: HTMLElement | null;
}

export class EmbedFloatingGeometryService {
    private readonly _registrations = new Map<string, IEmbedFloatingGeometryRegistration>();
    private readonly _geometryInvalidated$ = new Subject<IEmbedFloatingGeometryInvalidation>();

    readonly geometryInvalidated$ = this._geometryInvalidated$.asObservable();

    register(registration: IEmbedFloatingGeometryRegistration): IDisposable {
        this._registrations.set(registration.embedId, registration);
        this.invalidate({ embedId: registration.embedId, reason: 'manual' });

        return toDisposable(() => {
            if (this._registrations.get(registration.embedId) === registration) {
                this._registrations.delete(registration.embedId);
                this.invalidate({ embedId: registration.embedId, reason: 'manual' });
            }
        });
    }

    getRegistration(embedId: string): IEmbedFloatingGeometryRegistration | undefined {
        return this._registrations.get(embedId);
    }

    getRegistrationByChildUnitId(childUnitId: string): IEmbedFloatingGeometryRegistration | undefined {
        return Array.from(this._registrations.values()).find((registration) => registration.childUnitId === childUnitId);
    }

    invalidate(invalidation: IEmbedFloatingGeometryInvalidation): void {
        this._geometryInvalidated$.next(invalidation);
    }
}
