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

import type { DependencyOverride } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { MenuConfig } from '../../services/menu/menu';

export interface IWorkbenchOptions {
    container?: string | HTMLElement;

    header?: boolean;
    footer?: boolean;
    contextMenu?: boolean;
}

export interface IUIController {
    bootstrapWorkbench(options: IWorkbenchOptions): void;
}

export const IUIController = createIdentifier<IUIController>('univer.ui-controller');

export interface IUniverUIConfig extends IWorkbenchOptions {
    /** Disable auto focus when Univer bootstraps. */
    disableAutoFocus?: true;

    override?: DependencyOverride;

    menu?: MenuConfig;
}
