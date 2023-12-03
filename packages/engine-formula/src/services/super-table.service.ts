import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { ISuperTable, TableOptionType } from '../basics/common';

export interface ISuperTableService {
    getTableMap(): Map<string, ISuperTable>;

    getTableOptionMap(): Map<string, TableOptionType>;

    registerTable(tableName: string, reference: ISuperTable): void;

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType): void;
}

export class SuperTableService extends Disposable implements ISuperTableService {
    // 18.5.1.2 table (Table)
    private _tableMap: Map<string, ISuperTable> = new Map();

    // 18.5.1.2 table (Table) for I18N
    private _tableOptionMap: Map<string, TableOptionType> = new Map();

    override dispose(): void {
        this._tableMap.clear();

        this._tableOptionMap.clear();
    }

    getTableMap() {
        return this._tableMap;
    }

    getTableOptionMap() {
        return this._tableOptionMap;
    }

    registerTable(tableName: string, reference: ISuperTable) {
        this._tableMap.set(tableName, reference);
    }

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType) {
        this._tableOptionMap.set(tableOption, tableOptionType);
    }
}

export const ISuperTableService = createIdentifier<ISuperTableService>('univer.formula.super-table.service');
