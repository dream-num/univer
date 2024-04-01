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

import type { CellValue, ISheetDataValidationRule } from '@univerjs/core/types/interfaces/index.js';
import { DataValidationManager } from '@univerjs/data-validation/models/data-validation-manager.js';
import type { Nullable } from '@univerjs/core/shared/index.js';
import { ObjectMatrix } from '@univerjs/core/shared/index.js';
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
import { DataValidationRefRangeController } from '../controllers/dv-ref-range.controller';
import { RuleMatrix } from './rule-matrix';

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
    private _dataValidationRefRangeController: DataValidationRefRangeController;

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
        this._dataValidationRefRangeController = this._injector.get(DataValidationRefRangeController);
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

        rules?.forEach((rule) => {
            this._dataValidationRefRangeController.register(unitId, subUnitId, rule);
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

        if (!oldRule) {
            throw new Error(`Rule not found! id: ${ruleId}`);
        }

        if (payload.type === UpdateRuleType.RANGE) {
            this._ruleMatrix.updateRange(ruleId, oldRule.ranges, payload.payload);
            this._dataValidationCacheService.updateRuleRanges(this.unitId, this.subUnitId, ruleId, payload.payload, oldRule.ranges);
            this._dataValidationCustomFormulaService.updateRuleRanges(this.unitId, this.subUnitId, ruleId, oldRule.ranges, payload.payload);
        } else if (payload.type === UpdateRuleType.SETTING) {
            this._dataValidationCacheService.markRangeDirty(this.unitId, this.subUnitId, oldRule.ranges);
            this._dataValidationFormulaService.updateRuleFormulaText(this.unitId, this.subUnitId, ruleId, payload.payload.formula1, payload.payload.formula2);
            this._dataValidationCustomFormulaService.updateRuleFormula(this.unitId, this.subUnitId, ruleId, oldRule.ranges, payload.payload.formula1!);
        }

        return super.updateRule(ruleId, payload);
    }

    override removeRule(ruleId: string): void {
        const oldRule = this.getRuleById(ruleId);
        if (oldRule) {
            this._ruleMatrix.removeRule(oldRule);
            this._dataValidationCacheService.removeRule(this.unitId, this.subUnitId, oldRule);
        }
        super.removeRule(ruleId);
    }

    getRuleIdByLocation(row: number, col: number): string | undefined {
        return this._ruleMatrix.getValue(row, col);
    }

    getRuleByLocation(row: number, col: number): ISheetDataValidationRule | undefined {
        const ruleId = this.getRuleIdByLocation(row, col);
        if (!ruleId) {
            return undefined;
        }

        return this.getRuleById(ruleId);
    }

    override validator(cellValue: Nullable<CellValue>, rule: ISheetDataValidationRule, pos: ISheetLocation, onCompete: (status: DataValidationStatus) => void): DataValidationStatus {
        const { col, row, unitId, subUnitId } = pos;
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
                validator.validator({ value: cellValue, unitId, subUnitId, row, column: col }, rule).then((status) => {
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
            return validator.getRuleFinalError(rule);
        }

        return '';
    }

    getRuleObjectMatrix() {
        return this._ruleMatrix;
    }
}
