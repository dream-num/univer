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

import { DrawingTypeEnum, IUndoRedoService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../set-sheet-drawing.command';

describe('SetSheetDrawingCommand', () => {
    it('persists an online OLE link with symmetric drawing mutations', async () => {
        const testBed = createSheetsDrawingTestBed();
        const service = testBed.get(ISheetDrawingService);
        const drawing = { unitId: testBed.workbook.getUnitId(), subUnitId: testBed.workbook.getActiveSheet()!.getSheetId(), drawingId: 'ole-1', drawingType: DrawingTypeEnum.DRAWING_OLE, oleAttachmentId: 'retained' };
        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: testBed.workbook.getUnitId(), drawings: [drawing] });
        const online = { unitId: 'child', type: 1 };
        expect(await testBed.commandService.executeCommand(SetSheetDrawingCommand.id, { unitId: testBed.workbook.getUnitId(), drawings: [{ ...drawing, oleOnlineUnit: online, oleFileName: '预算.xlsx' }] })).toBe(true);
        expect(JSON.parse(JSON.stringify(service.getDrawingByParam(drawing)))).toMatchObject({ oleAttachmentId: 'retained', oleOnlineUnit: online, oleFileName: '预算.xlsx' });
        const history = testBed.get(IUndoRedoService).pitchTopUndoElement()!;
        for (const mutation of history.undoMutations) testBed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        expect(service.getDrawingByParam(drawing)).not.toHaveProperty('oleOnlineUnit');
        expect(service.getDrawingByParam(drawing)).not.toHaveProperty('oleFileName');
        for (const mutation of history.redoMutations) testBed.commandService.syncExecuteCommand(mutation.id, mutation.params);
        expect(service.getDrawingByParam(drawing)).toMatchObject({ oleOnlineUnit: online, oleFileName: '预算.xlsx' });
        testBed.univer.dispose();
    });
});
