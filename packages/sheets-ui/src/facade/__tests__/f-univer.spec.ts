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

import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    InterceptorEffectEnum,
    IPermissionService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import {
    INTERCEPTOR_POINT,
    IRefSelectionsService,
    RefSelectionsService,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    DragManagerService,
    EditorBridgeService,
    HoverManagerService,
    IEditorBridgeService,
    ISheetClipboardService,
    SHEET_VIEW_KEY,
    SheetPasteShortKeyCommand,
    SheetPermissionRenderManagerService,
    SheetScrollManagerService,
} from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { createFacadeTestBed } from './create-test-bed';
import '../f-enum';
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
        expect(testBed.univerAPI.Enum.SHEET_VIEWPORT_KEY.VIEW_MAIN).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN);
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
        const currentRichText$ = new Subject<ITestHoverCell['location']>();
        const currentPointerDownCell$ = new Subject<ITestHoverCell['location']>();
        const currentPointerUpCell$ = new Subject<ITestHoverCell['location']>();
        const currentCellPosWithEvent$ = new Subject<ITestHoverCell['location']>();
        const currentRowHeaderClick$ = new Subject<ITestHeaderEvent>();
        const currentRowHeaderPointerDown$ = new Subject<ITestHeaderEvent>();
        const currentRowHeaderPointerUp$ = new Subject<ITestHeaderEvent>();
        const currentHoveredRowHeader$ = new Subject<ITestHeaderEvent>();
        const currentColHeaderClick$ = new Subject<ITestHeaderEvent>();
        const currentColHeaderPointerDown$ = new Subject<ITestHeaderEvent>();
        const currentColHeaderPointerUp$ = new Subject<ITestHeaderEvent>();
        const currentHoveredColHeader$ = new Subject<ITestHeaderEvent>();
        const currentDragCell$ = new Subject<ITestDragCell>();
        const endDragCell$ = new Subject<ITestDragCell>();

        const hoverManagerService = {
            currentClickedCell$,
            currentRichText$,
            currentPointerDownCell$,
            currentPointerUpCell$,
            currentCellPosWithEvent$,
            currentRowHeaderClick$,
            currentRowHeaderPointerDown$,
            currentRowHeaderPointerUp$,
            currentHoveredRowHeader$,
            currentColHeaderClick$,
            currentColHeaderPointerDown$,
            currentColHeaderPointerUp$,
            currentHoveredColHeader$,
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
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.CellHover, ({ row, column }) => logs.push(`cell-hover:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.CellPointerDown, ({ row, column }) => logs.push(`cell-down:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.CellPointerUp, ({ row, column }) => logs.push(`cell-up:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.CellPointerMove, ({ row, column }) => logs.push(`cell-move:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.RowHeaderClick, ({ row }) => logs.push(`row-click:${row}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.RowHeaderPointerDown, ({ row }) => logs.push(`row-down:${row}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.RowHeaderPointerUp, ({ row }) => logs.push(`row-up:${row}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.RowHeaderHover, ({ row }) => logs.push(`row-hover:${row}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.ColumnHeaderClick, ({ column }) => logs.push(`col-click:${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.ColumnHeaderPointerDown, ({ column }) => logs.push(`col-down:${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.ColumnHeaderPointerUp, ({ column }) => logs.push(`col-up:${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.ColumnHeaderHover, ({ column }) => logs.push(`col-hover:${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.DragOver, ({ row, column }) => logs.push(`drag:${row},${column}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.Drop, ({ row, column }) => logs.push(`drop:${row},${column}`)),
        ];

        const lifecycleService = testBed.get(LifecycleService);
        lifecycleService.stage = LifecycleStages.Rendered;

        currentClickedCell$.next({
            location: { unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 1, col: 2 },
            position: { startX: 0, startY: 0, endX: 10, endY: 10 },
        });
        currentRichText$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 2, col: 3 });
        currentPointerDownCell$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 3, col: 4 });
        currentPointerUpCell$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 4, col: 5 });
        currentCellPosWithEvent$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), row: 5, col: 6 });
        currentRowHeaderClick$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 3 });
        currentRowHeaderPointerDown$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 4 });
        currentRowHeaderPointerUp$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 6 });
        currentHoveredRowHeader$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 5 });
        currentColHeaderClick$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 4 });
        currentColHeaderPointerDown$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 6 });
        currentColHeaderPointerUp$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 7 });
        currentHoveredColHeader$.next({ unitId: workbook.getId(), subUnitId: worksheet.getSheetId(), index: 8 });
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
            'cell-hover:2,3',
            'cell-down:3,4',
            'cell-up:4,5',
            'cell-move:5,6',
            'row-click:3',
            'row-down:4',
            'row-up:6',
            'row-hover:5',
            'col-click:4',
            'col-down:6',
            'col-up:7',
            'col-hover:8',
            'drag:3,4',
            'drop:7,8',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });

    it('should register sheet render extensions and cell custom renderers', () => {
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const rowDispose = vi.fn();
        const columnDispose = vi.fn();
        const mainDispose = vi.fn();
        const rowComponent = { register: vi.fn(() => ({ dispose: rowDispose })), makeDirty: vi.fn() };
        const columnComponent = { register: vi.fn(() => ({ dispose: columnDispose })), makeDirty: vi.fn() };
        const mainComponent = { register: vi.fn(() => ({ dispose: mainDispose })), makeDirty: vi.fn() };
        const renderManagerService = testBed.get(IRenderManagerService);
        vi.spyOn(renderManagerService, 'getRenderUnitById').mockReturnValue({
            components: new Map([
                [SHEET_VIEW_KEY.ROW, rowComponent],
                [SHEET_VIEW_KEY.COLUMN, columnComponent],
                [SHEET_VIEW_KEY.MAIN, mainComponent],
            ]),
        } as never);

        const rowExtensionDisposable = testBed.univerAPI.registerSheetRowHeaderExtension(workbook.getId(), {} as never);
        const columnExtensionDisposable = testBed.univerAPI.registerSheetColumnHeaderExtension(workbook.getId(), {} as never);
        const mainExtensionDisposable = testBed.univerAPI.registerSheetMainExtension(workbook.getId(), {} as never);

        expect(rowComponent.register).toHaveBeenCalledTimes(1);
        expect(columnComponent.register).toHaveBeenCalledTimes(1);
        expect(mainComponent.register).toHaveBeenCalledTimes(1);

        rowExtensionDisposable.dispose();
        columnExtensionDisposable.dispose();
        mainExtensionDisposable.dispose();

        expect(rowDispose).toHaveBeenCalledTimes(1);
        expect(columnDispose).toHaveBeenCalledTimes(1);
        expect(mainDispose).toHaveBeenCalledTimes(1);
        expect(rowComponent.makeDirty).toHaveBeenCalledWith(true);
        expect(columnComponent.makeDirty).toHaveBeenCalledWith(true);
        expect(mainComponent.makeDirty).toHaveBeenCalledWith(true);

        const customRender = [{ drawWith: vi.fn() }] as never;
        const customRenderDisposable = testBed.univerAPI.registerCellCustomRender(customRender);
        const cell = testBed.get(SheetInterceptorService).fetchThroughInterceptors(
            INTERCEPTOR_POINT.CELL_CONTENT,
            InterceptorEffectEnum.Style
        )({}, null as never);

        expect(cell?.customRender).toEqual(customRender);
        customRenderDisposable.dispose();
    });

    it('should bridge render-unit scroll and selection events', () => {
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const scroll$ = new Subject<unknown>();
        const selectionMoveStart$ = new Subject<unknown[]>();
        const selectionMoving$ = new Subject<unknown[]>();
        const selectionMoveEnd$ = new Subject<unknown[]>();
        const selectionChanged$ = new Subject<unknown[]>();
        const render = {
            type: UniverInstanceType.UNIVER_SHEET,
            unitId: workbook.getId(),
            with: vi.fn((service: unknown) => {
                if (service === SheetScrollManagerService) {
                    return { validViewportScrollInfo$: scroll$ };
                }

                if (service === SheetsSelectionsService) {
                    return {
                        selectionMoveStart$,
                        selectionMoving$,
                        selectionMoveEnd$,
                        selectionChanged$,
                    };
                }

                throw new Error(`Unexpected render service: ${String(service)}`);
            }),
        };
        const renderManagerService = testBed.get(IRenderManagerService) as IRenderManagerService & {
            _renderCreated$: Subject<typeof render>;
        };
        renderManagerService._renderCreated$.next(render);
        render.with.mockImplementation((service: unknown) => {
            if (service === SheetScrollManagerService) {
                return { validViewportScrollInfo$: scroll$ };
            }

            if (service === SheetsSelectionsService) {
                return {
                    selectionMoveStart$,
                    selectionMoving$,
                    selectionMoveEnd$,
                    selectionChanged$,
                };
            }

            throw new Error(`Unexpected render service: ${String(service)}`);
        });

        const logs: string[] = [];
        const disposables = [
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.Scroll, (event) => {
                const { offsetX, offsetY } = event as unknown as { offsetX: number; offsetY: number };
                logs.push(`scroll:${offsetX},${offsetY}`);
            }),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SelectionMoveStart, ({ selections }) => logs.push(`selection-start:${selections.length}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SelectionMoving, ({ selections }) => logs.push(`selection-moving:${selections.length}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SelectionMoveEnd, ({ selections }) => logs.push(`selection-end:${selections.length}`)),
            testBed.univerAPI.addEvent(testBed.univerAPI.Event.SelectionChanged, ({ selections }) => logs.push(`selection-changed:${selections.length}`)),
        ];

        testBed.get(LifecycleService).stage = LifecycleStages.Steady;

        const selection = [{
            range: {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            },
        }];
        scroll$.next({ offsetX: 12, offsetY: 24, sheetViewStartColumn: 3, sheetViewStartRow: 5 });
        selectionMoveStart$.next(selection);
        selectionMoving$.next(selection);
        selectionMoveEnd$.next(selection);
        selectionChanged$.next(selection);

        expect(logs).toEqual(expect.arrayContaining([
            'scroll:12,24',
            'selection-start:1',
            'selection-moving:1',
            'selection-end:1',
            'selection-changed:1',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });
});
