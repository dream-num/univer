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

import type { Injector, Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService } from '@univerjs/core/services/command/command.service.js';
import {
    FormulaExecuteStageType,
    RemoveOtherFormulaMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import { SetSelectionsOperation } from '@univerjs/sheets';
import {
    AddCfCommand,
    AddConditionalRuleMutation,
    CFNumberOperator,
    CFTimePeriodOperator,
    CFValueType,
    ClearRangeCfCommand,
    ClearWorksheetCfCommand,
    ConditionalFormattingFormulaService,
    ConditionalFormattingViewModel,
    DeleteCfCommand,
    DeleteConditionalRuleMutation,
    IIconSetType,
    MoveCfCommand,
    MoveConditionalRuleMutation,
    SetCfCommand,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';
import '@univerjs/sheets-formula/facade';

describe('Test conditional formatting facade', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let univer: Univer = null as any;

    beforeEach(() => {
        if (univer) {
            univer.dispose();
        }
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        univer = testBed.univer;

        commandService = get(ICommandService);
        [
            AddCfCommand,
            AddConditionalRuleMutation,
            ClearRangeCfCommand,
            ClearWorksheetCfCommand,
            DeleteCfCommand,
            DeleteConditionalRuleMutation,
            MoveCfCommand,
            MoveConditionalRuleMutation,
            SetConditionalRuleMutation,
            SetCfCommand,
            SetSelectionsOperation,
            RemoveOtherFormulaMutation,
            SetFormulaCalculationStartMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
        ].forEach((m) => {
            commandService.registerCommand(m);
        });

        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);
    });
    it('Gets all the conditional formatting for the current sheet', () => {
        const rules = univerAPI.getActiveWorkbook()?.getActiveSheet().getConditionalFormattingRules();
        expect(rules?.length).toEqual(3);
    });

    it('Gets all the conditional formatting for the current range', () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        workbook?.setActiveRange(worksheet?.getRange(5, 5, 3, 3)!);
        const rules = univerAPI.getActiveWorkbook()?.getActiveRange()?.getConditionalFormattingRules();
        expect(rules?.length).toEqual(2);
    });

    it('Creates a constructor for conditional formatting', () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const range = worksheet?.getRange(0, 0, 2, 2);
        const rule = worksheet?.createConditionalFormattingRule()
            .whenCellNotEmpty()
            .setRanges([range!.getRange()])
            .setBold(true)
            .setItalic(false)
            .setStrikethrough(true)
            .setUnderline(true)
            .setBackground('red')
            .setFontColor('green')
            .setBackground()
            .setFontColor()
            .build();
        expect({ ...rule, cfId: 123 }).toEqual({
            rule: {
                type: 'highlightCell',
                subType: 'text',
                operator: 'notEqual',
                value: '',
                style: {
                    bl: 1,
                    it: 0,
                    st: {
                        s: 1,
                    },
                    ul: {
                        s: 1,
                    },
                },
            },
            ranges: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                    unitId: 'test',
                    sheetId: 'sheet1',
                },
            ],
            cfId: 123,
            stopIfTrue: false,
        });
    });

    it('Builds conditional formatting rules for text, numbers, dates, rank, duplicate values, data bars, color scales, and icon sets', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('A1:B2').getRange();
        const builder = worksheet.newConditionalFormattingRule();

        expect(univerAPI.Enum.ConditionFormatNumberOperatorEnum.greaterThan).toBe(CFNumberOperator.greaterThan);
        expect(univerAPI.Enum.ConditionFormatTimePeriodOperatorEnum.last7Days).toBe(CFTimePeriodOperator.last7Days);
        expect(univerAPI.Enum.ConditionFormatValueTypeEnum.num).toBe(CFValueType.num);
        expect(univerAPI.Enum.ConditionFormatIconSetTypeEnum.threeArrows).toBe(IIconSetType.threeArrows);

        const rules = [
            builder.whenCellEmpty().setRanges([range]).build(),
            builder.whenDate(CFTimePeriodOperator.last7Days).setRanges([range]).build(),
            builder.whenFormulaSatisfied('=$A1>10').setRanges([range]).build(),
            builder.whenNumberBetween(20, 10).setRanges([range]).build(),
            builder.whenNumberEqualTo(10).setRanges([range]).build(),
            builder.whenNumberGreaterThan(10).setRanges([range]).build(),
            builder.whenNumberGreaterThanOrEqualTo(10).setRanges([range]).build(),
            builder.whenNumberLessThan(10).setRanges([range]).build(),
            builder.whenNumberLessThanOrEqualTo(10).setRanges([range]).build(),
            builder.whenNumberNotBetween(20, 10).setRanges([range]).build(),
            builder.whenNumberNotEqualTo(10).setRanges([range]).build(),
            builder.whenTextContains('apple').setRanges([range]).build(),
            builder.whenTextDoesNotContain('apple').setRanges([range]).build(),
            builder.whenTextEndsWith('.ai').setRanges([range]).build(),
            builder.whenTextEqualTo('done').setRanges([range]).build(),
            builder.whenTextStartsWith('https://').setRanges([range]).build(),
            builder.setAverage(CFNumberOperator.greaterThan).setRanges([range]).build(),
            builder.setUniqueValues().setRanges([range]).build(),
            builder.setDuplicateValues().setRanges([range]).build(),
            builder.setRank({ isBottom: true, isPercent: true, value: 10 }).setRanges([range]).build(),
            builder.setDataBar({
                min: { type: CFValueType.num, value: -100 },
                max: { type: CFValueType.num, value: 100 },
                positiveColor: '#00ff00',
                nativeColor: '#ff0000',
                isGradient: true,
                isShowValue: true,
            }).setRanges([range]).build(),
            builder.setColorScale([
                { index: 0, color: '#00ff00', value: { type: CFValueType.min } },
                { index: 1, color: '#ffff00', value: { type: CFValueType.percent, value: 50 } },
                { index: 2, color: '#ff0000', value: { type: CFValueType.max } },
            ]).setRanges([range]).build(),
            builder.setIconSet({
                isShowValue: true,
                iconConfigs: [
                    {
                        iconType: IIconSetType.threeArrows,
                        iconId: '0',
                        operator: CFNumberOperator.greaterThan,
                        value: { type: CFValueType.num, value: 20 },
                    },
                    {
                        iconType: IIconSetType.threeArrows,
                        iconId: '1',
                        operator: CFNumberOperator.greaterThan,
                        value: { type: CFValueType.num, value: 10 },
                    },
                    {
                        iconType: IIconSetType.threeArrows,
                        iconId: '2',
                        operator: CFNumberOperator.lessThanOrEqual,
                        value: { type: CFValueType.num, value: 10 },
                    },
                ],
            }).setRanges([range]).build(),
        ];

        expect(rules.map((rule) => rule.rule.type)).toEqual([
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'highlightCell',
            'dataBar',
            'colorScale',
            'iconSet',
        ]);
        expect(rules.map((rule) => ('operator' in rule.rule ? rule.rule.operator : undefined))).toContain(CFNumberOperator.between);
        expect(rules.map((rule) => ('operator' in rule.rule ? rule.rule.operator : undefined))).toContain(CFNumberOperator.notBetween);
        expect(rules[3].rule).toMatchObject({ value: [10, 20] });
        expect(rules[20].rule).toMatchObject({
            type: 'dataBar',
            isShowValue: true,
            config: {
                min: { type: 'num', value: -100 },
                max: { type: 'num', value: 100 },
                positiveColor: '#00ff00',
                nativeColor: '#ff0000',
                isGradient: true,
            },
        });
        expect(rules[21].rule).toMatchObject({ type: 'colorScale', config: [{ index: 0 }, { index: 1 }, { index: 2 }] });
        expect(rules[22].rule).toMatchObject({ type: 'iconSet', isShowValue: true, config: [{ iconId: '0' }, { iconId: '1' }, { iconId: '2' }] });
        expect(builder.getIconMap()[IIconSetType.threeArrows].length).toBeGreaterThan(0);
    });

    it('Creates rule and add', () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const rule = worksheet?.createConditionalFormattingRule()
            .whenCellNotEmpty()
            .setRanges([{ startRow: 0, endRow: 100, startColumn: 0, endColumn: 100 }])
            .setItalic(true)
            .setItalic(true)
            .setBackground('red')
            .setFontColor('green')
            .build();
        worksheet?.addConditionalFormattingRule(rule!);

        const conditionalFormattingViewModel = get(ConditionalFormattingViewModel);
        const cell4 = conditionalFormattingViewModel.getCellCfs(workbook!.getId(), worksheet!.getSheetId(), 0, 4);
        const cell5 = conditionalFormattingViewModel.getCellCfs(workbook!.getId(), worksheet!.getSheetId(), 0, 5);
        expect(cell4?.map((e) => e.result)).toEqual([
            {
                it: 1,
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                cl: {
                    rgb: 'rgb(0,128,0)',
                },
            },

        ]);
        expect(cell5?.map((e) => e.result)).toEqual([{}]);
    });

    it('resolves onCalculationResultApplied after conditional-formatting custom formula results are emitted', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getId();
        const subUnitId = worksheet.getSheetId();
        const formula = univerAPI.getFormula();

        await univerAPI.executeCommand('sheet.mutation.add-conditional-rule', {
            unitId,
            subUnitId,
            rule: {
                cfId: 'cf-1',
                stopIfTrue: false,
                ranges: [
                    {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 9,
                        endColumn: 0,
                        startAbsoluteRefType: 0,
                        endAbsoluteRefType: 0,
                        rangeType: 0,
                        unitId,
                        sheetId: subUnitId,
                    },
                ],
                rule: {
                    type: 'highlightCell',
                    subType: 'formula',
                    operator: 'containsText',
                    value: '=VALUE($A1)<=3',
                    style: {
                        bg: { rgb: 'rgb(254,243,199)' },
                    },
                },
            },
        });

        const formulaService = get(ConditionalFormattingFormulaService);
        const registeredFormula = formulaService.getSubUnitFormulaMap(unitId, subUnitId)?.getValues()[0];
        expect(registeredFormula?.cfId).toBe('cf-1');
        expect(registeredFormula?.formulaText).toBe('=VALUE($A1)<=3');

        const waitForResult = formula.onCalculationResultApplied();

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 0,
                totalFormulasToCalculate: 1,
            },
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {},
            unitOtherData: {
                [unitId]: {
                    [subUnitId]: {
                        [registeredFormula!.formulaId]: {
                            0: {
                                0: [[{ v: true }]],
                            },
                        },
                    },
                },
            },
        });

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('Delete conditional format according to cfId', async () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const rules = worksheet?.getConditionalFormattingRules();
        expect(rules?.length).toEqual(3);
        await worksheet?.deleteConditionalFormattingRule(rules![0].cfId);
        expect(worksheet?.getConditionalFormattingRules()?.length).toEqual(2);
    });

    it('Modify the priority of the conditional format', () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const rules = worksheet?.getConditionalFormattingRules()!;
        const rule = rules[2];
        const targetRule = rules[0];
        worksheet?.moveConditionalFormattingRule(rule.cfId, targetRule.cfId, 'before');
        const index = worksheet?.getConditionalFormattingRules()!.findIndex((r) => r.cfId === rule.cfId);
        expect(index).toEqual(0);
    });

    it('Set the conditional format according to cfId', () => {
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook?.getActiveSheet();
        const rules = worksheet?.getConditionalFormattingRules()!;
        const rule = rules[0];
        worksheet?.setConditionalFormattingRule(rule.cfId, { ...rule, ranges: [] });
        const afterEditRule = worksheet?.getConditionalFormattingRules()[0];
        expect(afterEditRule?.cfId).toEqual(rule.cfId);
        expect(afterEditRule?.ranges).toEqual([]);
    });

    it('Uses range facade APIs to add, update, reprioritize, and delete rules on the active selection', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('A1:B2');
        const rule = range.createConditionalFormattingRule()
            .whenTextContains('paid')
            .setBackground('#00ff00')
            .build();

        range.addConditionalFormattingRule(rule);
        expect(range.getConditionalFormattingRules().some((item) => item.cfId === rule.cfId)).toBe(true);

        const updatedRule = range.createConditionalFormattingRule()
            .whenTextContains('overdue')
            .setBackground('#ff0000')
            .build();
        range.setConditionalFormattingRule(rule.cfId, { ...updatedRule, cfId: rule.cfId });
        expect(worksheet.getConditionalFormattingRules().find((item) => item.cfId === rule.cfId)?.rule).toMatchObject({ value: 'overdue' });

        const firstRule = worksheet.getConditionalFormattingRules()[0];
        range.moveConditionalFormattingRule(rule.cfId, firstRule.cfId, 'before');
        expect(worksheet.getConditionalFormattingRules()[0].cfId).toBe(rule.cfId);

        range.deleteConditionalFormattingRule(rule.cfId);
        expect(worksheet.getConditionalFormattingRules().some((item) => item.cfId === rule.cfId)).toBe(false);
    });

    it('Clears conditional formatting from a range without removing unrelated sheet rules', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('A1:B2');
        const rule = range.createConditionalFormattingRule()
            .whenNumberGreaterThan(100)
            .setBackground('#ff0000')
            .build();

        range.addConditionalFormattingRule(rule);
        expect(range.getConditionalFormattingRules().map((item) => item.cfId)).toContain(rule.cfId);

        range.clearConditionalFormatRules();

        expect(range.getConditionalFormattingRules().map((item) => item.cfId)).not.toContain(rule.cfId);
        expect(worksheet.getConditionalFormattingRules().length).toBe(3);
    });

    it('Clears all conditional formatting rules from a worksheet', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();

        expect(worksheet.getConditionalFormattingRules().length).toBeGreaterThan(0);
        worksheet.clearConditionalFormatRules();

        expect(worksheet.getConditionalFormattingRules()).toEqual([]);
    });
});
