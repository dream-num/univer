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

import { ICommandService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { describe, expect, it } from 'vitest';
import type { IConditionFormattingRule } from '../../../models/type';
import { CFRuleType, CFSubRuleType } from '../../../base/const';
import { ConditionalFormattingRuleModel } from '../../../models/conditional-formatting-rule-model';
import { UniverSheetsConditionalFormattingPlugin } from '../../../plugin';
import { AddCfCommand } from '../add-cf.command';
import { ClearRangeCfCommand } from '../clear-range-cf.command';

describe('ClearRangeCfCommand', () => {
    it('keeps remaining formula references when clearing the first cell of a rule', async () => {
        const univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        try {
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'formula-clear',
                name: 'Formula clear',
                locale: LocaleType.EN_US,
                sheetOrder: ['sheet-1'],
                sheets: { 'sheet-1': { id: 'sheet-1', name: 'Sheet 1', cellData: {} } },
                styles: {},
            });
            const instances = injector.get(IUniverInstanceService);
            instances.setCurrentUnitForType('formula-clear');
            instances.focusUnit('formula-clear');
            const commands = injector.get(ICommandService);
            const model = injector.get(ConditionalFormattingRuleModel);
            const rule: IConditionFormattingRule = {
                cfId: 'formula-rule',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
                stopIfTrue: false,
                rule: { type: CFRuleType.highlightCell, subType: CFSubRuleType.formula, value: '=A2>0', style: { bl: 1 } },
            };
            expect(await commands.executeCommand(AddCfCommand.id, { unitId: 'formula-clear', subUnitId: 'sheet-1', rule })).toBe(true);
            expect(await commands.executeCommand(ClearRangeCfCommand.id, {
                unitId: 'formula-clear',
                subUnitId: 'sheet-1',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            })).toBe(true);
            expect(model.getRule('formula-clear', 'sheet-1', rule.cfId)).toMatchObject({
                ranges: [{ startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }],
                rule: { value: '=B2>0' },
            });
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getRule('formula-clear', 'sheet-1', rule.cfId)).toEqual(rule);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getRule('formula-clear', 'sheet-1', rule.cfId)?.rule).toMatchObject({ value: '=B2>0' });
        } finally {
            univer.dispose();
        }
    });
});
