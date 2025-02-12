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
import type { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import type { ComponentType } from '../../common/component-manager';
import { createIdentifier } from '@univerjs/core';

export const IZenZoneService = createIdentifier<IZenZoneService>('univer.zen-zone-service');

export interface IZenZoneService {
    readonly visible$: BehaviorSubject<boolean>;
    readonly componentKey$: ReplaySubject<string>;
    readonly temporaryHidden$: Observable<boolean>;

    readonly visible: boolean;
    readonly temporaryHidden: boolean;

    set(key: string, component: ComponentType): IDisposable;

    open(): void;

    close(): void;

    /**
     * temporarily hide the zen zone, often
     */
    hide(): void;
    /**
     * show the zen zone
     */
    show(): void;
}
