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
import { DrawingTypeEnum, IPermissionService, LocaleType, SheetTypes } from '@univerjs/core';
import { WorksheetEditPermission } from '@univerjs/sheets';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { expect, it, onTestFinished } from 'vitest';
import { createAbsoluteChart } from '../../__tests__/chart-drawing-test-bed';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { FlipSheetDrawingCommand } from '../../commands/commands/flip-drawings.command';
import { GroupSheetDrawingCommand } from '../../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../../commands/commands/ungroup-sheet-drawing.command';
import { SheetDrawingPermissionController } from '../sheet-drawing-permission.controller';

function createPermissionRuntime(type?: SheetTypes) {
    const runtime = createSheetsDrawingUiTestBed({
        id: 'test',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        name: 'Chart',
        styles: {},
        sheetOrder: ['sheet1'],
        sheets: { sheet1: { id: 'sheet1', name: 'Chart', ...(type === undefined ? {} : { type }) } },
    });
    onTestFinished(() => runtime.univer.dispose());
    runtime.injector.add([SheetDrawingPermissionController]);
    runtime.injector.get(SheetDrawingPermissionController);
    return runtime;
}

it('cancels Chart Sheet group and flip commands through the existing worksheet permission check', () => {
    const runtime = createPermissionRuntime(SheetTypes.CHART);
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

it.each([undefined, SheetTypes.CHART])('uses existing permission defaults for Drawing insertion and rejects explicit denial on sheet type %s', (type) => {
    const runtime = createPermissionRuntime(type);
    const permissions = runtime.injector.get(IPermissionService);
    const point = new WorksheetEditPermission(runtime.unitId, runtime.subUnitId);
    const drawing = createAbsoluteChart('allowed', runtime.subUnitId);
    permissions.deletePermissionPoint(point.id);
    expect(runtime.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
        unitId: runtime.unitId,
        drawings: [drawing],
    })).toBe(true);
    const drawings = runtime.injector.get(ISheetDrawingService);
    expect(drawings.getDrawingByParam(drawing)).toEqual(drawing);

    point.value = false;
    expect(permissions.addPermissionPoint(point)).toBe(true);
    const denied = createAbsoluteChart('denied', runtime.subUnitId);
    expect(runtime.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
        unitId: runtime.unitId,
        drawings: [denied],
    })).toBe(false);
    expect(drawings.getDrawingByParam(denied)).toBeUndefined();
    expect(drawings.getDrawingByParam(drawing)).toEqual(drawing);
});
