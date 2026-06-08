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

import type { IConditionFormattingRule } from '../type';
import { describe, expect, it } from 'vitest';
import { CFRuleType, CFSubRuleType, CFTextOperator } from '../../base/const';
import { ConditionalFormattingRangeIndexModel } from '../conditional-formatting-range-index-model';
import { ConditionalFormattingRuleModel } from '../conditional-formatting-rule-model';

function createRule(cfId: string, startRow: number, endRow: number, startColumn: number, endColumn: number): IConditionFormattingRule {
    return {
        cfId,
        ranges: [{ startRow, endRow, startColumn, endColumn }],
        stopIfTrue: false,
        rule: {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.containsText,
            value: 'x',
            style: { bg: { rgb: '#fff' } },
        },
    };
}

describe('ConditionalFormattingRangeIndexModel', () => {
    it('queries rule ids by cell and range through rule model changes', () => {
        const ruleModel = new ConditionalFormattingRuleModel();
        const rangeIndex = new ConditionalFormattingRangeIndexModel(ruleModel);
        const unitId = 'unit';
        const subUnitId = 'sheet';

        ruleModel.addRule(unitId, subUnitId, createRule('a', 0, 2, 0, 2));
        ruleModel.addRule(unitId, subUnitId, createRule('b', 10, 12, 10, 12));

        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 1, 1)).toEqual(new Set(['a']));
        expect(rangeIndex.getRuleIdsByRanges(unitId, subUnitId, [{
            startRow: 1,
            endRow: 11,
            startColumn: 1,
            endColumn: 11,
        }])).toEqual(new Set(['a', 'b']));

        ruleModel.setRule(unitId, subUnitId, createRule('a', 20, 21, 20, 21), 'a');

        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 1, 1)).toEqual(new Set());
        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 20, 20)).toEqual(new Set(['a']));

        ruleModel.deleteRule(unitId, subUnitId, 'a');

        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 20, 20)).toEqual(new Set());

        rangeIndex.dispose();
    });

    it('indexes rules that already exist before construction', () => {
        const ruleModel = new ConditionalFormattingRuleModel();
        const unitId = 'unit';
        const subUnitId = 'sheet';

        ruleModel.addRule(unitId, subUnitId, createRule('a', 0, 2, 0, 2));

        const rangeIndex = new ConditionalFormattingRangeIndexModel(ruleModel);

        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 1, 1)).toEqual(new Set(['a']));

        rangeIndex.dispose();
    });

    it('can rebuild after unit rules are removed without rule change events', () => {
        const ruleModel = new ConditionalFormattingRuleModel();
        const rangeIndex = new ConditionalFormattingRangeIndexModel(ruleModel);
        const unitId = 'unit';
        const subUnitId = 'sheet';

        ruleModel.addRule(unitId, subUnitId, createRule('a', 0, 2, 0, 2));
        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 1, 1)).toEqual(new Set(['a']));

        ruleModel.deleteUnitId(unitId);
        rangeIndex.rebuild();

        expect(rangeIndex.getRuleIdsByCell(unitId, subUnitId, 1, 1)).toEqual(new Set());

        rangeIndex.dispose();
    });
});
