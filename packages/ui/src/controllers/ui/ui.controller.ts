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

import { createIdentifier } from '@univerjs/core';

export interface IWorkbenchOptions {
    container?: string | HTMLElement;

    /**
     * If Univer should make the header bar visible.
     */
    header?: boolean;

    /**
     * If Univer should make the toolbar bar visible.
     */
    toolbar?: boolean;

    /**
     * If Univer should make the footer bar visible.
     */
    footer?: boolean;

    /**
     * If Univer should make the context menu usable.
     */
    contextMenu?: boolean;

    /**
     * If Univer should make the header menu visible.
     */
    headerMenu?: boolean;
}

export interface IUIController { }
export const IUIController = createIdentifier<IUIController>('univer.ui.ui-controller');
