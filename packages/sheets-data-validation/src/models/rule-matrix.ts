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

import type { IRange, ISheetDataValidationRule, IUniverInstanceService, Workbook } from '@univerjs/core';
import IntervalTree from '@flatten-js/interval-tree';
import { debounce, Range, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';

interface IRuleItem {
    ruleId: string;
    startRow: number;
    endRow: number;
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
    private _map: Map<string, IRange[]>;
    private _tree = new Map<number, IntervalTree<string>>();
    private _dirty = true;

    constructor(
        value: Map<string, IRange[]>,
        private _unitId: string,
        private _subUnitId: string,
        private _univerInstanceService: IUniverInstanceService,
        private _disableTree = false
    ) {
        this._map = value;
        this._buildTree();
    }

    private _buildTree = () => {
        if (!this._dirty || this._disableTree) {
            return;
        }
        const map = new Map<number, IRuleItem[]>();
        this._map.forEach((ranges, ruleId) => {
            ranges.forEach((range) => {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    let items = map.get(col);
                    if (!items) {
                        items = [];
                        map.set(col, items);
                    }
                    items.push({
                        startRow: range.startRow,
                        endRow: range.endRow,
                        ruleId,
                    });
                }
            });
        });
        const treeMap = new Map<number, IntervalTree<string>>();
        map.forEach((items, col) => {
            const tree = new IntervalTree<string>();
            items.forEach((item) => {
                tree.insert([item.startRow, item.endRow], item.ruleId);
            });

            treeMap.set(col, tree);
        });
        this._tree = treeMap;
        this._dirty = false;
    };

    private _debonceBuildTree = debounce(this._buildTree, 0);

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
            this._univerInstanceService,
            // disable tree on cloned matrix, cause there is no need to search
            true
        );
    }

    getValue(row: number, col: number): string | undefined {
        if (this._dirty) {
            this._buildTree();
        }
        const tree = this._tree.get(col);
        if (!tree) {
            return undefined;
        }
        const result = tree.search([row, row]);
        return result.length > 0 ? result[0] : undefined;
    }
}
