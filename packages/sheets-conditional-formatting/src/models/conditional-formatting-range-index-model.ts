/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IRange } from '@univerjs/core';
import { Disposable, Inject, RTree } from '@univerjs/core';
import { ConditionalFormattingRuleModel } from './conditional-formatting-rule-model';

export class ConditionalFormattingRangeIndexModel extends Disposable {
    private _rTreeManager: RTree = new RTree();

    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel
    ) {
        super();

        this.rebuild();
        this._initRuleListener();
    }

    getRuleIdsByCell(unitId: string, subUnitId: string, row: number, col: number) {
        return this.getRuleIdsByRanges(unitId, subUnitId, [{
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        }]);
    }

    getRuleIdsByRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        if (!ranges.length) {
            return new Set<string>();
        }

        const ids = this._rTreeManager.bulkSearch(ranges.map((range) => ({
            unitId,
            sheetId: subUnitId,
            range,
        })));

        return new Set(Array.from(ids).map((id) => String(id)));
    }

    getRulesByRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        const ids = this.getRuleIdsByRanges(unitId, subUnitId, ranges);
        const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) ?? [];
        return ruleList.filter((rule) => ids.has(rule.cfId));
    }

    override dispose(): void {
        this.clear();
        super.dispose();
    }

    clear() {
        this._rTreeManager.clear();
    }

    rebuild() {
        this.clear();
        this._conditionalFormattingRuleModel.getAll().forEach((subUnitMap, unitId) => {
            subUnitMap.forEach((rules, subUnitId) => {
                rules.forEach((rule) => {
                    this._insert(unitId, subUnitId, rule.cfId, rule.ranges);
                });
            });
        });
    }

    private _initRuleListener() {
        this.disposeWithMe(
            this._conditionalFormattingRuleModel.$ruleChange.subscribe((e) => {
                const { unitId, subUnitId, rule } = e;
                const { cfId, ranges } = rule;

                switch (e.type) {
                    case 'add': {
                        this._insert(unitId, subUnitId, cfId, ranges);
                        break;
                    }
                    case 'delete': {
                        this._remove(unitId, subUnitId, cfId, ranges);
                        break;
                    }
                    case 'set': {
                        const oldRule = e.oldRule!;
                        this._remove(unitId, subUnitId, oldRule.cfId, oldRule.ranges);
                        this._insert(unitId, subUnitId, cfId, ranges);
                        break;
                    }
                }
            })
        );
    }

    private _insert(unitId: string, subUnitId: string, cfId: string, ranges: IRange[]) {
        this._rTreeManager.bulkInsert(ranges.map((range) => ({ unitId, sheetId: subUnitId, id: cfId, range })));
    }

    private _remove(unitId: string, subUnitId: string, cfId: string, ranges: IRange[]) {
        this._rTreeManager.bulkRemove(ranges.map((range) => ({ unitId, sheetId: subUnitId, id: cfId, range })));
    }
}
