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
    formulaOrRefStringWithPrefix?: string; // for excel
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

export interface IDefinedNamesUpdateEvent {
    type: 'update' | 'remove';
    unitId: string;
    definedNames: IDefinedNamesServiceParam[];
}

export interface IDefinedNamesService {
    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam): void;

    registerDefinedNames(unitId: string, params: IDefinedNameMapItem): void;

    getDefinedNameMap(unitId: string): Nullable<IDefinedNameMapItem>;

    getValueByName(unitId: string, name: string, sheetId?: Nullable<string>): Nullable<IDefinedNamesServiceParam>;

    getValueById(unitId: string, id: string): Nullable<IDefinedNamesServiceParam>;

    removeDefinedName(unitId: string, name: string): void;

    removeUnitDefinedName(unitId: string): void;

    hasDefinedName(unitId: string): boolean;

    setCurrentRange(range: IUnitRange): void;

    getCurrentRange(): IUnitRange;

    getCurrentRangeForString(): string;

    currentRange$: Observable<IUnitRange>;

    update$: Observable<IDefinedNamesUpdateEvent>;

    focusRange$: Observable<IDefinedNamesServiceFocusParam>;

    focusRange(unitId: string, id: string): void;

    getWorksheetByRef(unitId: string, ref: string): Nullable<Worksheet>;

    getAllDefinedNames(): IDefinedNameMap;

    getAllDefinedNamesIsEmpty(): boolean;

    getDefinedNameByRefString(unitId: string, formulaOrRefString: string): Nullable<IDefinedNamesServiceParam>;
}

export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: IDefinedNameMap = {};
    // Cache for name-to-definition mapping, here name key is ignored case sensitivity
    private _nameCacheMap: { [unitId: string]: { [name: string]: IDefinedNamesServiceParam } } = {};
    //
    private _definedNamesIsEmpty: boolean = true;

    private readonly _update$ = new Subject<IDefinedNamesUpdateEvent>();
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

        const definedNames = Object.values(params);
        this._update({
            type: 'update',
            unitId,
            definedNames,
        });

        if (definedNames.length > 0) {
            this._definedNamesIsEmpty = false;
        }
    }

    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam) {
        const unitMap = this._definedNameMap[unitId];
        if (unitMap === undefined) {
            this._definedNameMap[unitId] = {};
        }
        this._definedNameMap[unitId][param.id] = param;

        this._updateCache(unitId);
        this._update({
            type: 'update',
            unitId,
            definedNames: [param],
        });
        this._definedNamesIsEmpty = false;
    }

    removeDefinedName(unitId: string, id: string) {
        const definedName = this._definedNameMap[unitId]?.[id];
        if (!definedName) {
            return;
        }

        delete this._definedNameMap[unitId][id];
        this._updateCache(unitId);
        this._update({
            type: 'remove',
            unitId,
            definedNames: [definedName],
        });
        this._definedNamesIsEmpty = this._isDeepDefinedNameMapEmpty();
    }

    removeUnitDefinedName(unitId: string) {
        const definedNames = this._definedNameMap[unitId];
        if (!definedNames) {
            return;
        }

        delete this._definedNameMap[unitId];
        this._updateCache(unitId);
        this._update({
            type: 'remove',
            unitId,
            definedNames: Object.values(definedNames),
        });
        this._definedNamesIsEmpty = this._isDeepDefinedNameMapEmpty();
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap[unitId];
    }

    getValueByName(unitId: string, name: string, sheetId?: Nullable<string>) {
        const nameMap = this._definedNameMap[unitId];
        if (nameMap === undefined) {
            return null;
        }

        if (sheetId) {
            const normalizedName = name.toLowerCase();
            let workbookScope: Nullable<IDefinedNamesServiceParam> = null;
            let firstMatch: Nullable<IDefinedNamesServiceParam> = null;
            for (const item of Object.values(nameMap)) {
                if (item.name.toLowerCase() !== normalizedName) {
                    continue;
                }
                if (firstMatch == null) {
                    firstMatch = item;
                }
                if (item.localSheetId === sheetId) {
                    return item;
                }
                if (item.localSheetId === 'AllDefaultWorkbook' || item.localSheetId == null) {
                    if (workbookScope == null) {
                        workbookScope = item;
                    }
                }
            }

            return workbookScope ?? firstMatch;
        }

        // Check cache first
        const cachedMap = this._nameCacheMap[unitId];
        if (cachedMap) {
            return cachedMap[name.toLowerCase()] || null;
        }

        // If not in cache, traverse the nameMap
        let result = null;
        const normalizedName = name.toLowerCase();
        for (const item of Object.values(nameMap)) {
            if (
                item.name.toLowerCase() === normalizedName &&
                (item.localSheetId === 'AllDefaultWorkbook' || item.localSheetId == null)
            ) {
                result = item;
                break;
            }
        }

        if (!result) {
            for (const item of Object.values(nameMap)) {
                if (item.name.toLowerCase() === normalizedName) {
                    result = item;
                    break;
                }
            }
        }

        // Cache the result if found
        if (result) {
            this._nameCacheMap[unitId] = this._nameCacheMap[unitId] || {};
            this._nameCacheMap[unitId][name.toLowerCase()] = result;
        }

        return result;
    }

    getValueById(unitId: string, id: string) {
        return this._definedNameMap[unitId]?.[id];
    }

    hasDefinedName(unitId: string) {
        if (!this._definedNameMap[unitId]) {
            return false;
        }
        return Object.keys(this._definedNameMap[unitId]).length > 0;
    }

    getAllDefinedNames() {
        return this._definedNameMap;
    }

    getAllDefinedNamesIsEmpty(): boolean {
        return this._definedNamesIsEmpty;
    }

    getDefinedNameByRefString(unitId: string, formulaOrRefString: string) {
        if (!this._definedNameMap[unitId]) return;

        for (const [_, item] of Object.entries(this._definedNameMap[unitId])) {
            if (item.formulaOrRefString === formulaOrRefString) {
                return item;
            }
        }
    }

    private _update(event: IDefinedNamesUpdateEvent) {
        this._update$.next(event);
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
            const normalizedName = item.name.toLowerCase();
            if (item.localSheetId === 'AllDefaultWorkbook' || item.localSheetId == null || this._nameCacheMap[unitId][normalizedName] == null) {
                this._nameCacheMap[unitId][normalizedName] = item;
            }
        }
    }

    private _isDeepDefinedNameMapEmpty(): boolean {
        for (const unitId in this._definedNameMap) {
            if (this.hasDefinedName(unitId)) {
                return false;
            }
        }
        return true;
    }
}

export const IDefinedNamesService = createIdentifier<IDefinedNamesService>('univer.formula.defined-names.service');
