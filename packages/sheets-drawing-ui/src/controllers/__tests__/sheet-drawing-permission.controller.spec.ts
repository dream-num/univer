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

import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { DrawingTypeEnum, IPermissionService } from '@univerjs/core';
import { WorksheetEditPermission } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { FlipSheetDrawingCommand } from '../../commands/commands/flip-drawings.command';
import { GroupSheetDrawingCommand } from '../../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../../commands/commands/ungroup-sheet-drawing.command';
import { SheetDrawingPermissionController } from '../sheet-drawing-permission.controller';

it('cancels UI group and flip commands through the real worksheet permission point', () => {
    const runtime = createSheetsDrawingUiTestBed();
    onTestFinished(() => runtime.univer.dispose());
    runtime.injector.add([SheetDrawingPermissionController]);
    runtime.injector.get(SheetDrawingPermissionController);
    runtime.commandService.registerCommand(GroupSheetDrawingCommand);
    runtime.commandService.registerCommand(UngroupSheetDrawingCommand);
    runtime.commandService.registerCommand(FlipSheetDrawingCommand);

    const executed: string[] = [];
    const listener = runtime.commandService.onCommandExecuted((command) => executed.push(command.id));
    onTestFinished(() => listener.dispose());
    const drawing = { unitId: runtime.unitId, subUnitId: runtime.subUnitId, drawingId: 'image-1', drawingType: DrawingTypeEnum.DRAWING_IMAGE };
    const group: IDrawingGroupUpdateParam[] = [{
        parent: { ...drawing, drawingId: 'group-1', drawingType: DrawingTypeEnum.DRAWING_GROUP },
        children: [drawing],
    }];
    const permissions = runtime.injector.get(IPermissionService);
    permissions.updatePermissionPoint(new WorksheetEditPermission(runtime.unitId, runtime.subUnitId).id, false);

    expect(runtime.commandService.syncExecuteCommand(GroupSheetDrawingCommand.id, group)).toBe(false);
    expect(runtime.commandService.syncExecuteCommand(UngroupSheetDrawingCommand.id, group)).toBe(false);
    expect(runtime.commandService.syncExecuteCommand(FlipSheetDrawingCommand.id, {
        unitId: runtime.unitId,
        drawings: [drawing],
        flipH: true,
    })).toBe(false);
    expect(executed).toEqual([]);

    permissions.updatePermissionPoint(new WorksheetEditPermission(runtime.unitId, runtime.subUnitId).id, true);
    expect(runtime.commandService.syncExecuteCommand(FlipSheetDrawingCommand.id, { unitId: runtime.unitId, drawings: [] })).toBe(false);
    expect(executed).toEqual([FlipSheetDrawingCommand.id]);
});
