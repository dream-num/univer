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

import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import type { IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetDefinedNameMap, IDirtyUnitSheetNameMap } from '../basics/common';
import { Disposable } from '@univerjs/core';

export interface IDirtyConversionManagerParams {
    commandId: string;
    getDirtyData: (command: ICommandInfo) => {
        dirtyRanges?: IUnitRange[];
        dirtyNameMap?: IDirtyUnitSheetNameMap;
        dirtyDefinedNameMap?: IDirtyUnitSheetDefinedNameMap;
        dirtyUnitFeatureMap?: IDirtyUnitFeatureMap;
        dirtyUnitOtherFormulaMap?: IDirtyUnitOtherFormulaMap;
        clearDependencyTreeCache?: IDirtyUnitSheetNameMap;
    };
}

/**
 * This service expose a API for plugins to tell the formula engine what areas could be dirty when
 * a mutation is triggered.
 */
export class ActiveDirtyManagerService extends Disposable {
    private _dirtyConversionMap: Map<string, IDirtyConversionManagerParams> = new Map();

    override dispose(): void {
        super.dispose();
        this._dirtyConversionMap.clear();
    }

    get(commandId: string) {
        return this._dirtyConversionMap.get(commandId);
    }

    register(commandId: string, dirtyConversion: IDirtyConversionManagerParams) {
        this._dirtyConversionMap.set(commandId, dirtyConversion);
    }
}
