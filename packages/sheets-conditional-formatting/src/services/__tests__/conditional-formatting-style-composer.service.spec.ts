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

import type { ICellData } from '@univerjs/core';
import { BooleanNumber, CellValueType } from '@univerjs/core';
import {
    ErrorType,
    OtherFormulaMarkDirty,
    SetFormulaCalculationResultMutation,
    SetOtherFormulaMutation,
} from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IConditionalFormattingRuleConfig, IConditionFormattingRule, INumberHighlightCell } from '../../models/type';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFValueType } from '../../base/const';
import { AddConditionalRuleMutation } from '../../commands/mutations/add-conditional-rule.mutation';
import { MoveConditionalRuleMutation } from '../../commands/mutations/move-conditional-rule.mutation';
import { SetConditionalRuleMutation } from '../../commands/mutations/set-conditional-rule.mutation';
import { createTestBed } from '../../models/calculate-unit-v2/__tests__/test.util';
import { IIconSetType } from '../../models/icon-map';
import { ConditionalFormattingFormulaService } from '../conditional-formatting-formula.service';
import { ConditionalFormattingStyleComposer } from '../conditional-formatting-style-composer.service';

const RANGES = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }];

const createHighlightConfig = (style: INumberHighlightCell['style'] = {}, value = 0): INumberHighlightCell => ({
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.number,
    operator: CFNumberOperator.greaterThan,
    value,
    style,
});

const COLOR_SCALE: IConditionalFormattingRuleConfig = {
    type: CFRuleType.colorScale,
    config: [
        { index: 0, color: '#ffeeaa', value: { type: CFValueType.num, value: 0 } },
        { index: 1, color: '#ffeeaa', value: { type: CFValueType.num, value: 10 } },
    ],
};
const DATA_BAR: IConditionalFormattingRuleConfig = {
    type: CFRuleType.dataBar,
    isShowValue: false,
    config: {
        min: { type: CFValueType.num, value: 0 },
        max: { type: CFValueType.num, value: 10 },
        isGradient: false,
        positiveColor: '#38bdf8',
        nativeColor: '#ff0000',
    },
};
const ICON_SET: IConditionalFormattingRuleConfig = {
    type: CFRuleType.iconSet,
    isShowValue: false,
    config: [{
        operator: CFNumberOperator.greaterThanOrEqual,
        value: { type: CFValueType.num, value: 0 },
        iconType: IIconSetType.threeArrows,
        iconId: '0',
    }],
};

// Exercise the calculation, viewport cache, and composer together so empty styles cannot hide a match.
describe('ConditionalFormattingStyleComposer', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let service: ConditionalFormattingStyleComposer;

    beforeEach(() => {
        vi.useFakeTimers();
        testBed = createTestBed();
        testBed.getConditionalFormattingService();
        service = testBed.get(ConditionalFormattingStyleComposer);
    });

    afterEach(() => {
        testBed.univer.dispose();
        vi.useRealTimers();
    });

    const addRule = (cfId: string, rule: IConditionalFormattingRuleConfig, stopIfTrue = false) => {
        const wrapper: IConditionFormattingRule = { cfId, ranges: RANGES, rule, stopIfTrue };
        testBed.commandService.syncExecuteCommand(AddConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: wrapper,
        });
        return wrapper;
    };

    const compose = () => service.composeStyle(testBed.unitId, testBed.subUnitId, 0, 1);

    it('merges matched conditional styles in rule priority order', () => {
        addRule('highlight', createHighlightConfig({ cl: { rgb: '#333333' }, bg: { rgb: '#ff0000' } }));
        addRule('color-scale', COLOR_SCALE);

        expect(compose()).toEqual({
            style: { cl: { rgb: '#333333' }, bg: { rgb: 'rgb(255,238,170)' } },
        });
    });

    it('composes highlight, data bar, and icon set rules on the same cell', () => {
        addRule('highlight', createHighlightConfig({ bg: { rgb: '#fff7cc' } }));
        addRule('data-bar', DATA_BAR);
        addRule('icon-set', ICON_SET);

        expect(compose()).toEqual({
            style: { bg: { rgb: '#fff7cc' } },
            dataBar: {
                color: '#38bdf8',
                isGradient: false,
                isShowValue: false,
                startPoint: 0,
                value: expect.closeTo(20),
            },
            iconSet: { iconId: '0', iconType: IIconSetType.threeArrows, isShowValue: false },
            isShowValue: false,
        });
    });

    it.each([
        createHighlightConfig({ bg: { rgb: '#ff0000' } }),
        COLOR_SCALE,
        DATA_BAR,
        ICON_SET,
    ])('suppresses lower-priority $type after an empty-style stop rule matches', async (config) => {
        addRule('lower', config);
        expect(compose()).not.toEqual({ style: {} });
        addRule('stop', createHighlightConfig(), true);
        addRule('higher', createHighlightConfig({ cl: { rgb: '#333333' } }));
        await vi.advanceTimersByTimeAsync(100);

        expect(compose()).toEqual({ style: { cl: { rgb: '#333333' } } });
        expect(testBed.getConditionalFormattingViewModel().getCellCfs(testBed.unitId, testBed.subUnitId, 0, 1))
            .toContainEqual(expect.objectContaining({ cfId: 'stop', result: {}, matched: true }));
    });

    it.each([
        { value: 100, stopIfTrue: true },
        { value: 0, stopIfTrue: false },
    ])('continues after an empty-style rule with threshold $value and stopIfTrue=$stopIfTrue', ({ value, stopIfTrue }) => {
        addRule('lower', createHighlightConfig({ bg: { rgb: '#00ff00' } }));
        addRule('stop', createHighlightConfig({}, value), stopIfTrue);

        expect(compose()).toEqual({ style: { bg: { rgb: '#00ff00' } } });
    });

    it('stops lower-priority rules after a nonempty-style rule matches', () => {
        addRule('lower', createHighlightConfig({ cl: { rgb: '#333333' } }));
        addRule('stop', createHighlightConfig({ bg: { rgb: '#ff0000' } }), true);

        expect(compose()).toEqual({ style: { bg: { rgb: '#ff0000' } } });
    });

    it('refreshes the stop state after changing cell values and rule order', async () => {
        testBed.commandService.registerCommand(SetRangeValuesMutation);
        addRule('lower', createHighlightConfig({ bg: { rgb: '#00ff00' } }));
        addRule('stop', createHighlightConfig({}, 1), true);
        expect(compose()).toEqual({ style: {} });

        testBed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            cellValue: { 0: { 1: { v: 1, t: CellValueType.NUMBER } } },
        });
        await vi.advanceTimersByTimeAsync(100);
        expect(compose()).toEqual({ style: { bg: { rgb: '#00ff00' } } });
        expect(testBed.getConditionalFormattingViewModel().getCellCfs(testBed.unitId, testBed.subUnitId, 0, 1))
            .toContainEqual(expect.objectContaining({ cfId: 'stop', result: {}, matched: false }));

        testBed.commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            cellValue: { 0: { 1: { v: 2, t: CellValueType.NUMBER } } },
        });
        await vi.advanceTimersByTimeAsync(100);
        expect(compose()).toEqual({ style: {} });

        testBed.commandService.syncExecuteCommand(MoveConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            start: { id: 'lower', type: 'self' },
            end: { id: 'stop', type: 'before' },
        });
        await vi.advanceTimersByTimeAsync(100);
        expect(compose()).toEqual({ style: { bg: { rgb: '#00ff00' } } });
    });

    it('reuses composed results and invalidates them after editing stopIfTrue', async () => {
        addRule('lower', createHighlightConfig({ bg: { rgb: '#00ff00' } }));
        const stop = addRule('stop', createHighlightConfig(), true);
        const first = compose();
        expect(compose()).toBe(first);
        expect(first).toEqual({ style: {} });

        testBed.commandService.syncExecuteCommand(SetConditionalRuleMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: { ...stop, stopIfTrue: false },
        });
        await vi.advanceTimersByTimeAsync(100);
        expect(compose()).toEqual({ style: { bg: { rgb: '#00ff00' } } });
    });

    it('updates an empty-style formula stop rule when asynchronous results arrive', () => {
        testBed.commandService.registerCommand(SetFormulaCalculationResultMutation);
        testBed.commandService.registerCommand(SetOtherFormulaMutation);
        testBed.commandService.registerCommand(OtherFormulaMarkDirty);
        addRule('lower', createHighlightConfig({ bg: { rgb: '#00ff00' } }));
        addRule('stop', {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.formula,
            value: '=A1>0',
            style: {},
        }, true);
        expect(compose()).toEqual({ style: { bg: { rgb: '#00ff00' } } });
        expect(testBed.getConditionalFormattingViewModel().getCellCfs(testBed.unitId, testBed.subUnitId, 0, 1))
            .toContainEqual(expect.objectContaining({ cfId: 'stop', result: undefined, matched: false }));

        const formula = testBed.get(ConditionalFormattingFormulaService)
            .getSubUnitFormulaMap(testBed.unitId, testBed.subUnitId)
            ?.getValues()[0];
        expect(formula).toBeDefined();
        const results: Array<{ cell: ICellData; stopped: boolean }> = [
            { cell: { t: CellValueType.BOOLEAN, v: BooleanNumber.TRUE }, stopped: true },
            { cell: { t: CellValueType.BOOLEAN, v: BooleanNumber.FALSE }, stopped: false },
            { cell: { t: CellValueType.NUMBER, v: 1 }, stopped: true },
            { cell: { t: CellValueType.STRING, v: ErrorType.DIV_BY_ZERO }, stopped: false },
        ];
        for (const { cell, stopped } of results) {
            testBed.commandService.syncExecuteCommand(SetFormulaCalculationResultMutation.id, {
                unitData: {},
                unitOtherData: {
                    [testBed.unitId]: { [testBed.subUnitId]: { [formula!.formulaId]: { 0: { 1: [[cell]] } } } },
                },
            });
            expect(compose()).toEqual(stopped ? { style: {} } : { style: { bg: { rgb: '#00ff00' } } });
        }
    });
});
