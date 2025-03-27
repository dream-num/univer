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
import { RemoveOtherFormulaMutation } from '@univerjs/engine-formula';
import { SetSelectionsOperation } from '@univerjs/sheets';
import {
    AddCfCommand,
    AddConditionalRuleMutation,
    ConditionalFormattingViewModel,
    DeleteCfCommand,
    DeleteConditionalRuleMutation,
    MoveCfCommand,
    MoveConditionalRuleMutation,
    SetCfCommand,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

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
            DeleteCfCommand,
            DeleteConditionalRuleMutation,
            MoveCfCommand,
            MoveConditionalRuleMutation,
            SetConditionalRuleMutation,
            SetCfCommand,
            SetSelectionsOperation,
            RemoveOtherFormulaMutation,
        ].forEach((m) => {
            commandService.registerCommand(m);
        });
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
        const rule = worksheet?.createConditionalFormattingRule()
            .whenCellNotEmpty()
            .setRanges([{ startRow: 0, endRow: 100, startColumn: 0, endColumn: 100 }])
            .setItalic(true)
            .setItalic(true)
            .setBackground('red')
            .setFontColor('green')
            .build();
        expect({ ...rule, cfId: 123 }).toEqual({
            rule: {
                type: 'highlightCell',
                subType: 'text',
                operator: 'notEqual',
                value: '',
                style: {
                    it: 1,
                    bg: {
                        rgb: 'rgb(255,0,0)',
                    },
                    cl: {
                        rgb: 'rgb(0,128,0)',
                    },
                },
            },
            ranges: [
                {
                    startRow: 0,
                    endRow: 100,
                    startColumn: 0,
                    endColumn: 100,
                },
            ],
            cfId: 123,
            stopIfTrue: false,
        });
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
});
