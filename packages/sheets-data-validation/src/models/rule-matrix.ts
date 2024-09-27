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

import { debounce, Range, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import RBush from 'rbush';
import type { IRange, ISheetDataValidationRule, IUniverInstanceService, Workbook } from '@univerjs/core';

interface IRuleItem extends RBush.BBox {
    ruleId: string;
}

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
    private _tree = new RBush<IRuleItem>(2);
    private _dirty = false;

    constructor(
        value: Map<string, IRange[]>,
        private _unitId: string,
        private _subUnitId: string,
        private _univerInstanceService: IUniverInstanceService
    ) {
        this._map = value;
        this._buildTree();
    }

    private _buildTree = () => {
        const items: IRuleItem[] = [];
        this._map.forEach((ranges, ruleId) => {
            ranges.forEach((range) => {
                items.push({
                    minX: range.startColumn,
                    minY: range.startRow,
                    maxX: range.endColumn,
                    maxY: range.endRow,
                    ruleId,
                });
            });
        });
        this._tree.clear();
        this._tree.load(items);
        this._dirty = false;
    };

    private _debonceBuildTree = debounce(this._buildTree, 100);

    get _worksheet() {
        return this._univerInstanceService.getUnit<Workbook>(this._unitId, UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(this._subUnitId);
    }

    addRule(rule: ISheetDataValidationRule) {
        if (!this._worksheet) {
            return;
        }

        const ruleId = rule.uid;
        const ranges = rule.ranges.map((range) => Range.transformRange(range, this._worksheet!));

        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });

        this._dirty = true;
        this._map.set(ruleId, ranges);
        this._debonceBuildTree();
    }

    removeRange(_ranges: IRange[]) {
        if (!this._worksheet) {
            return;
        }
        const ranges = _ranges.map((range) => Range.transformRange(range, this._worksheet!));
        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });
        this._dirty = true;
        this._debonceBuildTree();
    }

    removeRule(rule: ISheetDataValidationRule) {
        this._map.delete(rule.uid);
        this._dirty = true;
        this._debonceBuildTree();
    }

    updateRange(ruleId: string, _newRanges: IRange[]) {
        if (!this._worksheet) {
            return;
        }
        this._map.delete(ruleId);
        const ranges = _newRanges.map((range) => Range.transformRange(range, this._worksheet!));

        this._map.forEach((value, key) => {
            const newRanges = Rectangle.subtractMulti(value, ranges);
            if (newRanges.length === 0) {
                this._map.delete(key);
            } else {
                this._map.set(key, newRanges);
            }
        });
        this._map.set(ruleId, ranges);
        this._dirty = true;
        this._debonceBuildTree();
    }

    diff(rules: ISheetDataValidationRule[]) {
        const mutations: RangeMutation[] = [];
        let deleteIndex = 0;
        rules.forEach((rule, index) => {
            const newRanges = this._map.get(rule.uid) ?? [];
            const oldRanges = rule.ranges;

            if (newRanges.length !== 0 && (newRanges.length !== oldRanges.length || newRanges.some((range, i) => !Rectangle.equals(range, oldRanges[i])))) {
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

            if (newRanges.length !== 0 && (newRanges.length !== oldRanges.length || newRanges.some((range, i) => !Rectangle.equals(range, oldRanges[i])))) {
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
        return new RuleMatrix(
            new Map(Tools.deepClone(Array.from(this._map.entries()))),
            this._unitId,
            this._subUnitId,
            this._univerInstanceService
        );
    }

    getValue(row: number, col: number) {
        if (this._dirty) {
            this._buildTree();
        }
        const result = this._tree.search({
            minX: col,
            minY: row,
            maxX: col,
            maxY: row,
        });
        return result.length > 0 ? result[0].ruleId : undefined;
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
