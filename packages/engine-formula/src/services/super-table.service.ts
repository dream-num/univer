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

import type { Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { ISuperTable } from '../basics/common';

import { createIdentifier, Disposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { TableOptionType } from '../basics/common';

export interface ISuperTableOptionParam {
    tableOption: string;
    tableOptionType: TableOptionType;
}

export interface ISuperTableService {
    getTableMap(unitId: string): Nullable<Map<string, ISuperTable>>;

    getTableOptionMap(): Map<string, TableOptionType>;

    registerTable(unitId: string, tableName: string, reference: ISuperTable): void;

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType): void;

    remove(unitId: string, tableName: string): void;

    update$: Observable<unknown>;
}

export class SuperTableService extends Disposable implements ISuperTableService {
    // 18.5.1.2 table (Table)
    private _tableMap: Map<string, Map<string, ISuperTable>> = new Map();

    // 18.5.1.2 table (Table) for I18N
    private _tableOptionMap: Map<string, TableOptionType> = new Map();

    private readonly _update$ = new Subject();
    readonly update$ = this._update$.asObservable();

    constructor() {
        super();
        this.registerTableOptionMap(TableOptionType.ALL, TableOptionType.ALL);
        this.registerTableOptionMap(TableOptionType.DATA, TableOptionType.DATA);
        this.registerTableOptionMap(TableOptionType.HEADERS, TableOptionType.HEADERS);
        this.registerTableOptionMap(TableOptionType.TOTALS, TableOptionType.TOTALS);
        this.registerTableOptionMap(TableOptionType.THIS_ROW, TableOptionType.THIS_ROW);
    }

    override dispose(): void {
        super.dispose();
        this._update$.complete();
        this._tableMap.clear();
        this._tableOptionMap.clear();
    }

    remove(unitId: string, tableName: string) {
        this._tableMap.get(unitId)?.delete(tableName);
        this._update();
    }

    getTableMap(unitId: string) {
        return this._tableMap.get(unitId);
    }

    getTableOptionMap() {
        return this._tableOptionMap;
    }

    registerTable(unitId: string, tableName: string, reference: ISuperTable) {
        if (this._tableMap.get(unitId) == null) {
            this._tableMap.set(unitId, new Map());
        }
        this._tableMap.get(unitId)?.set(tableName, reference);
        this._update();
    }

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType) {
        this._tableOptionMap.set(tableOption, tableOptionType);
    }

    private _update() {
        this._update$.next(null);
    }
}

export const ISuperTableService = createIdentifier<ISuperTableService>('univer.formula.super-table.service');
