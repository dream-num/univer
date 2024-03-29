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

import { ObjectMatrix, Range } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IDataBarRenderParams } from '../render/type';
import type { IConditionFormattingRule, IHighlightCell } from './type';

interface ICellItem {
    cfList: { cfId: string; ruleCache?: IHighlightCell['style'] | IDataBarRenderParams ;isDirty: boolean }[];
}

export class ConditionalFormattingViewModel {
   //  Map<unitID ,<sheetId ,ObjectMatrix>>
    private _model: Map<string, Map<string, ObjectMatrix<ICellItem>>> = new Map();

    private _markDirty$ = new Subject<{ rule: IConditionFormattingRule;unitId: string;subUnitId: string }>();
    public markDirty$ = this._markDirty$.asObservable();

    private _ensureMatrix(unitId: string, subUnitId: string) {
        let _matrix = this.getMatrix(unitId, subUnitId);
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

    public getMatrix(unitId: string, subUnitId: string) {
        return this._model.get(unitId)?.get(subUnitId);
    }

    public getCellCf(unitId: string, subUnitId: string, row: number, col: number, matrix?: ObjectMatrix<ICellItem>) {
        const _matrix = matrix ?? this.getMatrix(unitId, subUnitId);
        if (!_matrix) {
            return null;
        }
        const value = _matrix.getValue(row, col);
        return value;
    }

    public setCellCfRuleCache(unitId: string, subUnitId: string, row: number, col: number, cfId: string, value: any) {
        const matrix = this._ensureMatrix(unitId, subUnitId);
        const cell = matrix.getValue(row, col);
        const item = cell?.cfList.find((e) => e.cfId === cfId);
        if (item) {
            item.ruleCache = value;
            item.isDirty = false;
        }
    }

    public deleteCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        cfId: string,
        matrix?: ObjectMatrix<ICellItem>) {
        const _matrix = matrix ?? this.getMatrix(unitId, subUnitId);
        if (_matrix) {
            const cellItem = _matrix.getValue(row, col);
            if (cellItem) {
                const cfList = cellItem.cfList;
                const index = cfList.findIndex((item) => item.cfId === cfId);
                if (index > -1) {
                    cfList.splice(index, 1);
                }
                if (!cfList.length) {
                    _matrix.realDeleteValue(row, col);
                }
            }
        }
    }

    public pushCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        cfId: string
    ) {
        const _matrix = this._ensureMatrix(unitId, subUnitId);
        let cellValue = _matrix.getValue(row, col);
        if (!cellValue) {
            cellValue = { cfList: [{ cfId, isDirty: true }] };
        } else {
            const cfIdList = cellValue.cfList;
            const index = cfIdList.findIndex((item) => item.cfId === cfId);
            if (index > -1) {
                return;
            }
            cfIdList.push({ cfId, isDirty: true });
        }
        _matrix.setValue(row, col, cellValue);
    }

    public sortCellCf(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        cfPriorityMap: Map<string, number>) {
        const cell = this.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const sortResult = cell.cfList.map((cf) => {
                const priority = cfPriorityMap.get(cf.cfId);
                if (priority === undefined) {
                    return null;
                }
                return { ...cf, priority };
            })
                .filter((item) => !!item)
                .sort((a, b) => a!.priority - b!.priority) as ICellItem['cfList'];
                // The smaller the priority, the higher
            cell.cfList = sortResult;
        }
    }

    public markRuleDirty(
        unitId: string,
        subUnitId: string,
        rule: IConditionFormattingRule,
        row?: number,
        col?: number
    ) {
        const handleCell = (row: number, col: number) => {
            const cell = this.getCellCf(unitId, subUnitId, row, col);
            if (cell) {
                const ruleItem = cell.cfList.find((item) => item.cfId === rule.cfId);
                if (ruleItem) {
                    ruleItem.isDirty = true;
                }
            }
        };
        if (row !== undefined && col !== undefined) {
            handleCell(row, col);
            this._markDirty$.next({ rule, unitId, subUnitId });
        } else {
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    handleCell(row, col);
                });
            });
            this._markDirty$.next({ rule, unitId, subUnitId });
        }
    }
}
