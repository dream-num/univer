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

import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ISelectionFormatInfo } from '../format-painter.service';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocalUndoRedoService,
    ObjectMatrix,
    RedoCommand,
    ThemeService,
    UndoCommand,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { IMarkSelectionService, MarkSelectionService } from '../../mark-selection/mark-selection.service';
import { FormatPainterService, FormatPainterStatus, IFormatPainterService } from '../format-painter.service';

const injectors: Injector[] = [];

afterEach(() => {
    injectors.splice(0).forEach((injector) => injector.dispose());
});

function createService() {
    const injector = new Injector();
    injectors.push(injector);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([SheetsSelectionsService]);
    injector.add([ThemeService]);
    injector.add([SheetSkeletonService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    injector.add([IFormatPainterService, { useClass: FormatPainterService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');
    injector.get(SheetsSelectionsService).setSelections('unit-1', 'sheet-1', [{
        range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        primary: null,
    }] as never);
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetRangeValuesMutation);
    const executed: unknown[] = [];
    commandService.onCommandExecuted((command) => executed.push({ id: command.id, params: command.params }));
    return {
        service: injector.get(IFormatPainterService),
        markSelectionService: injector.get(IMarkSelectionService),
        undoRedoService: injector.get(IUndoRedoService),
        commandService,
        workbook,
        executed,
    };
}

describe('FormatPainterService', () => {
    it('applies collected format mutations and records undo-redo for a format painter action', async () => {
        const { service, executed, undoRedoService, markSelectionService, workbook, commandService } = createService();
        const statusChanges: FormatPainterStatus[] = [];
        const format: ISelectionFormatInfo = { styles: new ObjectMatrix(), merges: [] };
        const redoParams: ISetRangeValuesMutationParams = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 1: { 1: { s: { bl: 1 } } } },
        };
        const undoParams: ISetRangeValuesMutationParams = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 1: { 1: { s: null } } },
        };
        service.addHook({
            id: 'default',
            isDefaultHook: true,
            onStatusChange: (status) => statusChanges.push(status),
            onApply: () => ({
                redos: [{ id: SetRangeValuesMutation.id, params: redoParams }],
                undos: [{ id: SetRangeValuesMutation.id, params: undoParams }],
            }),
        });

        service.setSelectionFormat(format);
        service.setStatus(FormatPainterStatus.ONCE);
        const applied = service.applyFormatPainter('unit-1', 'sheet-1', { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 });

        expect(applied).toBe(true);
        expect(service.getSelectionFormat()).toBe(format);
        expect(statusChanges).toEqual([FormatPainterStatus.ONCE]);
        expect(markSelectionService.getShapeMap().size).toBe(1);
        expect(workbook.getStyles().getStyleByCell(workbook.getActiveSheet()!.getCell(1, 1))).toMatchObject({ bl: 1 });
        await expect.poll(() => executed).toEqual([{ id: SetRangeValuesMutation.id, params: redoParams }]);
        expect(undoRedoService.pitchTopUndoElement()).toMatchObject({ unitID: 'unit-1' });
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet()!.getCell(1, 1)?.s).toBeUndefined();
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(workbook.getStyles().getStyleByCell(workbook.getActiveSheet()!.getCell(1, 1))).toMatchObject({ bl: 1 });
    });

    it('stops at a rejected mutation without changing a later target or recording undo history', () => {
        const { service, undoRedoService, workbook } = createService();
        const originalCell = workbook.getActiveSheet()!.getCell(1, 1);
        const originalHistory = undoRedoService.pitchTopUndoElement();
        const params: ISetRangeValuesMutationParams = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: { 1: { 1: { s: { bl: 1 } } } },
        };
        service.addHook({
            id: 'stale-target',
            onApply: () => ({
                redos: [
                    { id: SetRangeValuesMutation.id, params: { ...params, subUnitId: 'removed-sheet' } },
                    { id: SetRangeValuesMutation.id, params },
                ],
                undos: [{ id: SetRangeValuesMutation.id, params }],
            }),
        });

        expect(service.applyFormatPainter('unit-1', 'sheet-1', {
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        })).toBe(false);
        expect(workbook.getActiveSheet()!.getCell(1, 1)).toEqual(originalCell);
        expect(undoRedoService.pitchTopUndoElement()).toBe(originalHistory);
    });
});
