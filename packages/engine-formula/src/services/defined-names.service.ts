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

import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { serializeRange, serializeRangeToRefString, serializeRangeWithSheet } from '../engine/utils/reference';

export interface IDefinedNamesServiceParam {
    name: string;
    formulaOrRefString: string;
    comment?: string;
    localSheetId?: string;
    hidden?: boolean;

}

export interface IDefinedNamesService {
    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam): void;

    getDefinedNameMap(unitId: string): Nullable<Map<string, IDefinedNamesServiceParam>>;

    getValue(unitId: string, name: string): Nullable<IDefinedNamesServiceParam>;

    removeDefinedName(unitId: string, name: string): void;

    hasDefinedName(unitId: string): boolean;

    setCurrentRange(range: IUnitRange): void;

    getCurrentRange(): IUnitRange;

    getCurrentRangeForString(): string;

    currentRange$: Observable<IUnitRange>;
}

export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, Map<string, IDefinedNamesServiceParam>> = new Map();

    private _currentRange: IUnitRange = { unitId: '', sheetId: '', range: {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 0,
    } };

    private readonly _currentRange$ = new Subject<IUnitRange>();
    readonly currentRange$ = this._currentRange$.asObservable();

    override dispose(): void {
        this._definedNameMap.clear();
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

    registerDefinedName(unitId: string, param: IDefinedNamesServiceParam) {
        const unitMap = this._definedNameMap.get(unitId);

        if (unitMap == null) {
            this._definedNameMap.set(unitId, new Map());
        }

        this._definedNameMap.get(unitId)?.set(param.name, param);
    }

    removeDefinedName(unitId: string, name: string) {
        this._definedNameMap.get(unitId)?.delete(name);
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap.get(unitId);
    }

    getValue(unitId: string, name: string) {
        return this._definedNameMap.get(unitId)?.get(name);
    }

    hasDefinedName(unitId: string) {
        const size = this._definedNameMap.get(unitId)?.size || 0;
        return size !== 0;
    }
}

export const IDefinedNamesService = createIdentifier<DefinedNamesService>('univer.formula.defined-names.service');
