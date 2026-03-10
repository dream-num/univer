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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IPermissionService, IUniverInstanceService, LifecycleService, LifecycleStages } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRefSelectionsService, RefSelectionsService, SheetsSelectionsService } from '@univerjs/sheets';
import { DragManagerService, EditorBridgeService, HoverManagerService, IEditorBridgeService, ISheetClipboardService, SheetPasteShortKeyCommand, SheetPermissionRenderManagerService } from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { createFacadeTestBed } from './create-test-bed';
import '../f-event';
import '../f-univer';
import '../f-workbook';
import '../f-worksheet';

interface ITestClipboardParam {
    html?: string;
    text?: string;
}

interface ITestPasteParam {
    htmlContent?: string;
    textContent?: string;
}

interface ITestHoverCell {
    location: {
        unitId: string;
        subUnitId: string;
        row: number;
        col: number;
    };
    position: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    };
}

interface ITestHeaderEvent {
    unitId: string;
    subUnitId: string;
    index: number;
}

interface ITestDragCell extends ITestHoverCell {
    dataTransfer: DataTransfer;
}

type ITestUniverAPI = typeof createFacadeTestBed extends (...args: never[]) => infer TResult
    ? TResult extends { univerAPI: infer TApi }
        ? TApi & {
            _generateClipboardCopyParam: () => ITestClipboardParam | undefined;
            _generateClipboardPasteParam: (params: ITestPasteParam) => ITestClipboardParam | undefined;
            _beforeClipboardPaste: (params: ITestPasteParam) => void;
            _clipboardPaste: (params: ITestPasteParam) => void;
            _generateClipboardPasteParamAsync: () => Promise<unknown>;
            _beforeClipboardPasteAsync: () => Promise<void>;
            _clipboardPasteAsync: () => Promise<void>;
            fireEvent: (...args: unknown[]) => void;
        }
        : never
    : never;

describe('Test FUniver UI mixin', () => {
    const clipboardService = {
        generateCopyContent: vi.fn(() => ({ html: '<b>a</b>', plain: 'a' })),
    };

    const renderPermissionService = {
        setProtectedRangeShadowStrategy: vi.fn(),
        getProtectedRangeShadowStrategy: vi.fn(() => 'always' as const),
        getProtectedRangeShadowStrategy$: vi.fn(() => ({ subscribe: vi.fn() })),
    };

    const clipboardInterfaceService = {
        read: vi.fn(async () => []),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle common facade methods and clipboard internals', async () => {
        const testBed = createFacadeTestBed(undefined, [
            [ISheetClipboardService, { useValue: clipboardService }],
            [SheetPermissionRenderManagerService, { useValue: renderPermissionService }],
            [IClipboardInterfaceService, { useValue: clipboardInterfaceService }],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const univerAPI = testBed.univerAPI as ITestUniverAPI;
        const commandService = testBed.get(ICommandService);
        const sheet = testBed.univerAPI.getActiveWorkbook()!.getActiveSheet();
        const activeWorkbookMock = {
            getId: () => 'test',
            getActiveSheet: () => sheet,
            getActiveRange: () => ({ getRange: () => ({ startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }) }),
        };
        vi.spyOn(univerAPI, 'getActiveWorkbook').mockReturnValue(activeWorkbookMock as never);

        const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as never);
        await expect(testBed.univerAPI.pasteIntoSheet('<i>x</i>', 'x')).resolves.toBe(true);
        expect(executeSpy).toHaveBeenCalledWith(SheetPasteShortKeyCommand.id, {
            htmlContent: '<i>x</i>',
            textContent: 'x',
            files: undefined,
        });

        testBed.univerAPI.setProtectedRangeShadowStrategy('none');
        expect(renderPermissionService.setProtectedRangeShadowStrategy).toHaveBeenCalledWith('none');
        expect(testBed.univerAPI.getProtectedRangeShadowStrategy()).toBe('always');
        expect(testBed.univerAPI.getProtectedRangeShadowStrategy$()).toBeTruthy();

        const permissionService = testBed.get(IPermissionService);
        const setShowComponentsSpy = vi.spyOn(permissionService, 'setShowComponents');
        testBed.univerAPI.setPermissionDialogVisible(false);
        expect(setShowComponentsSpy).toHaveBeenCalledWith(false);

        const copyParams = univerAPI._generateClipboardCopyParam();
        expect(copyParams?.text).toBe('a');
        expect(copyParams?.html).toBe('<b>a</b>');

        const pasteParams = univerAPI._generateClipboardPasteParam({ htmlContent: '<p>1</p>', textContent: '1' });
        expect(pasteParams?.text).toBe('1');
        expect(pasteParams?.html).toBe('<p>1</p>');

        const fireEventSpy = vi.spyOn(univerAPI, 'fireEvent');
        univerAPI._beforeClipboardPaste({ htmlContent: '<p>2</p>', textContent: '2' });
        univerAPI._clipboardPaste({ htmlContent: '<p>3</p>', textContent: '3' });
        expect(fireEventSpy).toHaveBeenCalled();

        await expect(univerAPI._generateClipboardPasteParamAsync()).resolves.toBeUndefined();
        await expect(univerAPI._beforeClipboardPasteAsync()).resolves.toBeUndefined();
        await expect(univerAPI._clipboardPasteAsync()).resolves.toBeUndefined();

        const eventTypes = fireEventSpy.mock.calls.map((i) => i[0]);
        expect(eventTypes.includes(univerAPI.Event.BeforeClipboardPaste)).toBe(true);
        expect(eventTypes.includes(univerAPI.Event.ClipboardPasted)).toBe(true);
    });

    it('should bridge sheet edit lifecycle events through workbook editing flows', async () => {
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetCellEditVisibleOperation);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;
        const editorBridgeService = testBed.get(IEditorBridgeService);
        const univerInstanceService = testBed.get(IUniverInstanceService);
        const getUnit = univerInstanceService.getUnit.bind(univerInstanceService);
        vi.spyOn(editorBridgeService, 'getEditLocation').mockReturnValue({
            unitId: workbook.getId(),
            sheetId: worksheet.getSheetId(),
            row: 2,
            column: 3,
            editorUnitId: 'editor-unit',
            documentLayoutObject: {} as never,
        });
        vi.spyOn(univerInstanceService, 'getUnit').mockImplementation(((unitId: string) => {
            if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                return {
                    getSnapshot: () => ({ body: { dataStream: 'edit\r\n' } }),
                } as never;
            }

            return getUnit(unitId as never);
        }) as never);

        const logs: string[] = [];
        const disposables = [
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.BeforeSheetEditStart, ({ row, column }) => logs.push(`before-start:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SheetEditStarted, ({ row, column }) => logs.push(`start:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.BeforeSheetEditEnd, ({ isConfirm, row, column }) => logs.push(`before-end:${isConfirm}:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SheetEditEnded, ({ isConfirm, row, column }) => logs.push(`end:${isConfirm}:${row},${column}`)),
        ];

        expect(workbook.startEditing()).toBe(true);
        await workbook.endEditingAsync(true);
        expect(workbook.startEditing()).toBe(true);
        await workbook.abortEditingAsync();

        expect(logs).toEqual(expect.arrayContaining([
            'before-start:2,3',
            'start:2,3',
            'before-end:true:2,3',
            'end:true:2,3',
            'before-end:false:2,3',
            'end:false:2,3',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });

    it('should bridge render-layer hover and drag events', () => {
        const currentClickedCell$ = new Subject<ITestHoverCell>();
        const currentHoveredRowHeader$ = new Subject<ITestHeaderEvent>();
        const currentColHeaderPointerDown$ = new Subject<ITestHeaderEvent>();
        const currentDragCell$ = new Subject<ITestDragCell>();
        const endDragCell$ = new Subject<ITestDragCell>();

        const hoverManagerService = {
            currentClickedCell$,
            currentRichText$: new Subject<unknown>(),
            currentPointerDownCell$: new Subject<unknown>(),
            currentPointerUpCell$: new Subject<unknown>(),
            currentCellPosWithEvent$: new Subject<unknown>(),
            currentRowHeaderClick$: new Subject<unknown>(),
            currentRowHeaderPointerDown$: new Subject<unknown>(),
            currentRowHeaderPointerUp$: new Subject<unknown>(),
            currentHoveredRowHeader$,
            currentColHeaderClick$: new Subject<unknown>(),
            currentColHeaderPointerDown$,
            currentColHeaderPointerUp$: new Subject<unknown>(),
            currentHoveredColHeader$: new Subject<unknown>(),
        };

        const dragManagerService = {
            currentCell$: currentDragCell$,
            endCell$: endDragCell$,
        };

        const testBed = createFacadeTestBed(undefined, [
            [HoverManagerService, { useValue: hoverManagerService }],
            [DragManagerService, { useValue: dragManagerService }],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;
        const logs: string[] = [];
        const disposables = [
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.CellClicked, ({ row, column }) => logs.push(`cell:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.RowHeaderHover, ({ row }) => logs.push(`row-hover:${row}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.ColumnHeaderPointerDown, ({ column }) => logs.push(`col-down:${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.DragOver, ({ row, column }) => logs.push(`drag:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.Drop, ({ row, column }) => logs.push(`drop:${row},${column}`)),
        ];

        const lifecycleService = testBed.get(LifecycleService);
        lifecycleService.stage = LifecycleStages.Rendered;

        currentClickedCell$.next({
            location: { unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 1, col: 2 },
            position: { startX: 0, startY: 0, endX: 10, endY: 10 },
        });
        currentHoveredRowHeader$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 5 });
        currentColHeaderPointerDown$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 6 });
        currentDragCell$.next({
            location: { unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 3, col: 4 },
            position: { startX: 0, startY: 0, endX: 10, endY: 10 },
            dataTransfer: {} as DataTransfer,
        });
        endDragCell$.next({
            location: { unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 7, col: 8 },
            position: { startX: 0, startY: 0, endX: 10, endY: 10 },
            dataTransfer: {} as DataTransfer,
        });

        expect(logs).toEqual(expect.arrayContaining([
            'cell:1,2',
            'row-hover:5',
            'col-down:6',
            'drag:3,4',
            'drop:7,8',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });
});
