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
import { SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UniverSheetsNumfmtPlugin } from '../../../plugin';
import { AddDecimalCommand } from '../add-decimal.command';
import { SetCurrencyCommand } from '../set-currency.command';
import { SetNumfmtCommand } from '../set-numfmt.command';
import { SetPercentCommand } from '../set-percent.command';
import { SubtractDecimalCommand } from '../subtract-decimal.command';

const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

describe('Chart Sheet sheets-numfmt edit boundary', () => {
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
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'feature-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Feature boundary',
            sheetOrder: ['grid', 'chart', 'other'],
            styles: {},
            sheets: {
                grid: { id: 'grid', name: 'Grid', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 1 } } } },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, cellData: {} },
                other: { id: 'other', name: 'Other', type: SheetTypes.GANTT, cellData: { 0: { 0: { v: 5 } } } },
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

    it('refuses explicit chart formats while Grid is active and edits an explicit Grid while Chart is active', async () => {
        await expectRefused(SetNumfmtCommand.id, { unitId: workbook.getUnitId(), subUnitId: 'chart', values: [{ row: 0, col: 0, pattern: '0.00' }] });
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(await commands.executeCommand(SetNumfmtCommand.id, { unitId: workbook.getUnitId(), subUnitId: 'grid', values: [{ row: 0, col: 0, pattern: '0.00' }] })).toBe(true);
        expect(workbook.getSheetBySheetId('grid')!.getComposedCellStyle(0, 0).n?.pattern).toBe('0.00');
        expect(workbook.getSheetBySheetId('chart')!.getCellMatrix().getSizeOf()).toBe(0);
        expect(await commands.executeCommand(SetNumfmtCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: 'other',
            values: [{ row: 0, col: 0, pattern: '0.0' }],
        })).toBe(true);
        expect(workbook.getSheetBySheetId('other')!.getComposedCellStyle(0, 0).n?.pattern).toBe('0.0');
    });

    it('refuses decimal, currency and percent shortcuts with a real selection on Chart', async () => {
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        univer.__getInjector().get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'chart', [{ range, primary: null, style: null }]);
        await expectRefused(AddDecimalCommand.id);
        await expectRefused(SubtractDecimalCommand.id);
        await expectRefused(SetCurrencyCommand.id);
        await expectRefused(SetPercentCommand.id);
    });
});
