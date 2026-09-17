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
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';

type CallbackFunction = (unitId: string, subUnitId: string, row: number) => boolean;

/**
 * The service that gets the row filter status
 */
export interface ISheetRowFilteredService {
    register(callback: CallbackFunction): IDisposable;

    getRowFiltered(unitId: string, subUnitId: string, row: number): boolean;
}

export class SheetRowFilteredService extends Disposable implements ISheetRowFilteredService {
    private _getRowFilteredCallbacks = new Set<CallbackFunction>();

    register(callback: CallbackFunction) {
        this._getRowFilteredCallbacks.add(callback);
        return toDisposable(() => this._getRowFilteredCallbacks.delete(callback));
    }

    getRowFiltered(unitId: string, subUnitId: string, row: number): boolean {
        for (const callback of this._getRowFilteredCallbacks) {
            if (callback(unitId, subUnitId, row)) {
                return true;
            }
        }

        return false;
    }

    override dispose(): void {
        this._getRowFilteredCallbacks.clear();
        super.dispose();
    }
}

export const ISheetRowFilteredService = createIdentifier<ISheetRowFilteredService>(
    'univer.formula.sheet-row-filtered.service'
);
