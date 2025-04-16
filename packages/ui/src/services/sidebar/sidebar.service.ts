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
import type { Subject } from 'rxjs';
import type { ISidebarMethodOptions } from '../../views/components/sidebar/Sidebar';
import { createIdentifier } from '@univerjs/core';

export interface ISidebarService {
    readonly sidebarOptions$: Subject<ISidebarMethodOptions>;
    readonly scrollEvent$: Subject<Event>;

    open(params: ISidebarMethodOptions): IDisposable;
    close(id?: string): void;

    get visible(): boolean;

    get options(): ISidebarMethodOptions;

    getContainer(): HTMLElement | undefined;
    setContainer(element?: HTMLElement): void;
}

export const ILeftSidebarService = createIdentifier<ISidebarService>('ui.left-sidebar.service');
export const ISidebarService = createIdentifier<ISidebarService>('ui.sidebar.service');
