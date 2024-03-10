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
import { DataValidatorRegistryService, UpdateRuleType } from '@univerjs/data-validation';
import { DataValidationStatus } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import type { IDataValidationResCache } from '../services/dv-cache.service';
import { DataValidationCacheService } from '../services/dv-cache.service';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';

export type RangeMutation = {
    type: 'update';
    ruleId: string;
    oldRanges: IRange[];
    newRanges: IRange[];
} | {
    type: 'delete';
    rule: ISheetDataValidationRule;
    index: number;
};

const isRangeEqual = (range1: IRange, range2: IRange) => {
    return range1.startColumn === range2.startColumn
            && range1.endColumn === range2.endColumn
            && range1.startRow === range2.startRow
            && range1.endRow === range2.endRow;
};

export class RuleMatrix {
    readonly value: ObjectMatrix<string>;

    constructor(value: ObjectMatrix<string>) {
        this.value = value;
    }

    addRule(rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this.value.setValue(row, col, ruleId);
            });
        });
    }

    removeRange(ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this.value.realDeleteValue(row, col);
            });
        });
    }

    removeRule(rule: ISheetDataValidationRule) {
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this.value.setValue(row, col, '');
            });
        });
    }

    updateRange(ruleId: string, oldRanges: IRange[], newRanges: IRange[]) {
        const tempRuleId = `${ruleId}$`;
        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this.value.setValue(row, col, tempRuleId);
            });
        });

        newRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this.value.setValue(row, col, ruleId);
            });
        });

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const value = this.value.getValue(row, col);
                if (value === tempRuleId) {
                    this.value.realDeleteValue(row, col);
                }
            });
        });
    }

    diff(rules: ISheetDataValidationRule[]) {
        const mutations: RangeMutation[] = [];
        let deleteIndex = 0;
        rules.forEach((rule, index) => {
            const newRanges = queryObjectMatrix(this.value, (ruleId) => ruleId === rule.uid);
            const oldRanges = rule.ranges;

            if (newRanges.length !== oldRanges.length || newRanges.some((range, i) => !isRangeEqual(range, oldRanges[i]))) {
                mutations.push({
                    type: 'update',
                    ruleId: rule.uid,
                    oldRanges,
                    newRanges,
                });
            }

            if (newRanges.length === 0) {
                mutations.push({
                    type: 'delete',
                    rule,
                    index: index - deleteIndex,
                });
                deleteIndex++;
            }
        });

        return mutations;
    }

    clone() {
        return new RuleMatrix(new ObjectMatrix(this.value.clone()));
    }

    getValue(row: number, col: number) {
        return this.value.getValue(row, col);
    }
}

export class SheetDataValidationManager extends DataValidationManager<ISheetDataValidationRule> {
    /**
     * save cell's ruleId
     */
    private _ruleMatrix: RuleMatrix;
    private _dataValidatorRegistryService: DataValidatorRegistryService;
    private _dataValidationCacheService: DataValidationCacheService;
    private _dataValidationFormulaService: DataValidationFormulaService;
    private _dataValidationCustomFormulaService: DataValidationCustomFormulaService;
    private _cache: ObjectMatrix<Nullable<IDataValidationResCache>>;

    constructor(
        unitId: string,
        subUnitId: string,
        rules: ISheetDataValidationRule[] | undefined,
        private readonly _injector: Injector
    ) {
        super(unitId, subUnitId, rules);
        this._dataValidatorRegistryService = this._injector.get(DataValidatorRegistryService);
        this._dataValidationCacheService = this._injector.get(DataValidationCacheService);
        this._dataValidationFormulaService = this._injector.get(DataValidationFormulaService);
        this._dataValidationCustomFormulaService = this._injector.get(DataValidationCustomFormulaService);

        this._cache = this._dataValidationCacheService.ensureCache(unitId, subUnitId);

        const matrix = new ObjectMatrix<string>();
        rules?.forEach((rule) => {
            const ruleId = rule.uid;
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    matrix.setValue(row, col, ruleId);
                });
            });
        });
        this._ruleMatrix = new RuleMatrix(matrix);
    }

    override addRule(rule: ISheetDataValidationRule): void {
        this._ruleMatrix.addRule(rule);
        this._dataValidationCacheService.addRule(this.unitId, this.subUnitId, rule);
        this._dataValidationFormulaService.addRule(this.unitId, this.subUnitId, rule.uid, rule.formula1, rule.formula2);
        this._dataValidationCustomFormulaService.addRule(this.unitId, this.subUnitId, rule);
        super.addRule(rule);
    }

    override updateRule(ruleId: string, payload: IUpdateRulePayload) {
        const oldRule = this.getRuleById(ruleId);
        const rule = super.updateRule(ruleId, payload);
        if (!oldRule) {
            throw new Error(`Rule not found! id: ${ruleId}`);
        }

        if (payload.type === UpdateRuleType.RANGE) {
            this._ruleMatrix.updateRange(ruleId, oldRule.ranges, payload.payload);
            this._dataValidationCacheService.updateRuleRanges(this.unitId, this.subUnitId, ruleId, payload.payload, oldRule.ranges);
            this._dataValidationCustomFormulaService.updateRuleRanges(this.unitId, this.subUnitId, ruleId, oldRule.ranges, payload.payload);
        } else {
            this._dataValidationCacheService.markRangeDirty(this.unitId, this.subUnitId, oldRule.ranges);
            if (payload.type === UpdateRuleType.SETTING) {
                this._dataValidationFormulaService.updateRuleFormulaText(this.unitId, this.subUnitId, ruleId, payload.payload.formula1, payload.payload.formula2);
                this._dataValidationCustomFormulaService.updateRuleFormula(this.unitId, this.subUnitId, ruleId, oldRule.ranges, payload.payload.formula1!);
            }
        }
        return rule;
    }

    override removeRule(ruleId: string): void {
        const oldRule = this.getRuleById(ruleId);
        if (oldRule) {
            this._ruleMatrix.removeRule(oldRule);
            this._dataValidationCacheService.removeRule(this.unitId, this.subUnitId, oldRule);
        }
        super.removeRule(ruleId);
    }

    getRuleIdByLocation(row: number, col: number) {
        return this._ruleMatrix.getValue(row, col);
    }

    override validator(cellValue: Nullable<CellValue>, rule: ISheetDataValidationRule, pos: ISheetLocation, onCompete: (status: DataValidationStatus) => void): DataValidationStatus {
        const { col, row } = pos;
        const ruleId = rule.uid;
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (validator) {
            const current = this._cache.getValue(row, col);
            if (!current || current.value !== cellValue) {
                this._cache.setValue(row, col, {
                    value: cellValue,
                    status: DataValidationStatus.VALIDATING,
                    ruleId,
                });
                validator.validator(cellValue, { rule, unitId: this.unitId, subUnitId: this.subUnitId }).then((status) => {
                    const realStatus = status ? DataValidationStatus.VALID : DataValidationStatus.INVALID;
                    this._cache.setValue(row, col, {
                        value: cellValue,
                        status: realStatus,
                        ruleId,
                    });
                    onCompete(realStatus);
                });
                return DataValidationStatus.VALIDATING;
            }
            return current.status;
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

    getRuleObjectMatrix() {
        return this._ruleMatrix;
    }
}
