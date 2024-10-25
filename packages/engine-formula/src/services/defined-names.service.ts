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

import type { IUnitRange, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { handleRefStringInfo, serializeRange } from '../engine/utils/reference';

export interface DefinedNamesServiceParam {
    id: string;
    name: string;
    formulaOrRefString: string;
    comment?: string;
    localSheetId?: string;
    hidden?: boolean;

}

export interface DefinedNamesServiceFocusParam extends DefinedNamesServiceParam {
    unitId: string;
}

export interface IDefinedNameMap {
    [unitId: string]: IDefinedNameMapItem;
}

export interface IDefinedNameMapItem {
    [id: string]: DefinedNamesServiceParam;
}

// DEBT@wzhudev: this service expose too much API that seems redundant.

/**
 * This service is for storing data for "Define Names" feature.
 */
export class DefinedNamesService extends Disposable {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: IDefinedNameMap = {};

    private readonly _update$ = new Subject();
    readonly update$ = this._update$.asObservable();

    private _currentRange: IUnitRange = {
        unitId: '', sheetId: '', range: {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
    };

    private readonly _currentRange$ = new Subject<IUnitRange>();
    readonly currentRange$ = this._currentRange$.asObservable();

    private readonly _focusRange$ = new Subject<DefinedNamesServiceFocusParam>();
    readonly focusRange$ = this._focusRange$.asObservable();

    constructor(@IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService) {
        super();
        // this.registerDefinedName('workbook-01', { id: 'test1', name: 'name-01', formulaOrRefString: '=sum(A1:B10)', comment: 'this is comment', localSheetId: 'sheet-0011', hidden: false });
    }

    override dispose(): void {
        this._definedNameMap = {};
    }

    getWorksheetByRef(unitId: string, ref: string) {
        const { sheetName } = handleRefStringInfo(ref);
        return this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetName(sheetName);
    }

    focusRange(unitId: string, id: string) {
        const item = this.getValueById(unitId, id);
        if (item == null) {
            return;
        }

        this._focusRange$.next({ ...item, unitId });
    }

    setCurrentRange(range: IUnitRange) {
        this._currentRange = range;
        this._currentRange$.next(range);
    }

    getCurrentRange() {
        return this._currentRange;
    }

    getCurrentRangeForString() {
        return serializeRange(this._currentRange.range);
    }

    registerDefinedNames(unitId: string, params: IDefinedNameMapItem) {
        this._definedNameMap[unitId] = params;
        this._update();
    }

    registerDefinedName(unitId: string, param: DefinedNamesServiceParam) {
        const unitMap = this._definedNameMap[unitId];

        if (unitMap == null) {
            this._definedNameMap[unitId] = {};
        }
        this._definedNameMap[unitId][param.id] = param;

        this._update();
    }

    removeDefinedName(unitId: string, id: string) {
        delete this._definedNameMap[unitId]?.[id];
        this._update();
    }

    removeUnitDefinedName(unitId: string) {
        delete this._definedNameMap[unitId];
        this._update();
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap[unitId];
    }

    getValueByName(unitId: string, name: string) {
        const nameMap = this._definedNameMap[unitId];
        if (nameMap == null) {
            return null;
        }
        return Array.from(Object.values(nameMap)).filter((value) => {
            return value.name === name;
        })?.[0];
    }

    getValueById(unitId: string, id: string) {
        return this._definedNameMap[unitId]?.[id];
    }

    hasDefinedName(unitId: string) {
        if (this._definedNameMap[unitId] == null) {
            return false;
        }
        const size = Array.from(Object.values(this._definedNameMap[unitId])).length || 0;
        return size !== 0;
    }

    private _update() {
        this._update$.next(null);
    }
}
