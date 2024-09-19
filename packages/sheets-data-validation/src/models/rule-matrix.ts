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

import { Range, Rectangle, Tools } from '@univerjs/core';
import type { IRange, ISheetDataValidationRule, Worksheet } from '@univerjs/core';

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
    private _map = new Map<string, IRange[]>();

    constructor(
        value: Map<string, IRange[]>,
        private _worksheet: Worksheet
    ) {
        this._map = value;
    }

    addRule(rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        const ranges = rule.ranges.map((range) => Range.transformRange(range, this._worksheet));

        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });

        this._map.set(ruleId, ranges);
    }

    removeRange(_ranges: IRange[]) {
        const ranges = _ranges.map((range) => Range.transformRange(range, this._worksheet));
        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });
    }

    removeRule(rule: ISheetDataValidationRule) {
        this._map.delete(rule.uid);
    }

    updateRange(ruleId: string, _oldRanges: IRange[], _newRanges: IRange[]) {
        this._map.delete(ruleId);
        const ranges = _newRanges.map((range) => Range.transformRange(range, this._worksheet));
        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });

        this._map.set(ruleId, _newRanges);
    }

    diff(rules: ISheetDataValidationRule[]) {
        const mutations: RangeMutation[] = [];
        let deleteIndex = 0;
        rules.forEach((rule, index) => {
            const newRanges = this._map.get(rule.uid) ?? [];
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
            const newRanges = this._map.get(rule.uid) ?? [];
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
            const newRanges = this._map.get(rule.uid) ?? [];
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
        return new RuleMatrix(new Map(Tools.deepClone(Array.from(this._map.entries()))), this._worksheet);
    }

    getValue(row: number, col: number) {
        const keys = Array.from(this._map.keys());
        for (const id of keys) {
            const ranges = this._map.get(id) ?? [];
            if (ranges.find((range) => range.startRow <= row && range.endRow >= row && range.startColumn <= col && range.endColumn >= col)) {
                return id;
            }
        }
    }

    addRangeRules(rules: { id: string;ranges: IRange[] }[]) {
        rules.forEach(({ id: ruleId, ranges }) => {
            if (!ranges.length) {
                return;
            }

            let current = this._map.get(ruleId);
            if (!current) {
                current = ranges;
                this._map.set(ruleId, current);
            } else {
                this._map.set(ruleId, Rectangle.mergeRanges([...current, ...ranges]));
                current = this._map.get(ruleId)!;
            }

            this._map.forEach((value, key) => {
                if (key === ruleId) {
                    return;
                }
                const newRanges = Rectangle.subtractMulti(value, ranges);
                if (newRanges.length === 0) {
                    this._map.delete(key);
                } else {
                    this._map.set(key, newRanges);
                }
            });
        });
    }
}
