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

import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Subject } from 'rxjs';

export const IZenZoneService = createIdentifier<IZenZoneService>('univer.zen-zone-service');

export interface IZenZoneService {
    readonly visible$: Subject<boolean>;
    readonly componentKey$: Subject<string>;

    readonly visible: boolean;

    set(key: string, component: any): IDisposable;

    open(): void;

    close(): void;
}
