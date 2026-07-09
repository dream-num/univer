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

import type { Injector } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { IRibbonService } from './ribbon.service';
import { createIdentifier, Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IRibbonOverride {
    id: string;
    ribbonService: IRibbonService;
    injector?: Pick<Injector, 'get' | 'has' | 'invoke'>;
    portalContainer?: HTMLElement | null;
    placeholderTitle?: string;
    hideToolbar?: boolean;
}

export interface IRibbonOverrideService {
    readonly override$: Observable<IRibbonOverride | null>;
    getOverride(): IRibbonOverride | null;
    activate(override: IRibbonOverride): void;
    clear(id?: string): void;
}

export const IRibbonOverrideService = createIdentifier<IRibbonOverrideService>('univer.ribbon-override-service');

export class RibbonOverrideService extends Disposable implements IRibbonOverrideService {
    private readonly _override$ = new BehaviorSubject<IRibbonOverride | null>(null);
    readonly override$ = this._override$.asObservable();

    getOverride(): IRibbonOverride | null {
        return this._override$.getValue();
    }

    activate(override: IRibbonOverride): void {
        this._override$.next(override);
    }

    clear(id?: string): void {
        const current = this.getOverride();
        if (!current) {
            return;
        }

        if (!id || current.id === id) {
            this._override$.next(null);
        }
    }

    override dispose(): void {
        this._override$.next(null);
        this._override$.complete();
        super.dispose();
    }
}
