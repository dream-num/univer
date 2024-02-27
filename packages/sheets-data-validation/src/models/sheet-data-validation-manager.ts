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

import type { CellValue, IRange, ISheetDataValidationRule } from '@univerjs/core/types/interfaces/index.js';
import { DataValidationManager } from '@univerjs/data-validation/models/data-validation-manager.js';
import type { Nullable } from '@univerjs/core/shared/index.js';
import { ObjectMatrix } from '@univerjs/core/shared/index.js';
import { queryObjectMatrix } from '@univerjs/core/shared/object-matrix-query.js';
import { Range } from '@univerjs/core/sheets/range.js';
import type { IUpdateRulePayload } from '@univerjs/data-validation/types/interfaces/i-update-rule-payload.js';
import type { DataValidatorRegistryService } from '@univerjs/data-validation';
import { UpdateRuleType } from '@univerjs/data-validation';
import { DataValidationStatus } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';

// TODO. calc relative cells
// 1. parse formula
// 2. get cell link map
export class SheetDataValidationManager extends DataValidationManager<ISheetDataValidationRule> {
    /**
     * save cell's ruleId
     */
    private _ruleMatrix = new ObjectMatrix<string>();
    /**
     * Save cell's validator result
     */
    private _validatorResult = new ObjectMatrix<Nullable<[Nullable<CellValue>, DataValidationStatus]>>();
    /**
     * Save cell's relative cell, computed from formula
     */
    private _relativeCells = new ObjectMatrix<[number, number][]>();

    constructor(
        unitId: string,
        subUnitId: string,
        rules: ISheetDataValidationRule[],
        private _dataValidatorRegistryService: DataValidatorRegistryService
    ) {
        super(unitId, subUnitId, rules);
        rules.forEach((rule) => {
            const ruleId = rule.uid;
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._ruleMatrix.setValue(row, col, ruleId);
                });
            });
        });
    }

    private _resetMatrixRanges(ranges: IRange[], isDelete = false) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._ruleMatrix.setValue(row, col, '');
            });
        });
        if (isDelete) {
            this.deleteCacheByRanges(ranges);
        } else {
            this.markCacheDirtyByRanges(ranges);
        }
    }

    private _appendMatrixRule(rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._ruleMatrix.setValue(row, col, ruleId);
            });
        });
        this.markCacheDirtyByRanges(rule.ranges);
    }

    private _refreshRuleRanges() {
        const rules = this.getDataValidations();
        rules.forEach((rule) => {
            const newRanges = queryObjectMatrix(this._ruleMatrix, (ruleId) => ruleId === rule.uid);
            rule.ranges = newRanges;
            if (newRanges.length === 0) {
                super.removeRule(rule.uid);
            }
        });
    }

    private _updateRuleRange(ruleId: string, oldRanges: IRange[], newRanges: IRange[]) {
        const tempRuleId = `${ruleId}$`;
        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._ruleMatrix.setValue(row, col, tempRuleId);
            });
        });

        newRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const oldValue = this._ruleMatrix.getValue(row, col);
                this._ruleMatrix.setValue(row, col, ruleId);
                if (oldValue !== tempRuleId) {
                    // add: mark dirty
                    this._validatorResult.setValue(row, col, undefined);
                }
            });
        });

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const value = this._ruleMatrix.getValue(row, col);
                if (value === tempRuleId) {
                    // delete: mark dirty
                    this._validatorResult.setValue(row, col, undefined);
                }
            });
        });
    }

    override addRule(newRule: ISheetDataValidationRule): void {
        this._appendMatrixRule(newRule);
        super.addRule(newRule);
        this._refreshRuleRanges();
    }

    override updateRule(ruleId: string, payload: IUpdateRulePayload) {
        const oldRule = this.getRuleById(ruleId);
        const rule = super.updateRule(ruleId, payload);
        if (payload.type === UpdateRuleType.RANGE) {
            this._updateRuleRange(ruleId, oldRule?.ranges ?? [], payload.payload);
        }
        this._refreshRuleRanges();
        return rule;
    }

    override removeRule(ruleId: string): void {
        const oldRule = this.getRuleById(ruleId);
        if (oldRule) {
            this._resetMatrixRanges(oldRule.ranges, true);
        }
        super.removeRule(ruleId);
    }

    override removeAll(): void {
        super.removeAll();
        this._ruleMatrix = new ObjectMatrix<string>();
    }

    getRuleIdByLocation(row: number, col: number) {
        return this._ruleMatrix.getValue(row, col);
    }

    validatorCell(cellValue: Nullable<CellValue>, rule: ISheetDataValidationRule, pos: ISheetLocation): DataValidationStatus {
        const { col, row } = pos;
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (validator) {
            const current = this._validatorResult.getValue(row, col);
            if (!current || current[0] !== cellValue) {
                this._validatorResult.setValue(row, col, [cellValue, DataValidationStatus.VALIDATING]);
                validator.validator(cellValue, rule).then((status) => {
                    this._validatorResult.setValue(row, col, [
                        cellValue,
                        status ? DataValidationStatus.VALID : DataValidationStatus.INVALID,
                    ]);
                });
                return DataValidationStatus.VALIDATING;
            }
            return current[1];
        } else {
            return DataValidationStatus.VALID;
        }
    }

    getRuleErrorMsg(ruleId: string) {
        const rule = this.getRuleById(ruleId);
        if (!rule) {
            return '';
        }
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (rule.error) {
            return rule.error;
        }

        if (validator) {
            return validator.generateRuleErrorMessage(rule);
        }

        return '';
    }

    markCacheDirtyByRanges(ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._validatorResult.setValue(row, col, undefined);
            });
        });
    }

    deleteCacheByRanges(ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._validatorResult.realDeleteValue(row, col);
            });
        });
    }
}
