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
import type { Observable } from 'rxjs';
import type { IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';

import { createIdentifier } from '@univerjs/core';

export const IDialogService = createIdentifier<IDialogService>('univer.ui.dialog-service');
export interface IDialogService {
    open(params: IDialogPartMethodOptions): IDisposable;
    close(id: string): void;
    /**
     * @description close all dialogs except the specified ones
     * @param {string[]} [expectIds] The specified dialog ids
     */
    closeAll(expectIds?: string[]): void;
    getDialogs$(): Observable<IDialogPartMethodOptions[]>;
}
