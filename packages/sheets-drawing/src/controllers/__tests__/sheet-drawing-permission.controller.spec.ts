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

import { DrawingTypeEnum, IPermissionService } from '@univerjs/core';
import { WorksheetEditPermission } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { GroupSheetDrawingCommand } from '../../commands/commands/group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../../commands/commands/ungroup-sheet-drawing.command';
import { ISheetDrawingService } from '../../services/sheet-drawing.service';

it('rejects group and ungroup commands on a worksheet without edit permission, without the UI package', () => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const unitId = bed.workbook.getUnitId();
    const subUnitId = bed.workbook.getActiveSheet()!.getSheetId();
    const service = bed.get(ISheetDrawingService);
    const shape = (drawingId: string, left: number) => ({ unitId, subUnitId, drawingId, drawingType: DrawingTypeEnum.DRAWING_SHAPE, transform: { left, top: 20, width: 40, height: 30 } });
    const groupParams = (drawingId: string) => [{
        parent: { unitId, subUnitId, drawingId, drawingType: DrawingTypeEnum.DRAWING_GROUP, transform: { left: 100, top: 20, width: 140, height: 30 } },
        children: [shape('first', 100), shape('second', 200)].map((child) => ({ ...child, groupId: drawingId })),
    }];
    expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId, drawings: [shape('first', 100), shape('second', 200)] })).toBe(true);
    expect(bed.commandService.syncExecuteCommand(GroupSheetDrawingCommand.id, groupParams('allowed'))).toBe(true);

    bed.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id, false);
    const ungroupParams = [{ parent: service.getDrawingByParam({ unitId, subUnitId, drawingId: 'allowed' })!, children: [shape('first', 100), shape('second', 200)] }];
    expect(bed.commandService.syncExecuteCommand(UngroupSheetDrawingCommand.id, ungroupParams)).toBe(false);
    expect(service.getDrawingByParam({ unitId, subUnitId, drawingId: 'allowed' })).toBeDefined();
    expect(bed.commandService.syncExecuteCommand(GroupSheetDrawingCommand.id, groupParams('denied'))).toBe(false);
    expect(service.getDrawingByParam({ unitId, subUnitId, drawingId: 'denied' })).toBeUndefined();
});
