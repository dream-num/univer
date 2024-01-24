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
import type { IConditionFormatRule } from './type';

interface ICellItem {
    cfList: { cfId: string; ruleCache?: any }[];
    composeCache?: any;
}

export class ConditionalFormatViewModel {
   //  Map<unitID ,<sheetId ,ObjectMatrix>>
    private _model: Map<string, Map<string, ObjectMatrix<ICellItem>>> = new Map();
    private _getMatrix(unitId: string, subUnitId: string) {
        return this._model.get(unitId)?.get(subUnitId);
    }

    private _ensureMatrix(unitId: string, subUnitId: string) {
        let _matrix = this._getMatrix(unitId, subUnitId);
        if (!_matrix) {
            _matrix = new ObjectMatrix<ICellItem>();
            let unitModel = this._model.get(unitId);
            if (!unitModel) {
                unitModel = new Map<string, ObjectMatrix<ICellItem>>();
                this._model.set(unitId, unitModel);
            }
            unitModel.set(subUnitId, _matrix);
        }
        return _matrix;
    }

    getCellCf(unitId: string, subUnitId: string, row: number, col: number, matrix?: ObjectMatrix<ICellItem>) {
        const _matrix = matrix ?? this._getMatrix(unitId, subUnitId);
        if (!_matrix) {
            return null;
        }
        const value = _matrix.getValue(row, col);
        return value;
    }

    deleteCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        cfId: string,
        matrix?: ObjectMatrix<ICellItem>) {
        const _matrix = matrix ?? this._getMatrix(unitId, subUnitId);
        if (_matrix) {
            const cellItem = _matrix.getValue(row, col);
            if (cellItem) {
                const cfList = cellItem.cfList;
                const index = cfList.findIndex((item) => item.cfId === cfId);
                if (index > -1) {
                    cfList.splice(index, 1);
                }
            }
        }
    }

    pushCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        value: IConditionFormatRule
    ) {
        const _matrix = this._ensureMatrix(unitId, subUnitId);
        let cellValue = _matrix.getValue(row, col);
        if (!cellValue) {
            cellValue = { cfList: [{ cfId: value.cfId }] };
        } else {
            const cfIdList = cellValue.cfList;
            const index = cfIdList.findIndex((item) => item.cfId === value.cfId);
            if (index > -1) {
                cfIdList.splice(index, 1);
            }
            cfIdList.push({ cfId: value.cfId });
            this.markComposeDirty(unitId, subUnitId, row, col);
        }
        _matrix.setValue(row, col, cellValue);
        return () => {
            this.deleteCellCf(unitId, subUnitId, row, col, value.cfId, _matrix);
        };
    }

    sortCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        sortList: string[]) {
        const cell = this.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const sortResult = cell.cfList.map((cf) => {
                const priority = sortList.findIndex((item) => item === cf.cfId);
                if (priority === -1) {
                    return null;
                }
                return { ...cf, priority };
            })
                .filter((item) => !!item)
                .sort((a, b) => a!.priority - b!.priority) as ICellItem['cfList'];
                // The smaller the priority, the higher
            const isNeedRestoreComposeCache = sortResult.some((item, index) => {
                return item.cfId !== cell.cfList[index]?.cfId;
            });
            cell.cfList = sortResult;
            if (isNeedRestoreComposeCache) {
                this.markComposeDirty(unitId, subUnitId, row, col);
            }
        }
    }

    markComposeDirty(unitId: string,
        subUnitId: string,
        row: number,
        col: number) {
        const cell = this.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            cell.composeCache = null;
        }
    }

    markRuleDirty(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        cfId?: string
    ) {
        const cell = this.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const rule = cell.cfList.find((item) => item.cfId === cfId);
            if (rule) {
                rule.ruleCache = null;
                this.markComposeDirty(unitId, subUnitId, row, col);
            }
        }
    }
}
