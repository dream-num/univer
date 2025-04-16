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

import type { IUnitRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { handleRefStringInfo, serializeRange } from '../engine/utils/reference';

export interface IDefinedNamesServiceParam {
    id: string;
    name: string;
    formulaOrRefString: string;
    comment?: string;
    localSheetId?: string;
    hidden?: boolean;

}

export interface IDefinedNamesServiceFocusParam extends IDefinedNamesServiceParam {
    unitId: string;
}

export interface IDefinedNameMap {
    [unitId: string]: IDefinedNameMapItem;
}

export interface IDefinedNameMapItem {
    [id: string]: IDefinedNamesServiceParam;
}

export interface IDefinedNamesService {
    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam): void;

    registerDefinedNames(unitId: string, params: IDefinedNameMapItem): void;

    getDefinedNameMap(unitId: string): Nullable<IDefinedNameMapItem>;

    getValueByName(unitId: string, name: string): Nullable<IDefinedNamesServiceParam>;

    getValueById(unitId: string, id: string): Nullable<IDefinedNamesServiceParam>;

    removeDefinedName(unitId: string, name: string): void;

    removeUnitDefinedName(unitId: string): void;

    hasDefinedName(unitId: string): boolean;

    setCurrentRange(range: IUnitRange): void;

    getCurrentRange(): IUnitRange;

    getCurrentRangeForString(): string;

    currentRange$: Observable<IUnitRange>;

    update$: Observable<unknown>;

    focusRange$: Observable<IDefinedNamesServiceFocusParam>;

    focusRange(unitId: string, id: string): void;

    getWorksheetByRef(unitId: string, ref: string): Nullable<Worksheet>;

}
export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: IDefinedNameMap = {};
    private _nameCacheMap: { [unitId: string]: { [name: string]: IDefinedNamesServiceParam } } = {}; // Cache for name-to-definition mapping

    private readonly _update$ = new Subject();
    readonly update$ = this._update$.asObservable();

    private _currentRange: IUnitRange = {
        unitId: '',
        sheetId: '',
        range: {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
    };

    private readonly _currentRange$ = new Subject<IUnitRange>();
    readonly currentRange$ = this._currentRange$.asObservable();

    private readonly _focusRange$ = new Subject<IDefinedNamesServiceFocusParam>();
    readonly focusRange$ = this._focusRange$.asObservable();

    constructor(@IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService) {
        super();
    }

    override dispose(): void {
        super.dispose();
        this._definedNameMap = {};
        this._nameCacheMap = {};
        this._update$.complete();
        this._currentRange$.complete();
        this._focusRange$.complete();
    }

    getWorksheetByRef(unitId: string, ref: string) {
        const { sheetName } = handleRefStringInfo(ref);
        return this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetName(sheetName);
    }

    focusRange(unitId: string, id: string) {
        const item = this.getValueById(unitId, id);
        if (item === undefined) {
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
        this._updateCache(unitId);
        this._update();
    }

    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam) {
        const unitMap = this._definedNameMap[unitId];

        if (unitMap === undefined) {
            this._definedNameMap[unitId] = {};
        }
        this._definedNameMap[unitId][param.id] = param;

        this._updateCache(unitId);
        this._update();
    }

    removeDefinedName(unitId: string, id: string) {
        delete this._definedNameMap[unitId]?.[id];
        this._updateCache(unitId);
        this._update();
    }

    removeUnitDefinedName(unitId: string) {
        delete this._definedNameMap[unitId];
        this._updateCache(unitId);
        this._update();
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap[unitId];
    }

    getValueByName(unitId: string, name: string) {
        // Check cache first
        const cachedMap = this._nameCacheMap[unitId];
        if (cachedMap) {
            return cachedMap[name] || null;
        }

        // If not in cache, traverse the nameMap
        const nameMap = this._definedNameMap[unitId];
        if (nameMap === undefined) {
            return null;
        }

        let result = null;
        for (const item of Object.values(nameMap)) {
            if (item.name === name) {
                result = item;
                break;
            }
        }

        // Cache the result if found
        if (result) {
            this._nameCacheMap[unitId] = this._nameCacheMap[unitId] || {};
            this._nameCacheMap[unitId][name] = result;
        }

        return result;
    }

    getValueById(unitId: string, id: string) {
        return this._definedNameMap[unitId]?.[id];
    }

    hasDefinedName(unitId: string) {
        if (this._definedNameMap[unitId] === undefined) {
            return false;
        }
        const size = Array.from(Object.values(this._definedNameMap[unitId])).length || 0;
        return size !== 0;
    }

    private _update() {
        this._update$.next(null);
    }

    private _updateCache(unitId: string) {
        const nameMap = this._definedNameMap[unitId];
        if (nameMap === undefined) {
            delete this._nameCacheMap[unitId];
            return;
        }

        this._nameCacheMap[unitId] = {};

        // Cache all name mappings for this unitId
        for (const item of Object.values(nameMap)) {
            this._nameCacheMap[unitId][item.name] = item;
        }
    }
}

export const IDefinedNamesService = createIdentifier<DefinedNamesService>('univer.formula.defined-names.service');
