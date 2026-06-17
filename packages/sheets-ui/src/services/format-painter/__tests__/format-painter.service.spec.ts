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

import type { ISelectionFormatInfo } from '../format-painter.service';
import {
    CommandService,
    CommandType,
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
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { IMarkSelectionService, MarkSelectionService } from '../../mark-selection/mark-selection.service';
import { FormatPainterService, FormatPainterStatus, IFormatPainterService } from '../format-painter.service';

function createService() {
    const injector = new Injector();
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
    commandService.registerCommand({
        id: 'sheet.mutation.apply-style',
        type: CommandType.MUTATION,
        handler: () => true,
    });
    commandService.registerCommand({
        id: 'sheet.mutation.revert-style',
        type: CommandType.MUTATION,
        handler: () => true,
    });
    const executed: unknown[] = [];
    commandService.onCommandExecuted((command) => executed.push({ id: command.id, params: command.params }));
    return {
        service: injector.get(IFormatPainterService),
        markSelectionService: injector.get(IMarkSelectionService),
        undoRedoService: injector.get(IUndoRedoService),
        executed,
    };
}

describe('FormatPainterService', () => {
    it('applies collected format mutations and records undo-redo for a format painter action', async () => {
        const { service, executed, undoRedoService, markSelectionService } = createService();
        const statusChanges: FormatPainterStatus[] = [];
        const format: ISelectionFormatInfo = { styles: new ObjectMatrix(), merges: [] };
        service.addHook({
            id: 'default',
            isDefaultHook: true,
            onStatusChange: (status) => statusChanges.push(status),
            onApply: () => ({
                redos: [{ id: 'sheet.mutation.apply-style', params: { color: 'red' } }],
                undos: [{ id: 'sheet.mutation.revert-style', params: { color: 'black' } }],
            }),
        });

        service.setSelectionFormat(format);
        service.setStatus(FormatPainterStatus.ONCE);
        const applied = service.applyFormatPainter('unit-1', 'sheet-1', { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 });

        expect(applied).toBe(true);
        expect(service.getSelectionFormat()).toBe(format);
        expect(statusChanges).toEqual([FormatPainterStatus.ONCE]);
        expect(markSelectionService.getShapeMap().size).toBe(1);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(executed).toEqual([{ id: 'sheet.mutation.apply-style', params: { color: 'red' } }]);
        expect(undoRedoService.pitchTopUndoElement()).toMatchObject({ unitID: 'unit-1' });
    });
});
