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

import type { IRange, ISheetDataValidationRule, Worksheet } from '@univerjs/core';
import { ObjectMatrix, queryObjectMatrix, Range, Rectangle } from '@univerjs/core';

export type RangeMutation = {
    type: 'update';
    ruleId: string;
    oldRanges: IRange[];
    newRanges: IRange[];
} | {
    type: 'delete';
    rule: ISheetDataValidationRule;
    index: number;
} | {
    type: 'add';
    rule: ISheetDataValidationRule;
};

export class RuleMatrix {
    readonly value: ObjectMatrix<string>;

    constructor(
        value: ObjectMatrix<string>,
        private _worksheet: Worksheet
    ) {
        this.value = value;
    }

    addRule(rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        rule.ranges.forEach((range) => {
            Range.foreach(
                Range.transformRange(range, this._worksheet),
                (row, col) => {
                    this.value.setValue(row, col, ruleId);
                }
            );
        });
    }

    removeRange(ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(Range.transformRange(range, this._worksheet), (row, col) => {
                this.value.realDeleteValue(row, col);
            });
        });
    }

    removeRule(rule: ISheetDataValidationRule) {
        rule.ranges.forEach((range) => {
            Range.foreach(Range.transformRange(range, this._worksheet), (row, col) => {
                this.value.setValue(row, col, '');
            });
        });
    }

    updateRange(ruleId: string, _oldRanges: IRange[], _newRanges: IRange[]) {
        const tempRuleId = `${ruleId}$`;
        const oldRanges = _oldRanges.map((range) => Range.transformRange(range, this._worksheet));
        const newRanges = _newRanges.map((range) => Range.transformRange(range, this._worksheet));

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (this.value.getValue(row, col) === ruleId) {
                    this.value.setValue(row, col, tempRuleId);
                }
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

            if (newRanges.length !== oldRanges.length || newRanges.some((range, i) => !Rectangle.equals(range, oldRanges[i]))) {
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

    diffWithAddition(rules: ISheetDataValidationRule[], additionRules: IterableIterator<ISheetDataValidationRule>) {
        const mutations: RangeMutation[] = [];
        let deleteIndex = 0;
        rules.forEach((rule, index) => {
            const newRanges = queryObjectMatrix(this.value, (ruleId) => ruleId === rule.uid);
            const oldRanges = rule.ranges;

            if (newRanges.length !== oldRanges.length || newRanges.some((range, i) => !Rectangle.equals(range, oldRanges[i]))) {
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

        Array.from(additionRules).forEach((rule) => {
            const newRanges = queryObjectMatrix(this.value, (ruleId) => ruleId === rule.uid);
            mutations.push({
                type: 'add',
                rule: {
                    ...rule,
                    ranges: newRanges,
                },
            });
        });

        return mutations;
    }

    clone() {
        return new RuleMatrix(new ObjectMatrix(this.value.clone()), this._worksheet);
    }

    getValue(row: number, col: number) {
        return this.value.getValue(row, col);
    }

    setValue(row: number, col: number, value: string) {
        return this.value.setValue(row, col, value);
    }
}
