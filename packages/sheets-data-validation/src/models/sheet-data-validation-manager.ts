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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core/types/interfaces/index.js';
import { DataValidationManager } from '@univerjs/data-validation/models/data-validation-manager.js';
import { ObjectMatrix } from '@univerjs/core/shared/index.js';
import { queryObjectMatrix } from '@univerjs/core/shared/object-matrix-query.js';
import { Range } from '@univerjs/core/sheets/range.js';
import type { IUpdateRulePayload } from '@univerjs/data-validation/types/interfaces/i-update-rule-payload.js';
import { UpdateRuleType } from '@univerjs/data-validation';

export class SheetDataValidationManager extends DataValidationManager<ISheetDataValidationRule> {
    private _ruleMatrix = new ObjectMatrix<string>();

    constructor(rules: ISheetDataValidationRule[]) {
        super(rules);
        rules.forEach((rule) => {
            const ruleId = rule.uid;
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._ruleMatrix.setValue(row, col, ruleId);
                });
            });
        });
    }

    private _resetMatrixRanges(ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._ruleMatrix.setValue(row, col, '');
            });
        });
    }

    private _appendMatrixRule(rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._ruleMatrix.setValue(row, col, ruleId);
            });
        });
    }

    private _updateRuleRanges() {
        const rules = this.getDataValidations();
        rules.forEach((rule) => {
            const newRanges = queryObjectMatrix(this._ruleMatrix, (ruleId) => ruleId === rule.uid);
            rule.ranges = newRanges;
        });
    }

    override addRule(newRule: ISheetDataValidationRule): void {
        this._appendMatrixRule(newRule);
        super.addRule(newRule);
        this._updateRuleRanges();
    }

    override updateRule(ruleId: string, payload: IUpdateRulePayload) {
        const oldRule = this.getRuleById(ruleId);
        const rule = super.updateRule(ruleId, payload);
        if (payload.type === UpdateRuleType.RANGE) {
            if (oldRule) {
                this._resetMatrixRanges(oldRule.ranges);
            }
            this._appendMatrixRule(rule);
        }
        this._updateRuleRanges();
        return rule;
    }

    override removeRule(ruleId: string): void {
        const oldRule = this.getRuleById(ruleId);
        if (oldRule) {
            this._resetMatrixRanges(oldRule.ranges);
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
}
