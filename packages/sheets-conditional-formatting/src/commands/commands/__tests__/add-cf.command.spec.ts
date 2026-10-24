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

import type { ICommandInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleType,
    SheetTypes,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UniverSheetsConditionalFormattingPlugin } from '../../../plugin';
import { AddConditionalRuleMutation } from '../../mutations/add-conditional-rule.mutation';
import { AddCfCommand } from '../add-cf.command';
import { ClearRangeCfCommand } from '../clear-range-cf.command';
import { ClearWorksheetCfCommand } from '../clear-worksheet-cf.command';
import { DeleteCfCommand } from '../delete-cf.command';
import { MoveCfCommand } from '../move-cf.command';
import { SetCfCommand } from '../set-cf.command';

const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

describe('Chart Sheet sheets-conditional-formatting edit boundary', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commands: ICommandService;
    let history: IUndoRedoService;
    let mutations: ICommandInfo[];
    let observer: { dispose(): void };

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'feature-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Feature boundary',
            sheetOrder: ['grid', 'chart'],
            styles: {},
            sheets: {
                grid: { id: 'grid', name: 'Grid', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 1 } } } },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, cellData: {} },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        commands = injector.get(ICommandService);
        history = injector.get(IUndoRedoService);
        mutations = [];
        observer = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) {
                mutations.push(command);
            }
        });
    });

    afterEach(() => {
        observer.dispose();
        univer.dispose();
    });

    async function expectRefused(id: string, params?: object) {
        const before = JSON.parse(JSON.stringify(workbook.save()));
        const resources = JSON.parse(JSON.stringify(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)));
        const undo = history.pitchTopUndoElement();
        const redo = history.pitchTopRedoElement();
        const count = mutations.length;
        expect(await commands.executeCommand(id, params)).toBe(false);
        expect(JSON.parse(JSON.stringify(workbook.save()))).toEqual(before);
        expect(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)).toEqual(resources);
        expect(history.pitchTopUndoElement()).toBe(undo);
        expect(history.pitchTopRedoElement()).toBe(redo);
        expect(mutations).toHaveLength(count);
    }

    it('refuses all new conditional formatting edits while preserving historical Chart resources', async () => {
        const chart = { unitId: workbook.getUnitId(), subUnitId: 'chart' };
        const rule = { cfId: 'historical-rule', ranges: [range], stopIfTrue: false, rule: { type: 'highlightCell', subType: 'text', operator: 'containsText', value: 'todo', style: {} } };
        await expectRefused(AddCfCommand.id, { ...chart, rule });
        expect(commands.syncExecuteCommand(AddConditionalRuleMutation.id, { ...chart, rule })).toBe(true);
        await expectRefused(SetCfCommand.id, { ...chart, cfId: rule.cfId, rule });
        await expectRefused(DeleteCfCommand.id, { ...chart, cfId: rule.cfId });
        await expectRefused(MoveCfCommand.id, { ...chart, start: { id: rule.cfId, type: 'self' }, end: { id: rule.cfId, type: 'self' } });
        await expectRefused(ClearRangeCfCommand.id, { ...chart, ranges: [range] });
        await expectRefused(ClearWorksheetCfCommand.id, chart);
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(await commands.executeCommand(AddCfCommand.id, { unitId: workbook.getUnitId(), subUnitId: 'grid', rule })).toBe(true);
    });
});
