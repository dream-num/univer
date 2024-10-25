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

import type { ISuperTable, TableOptionType } from '../basics/common';

import { Disposable } from '@univerjs/core';

export interface ISuperTableOptionParam {
    tableOption: string;
    tableOptionType: TableOptionType;
}

export class SuperTableService extends Disposable {
    // 18.5.1.2 table (Table)
    private _tableMap: Map<string, Map<string, ISuperTable>> = new Map();

    // 18.5.1.2 table (Table) for I18N
    private _tableOptionMap: Map<string, TableOptionType> = new Map();

    override dispose(): void {
        this._tableMap.clear();

        this._tableOptionMap.clear();
    }

    remove(unitId: string, tableName: string) {
        this._tableMap.get(unitId)?.delete(tableName);
    }

    getTableMap(unitId: string) {
        return this._tableMap.get(unitId);
    }

    registerTable(unitId: string, tableName: string, reference: ISuperTable) {
        if (this._tableMap.get(unitId) == null) {
            this._tableMap.set(unitId, new Map());
        }
        this._tableMap.get(unitId)?.set(tableName, reference);
    }

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType) {
        this._tableOptionMap.set(tableOption, tableOptionType);
    }
}

