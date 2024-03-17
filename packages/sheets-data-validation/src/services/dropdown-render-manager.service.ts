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

import { ObjectMatrix } from '@univerjs/core';

export interface IDropdownRenderItem {
    cellValue: string;

}

export class DropdownManagerService {
    private _renderMaps: Map<string, Map<string, ObjectMatrix<IDropdownRenderItem>>> = new Map();

    constructor() {}

    ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._renderMaps.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._renderMaps.set(unitId, unitMap);
        }

        let matrix = unitMap.get(subUnitId);
        if (!matrix) {
            matrix = new ObjectMatrix();
            unitMap.set(subUnitId, matrix);
        }

        return matrix;
    }
}
