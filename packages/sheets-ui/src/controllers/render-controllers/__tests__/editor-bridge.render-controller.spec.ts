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

import type { Dependency, DocumentDataModel, IDocumentData } from '@univerjs/core';
import { CanceledError, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, SheetTypes, UniverInstanceType } from '@univerjs/core';
import { DocStateChangeManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { ReplaceSnapshotCommand } from '@univerjs/docs-ui';
import { FunctionService, IFunctionService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { DesktopLayoutService, ILayoutService, KeyCode } from '@univerjs/ui';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { SetActivateCellEditOperation } from '../../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { ScrollToRangeOperation } from '../../../commands/operations/scroll-to-range.operation';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import {
    CellEditorManagerService,
    ICellEditorManagerService,
} from '../../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../../services/editor/cell-editor-resize.service';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { EditingRenderController } from '../../editor/editing.render-controller';
import { EditorBridgeRenderController } from '../editor-bridge.render-controller';
import { SheetsScrollRenderController } from '../scroll.render-controller';
import { createChartRenderTestBed } from './chart-render-test-bed';

describe('Chart activation with a real pending Grid edit', () => {
    it.each([
        { rangePicking: false, refuseRestore: false },
        { rangePicking: true, refuseRestore: false },
        { rangePicking: true, refuseRestore: true },
        { rangePicking: true, refuseRestore: false, capturedType: SheetTypes.KANBAN },
        { rangePicking: true, refuseRestore: false, capturedType: SheetTypes.GANTT },
        { rangePicking: true, refuseRestore: false, escape: true },
        { rangePicking: true, refuseRestore: false, capturedType: SheetTypes.KANBAN, escape: true },
        { rangePicking: true, refuseRestore: false, capturedType: SheetTypes.GANTT, escape: true },
        { rangePicking: true, refuseRestore: false, capturedType: SheetTypes.KANBAN, close: true },
        { rangePicking: false, refuseRestore: false, capturedType: SheetTypes.KANBAN, close: true },
        { rangePicking: true, refuseRestore: false, removeCapturedSheet: true },
        { rangePicking: true, refuseRestore: false, removeCapturedSheet: true, escape: true },
        { rangePicking: true, refuseRestore: false, removeCapturedSheet: true, close: true },
    ])('commits valid Grid edits and discards invalid edits without restoring their sheet with %j', async ({ rangePicking, refuseRestore, capturedType, removeCapturedSheet, escape, close }) => {
        const { injector, render, workbook, activate, commands, univer } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [SheetsScrollRenderController],
            [EditorBridgeRenderController],
        ]);
        const providers: Dependency[] = [
            [ILayoutService, { useClass: DesktopLayoutService }],
            [ICellEditorManagerService, { useClass: CellEditorManagerService }],
            [IFunctionService, { useClass: FunctionService }],
            [LexerTreeBuilder],
            [DocStateEmitService],
            [DocStateChangeManagerService],
            [SheetCellEditorResizeService],
            [EditingRenderController],
        ];
        providers.forEach((provider) => injector.add(provider));
        [SetActivateCellEditOperation, SetCellEditVisibleOperation, ScrollToRangeOperation, SetRangeValuesCommand, SetRangeValuesMutation, SetWorksheetActivateCommand, ReplaceSnapshotCommand, RichTextEditingMutation].forEach((command) => commands.registerCommand(command));
        injector.get(EditingRenderController);
        const bridge = injector.get(IEditorBridgeService);
        commands.syncExecuteCommand(SetActivateCellEditOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: 'grid',
            scene: render.scene,
            engine: render.engine,
            primary: workbook.getActiveSheet().getCellInfoInMergeData(1, 1),
        });
        commands.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            unitId: workbook.getUnitId(),
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
        });
        univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: 'Pending Grid value\r\n' },
            documentStyle: {},
        });
        bridge.changeEditorDirty(true);
        bridge.enableForceKeepVisible();
        if (rangePicking) {
            workbook.addWorksheet('grid-other', 2, { id: 'grid-other', rowCount: 20, columnCount: 10 });
            activate('grid-other');
            expect(bridge.getEditLocation()?.sheetId).toBe('grid');
            expect(bridge.isVisible().visible).toBe(true);
        }
        if (refuseRestore) {
            const interceptor = commands.beforeCommandExecuted((command) => {
                if (command.id === SetWorksheetActiveOperation.id &&
                    Reflect.get(command.params!, 'subUnitId') === 'grid') {
                    throw new CanceledError();
                }
            });
            onTestFinished(() => interceptor.dispose());
        }
        if (capturedType !== undefined) {
            workbook.getSheetBySheetId('grid')!.getConfig().type = capturedType;
        }
        if (removeCapturedSheet) {
            workbook.removeSheet('grid');
        }
        const activated = escape || close
            ? commands.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                unitId: workbook.getUnitId(),
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                ...(escape ? { keycode: KeyCode.ESC } : {}),
            })
            : activate('chart');
        await vi.advanceTimersByTimeAsync(10);
        if (refuseRestore) {
            expect(activated).toBe(false);
            expect(workbook.getActiveSheet().getSheetId()).toBe('grid-other');
            expect(workbook.getSheetBySheetId('grid')!.getCell(1, 1)).toBeUndefined();
            expect(workbook.getSheetBySheetId('chart')!.getCell(1, 1)).toBeUndefined();
            expect(bridge.isVisible().visible).toBe(true);
            return;
        }
        const invalidEdit = capturedType !== undefined || removeCapturedSheet;
        const expectedSheet = invalidEdit && rangePicking ? 'grid-other' : 'grid';
        expect(workbook.getActiveSheet().getSheetId()).toBe(escape || close ? expectedSheet : 'chart');
        expect(workbook.getSheetBySheetId('grid')?.getCell(1, 1)?.v).toBe(
            escape || invalidEdit ? undefined : 'Pending Grid value'
        );
        expect(workbook.getSheetBySheetId('chart')!.getCell(1, 1)).toBeUndefined();
        if (rangePicking) {
            expect(workbook.getSheetBySheetId('grid-other')!.getCell(1, 1)).toBeUndefined();
        }
        expect(bridge.isVisible().visible).toBe(false);
        expect(bridge.isForceKeepVisible()).toBe(false);
        if (invalidEdit) {
            expect(bridge.getEditLocation()).toBeNull();
            expect(bridge.getEditCellLayout()).toBeNull();
        }
    });
});

describe('Editor bridge render lifecycle', () => {
    it('releases active-sheet and command listeners when its real controller is disposed', () => {
        const { injector, render, workbook, activate, commands } = createChartRenderTestBed([[EditorBridgeRenderController]]);
        commands.registerCommand(SetActivateCellEditOperation);
        commands.registerCommand(SetCellEditVisibleOperation);
        const bridge = injector.get(IEditorBridgeService);
        commands.syncExecuteCommand(SetActivateCellEditOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: 'grid',
            scene: render.scene,
            engine: render.engine,
            primary: workbook.getActiveSheet().getCellInfoInMergeData(1, 1),
        });
        commands.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            unitId: workbook.getUnitId(),
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
        });
        render.with(EditorBridgeRenderController).dispose();
        activate('chart');
        expect(bridge.isVisible().visible).toBe(true);
    });
});
