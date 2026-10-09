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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    ThemeService,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import {
    CanvasColorService,
    DeviceInputEventType,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    SHEET_VIEWPORT_KEY,
    Viewport,
} from '@univerjs/engine-render';
import {
    AddWorksheetMergeCommand,
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { DISABLE_AUTO_FOCUS_KEY } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../editor-bridge.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

function createService(options?: {
    disableAutoFocus?: boolean;
    hasFocusEditor?: boolean;
    hasInternalEditorDocument?: boolean;
}) {
    const unitDisposed$ = new Subject<any>();
    const workbook = {
        getUnitId: () => 'unit-1',
    };

    const mocks = {
        unitDisposed$,
        sheetInterceptorService: {
            writeCellInterceptor: {
                fetchThroughInterceptors: vi.fn(() => (cell: unknown) => cell),
            },
        },
        sheetSkeletonService: {
            getSkeleton: vi.fn(() => null),
        },
        renderManagerService: {
            getRenderUnitById: vi.fn(() => null),
        },
        themeService: {
            getColorFromTheme: vi.fn(() => '#d0d0d0'),
        },
        univerInstanceService: {
            getTypeOfUnitDisposed$: vi.fn(() => unitDisposed$.asObservable()),
            getCurrentUnitOfType: vi.fn((_type?: UniverInstanceType) => workbook),
            getUnit: vi.fn((unitId: string, type?: UniverInstanceType) => {
                if (unitId === 'unit-1') {
                    return mocks.univerInstanceService.getCurrentUnitOfType(type as never);
                }

                return unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY && options?.hasInternalEditorDocument
                    ? { getUnitId: () => DOCS_NORMAL_EDITOR_UNIT_ID_KEY }
                    : null;
            }),
            setCurrentUnitForType: vi.fn(),
        },
        editorService: {
            getFocusEditor: vi.fn(() => (options?.hasFocusEditor ? { id: 'existing' } : null)),
            focus: vi.fn(),
        },
        contextService: {
            setContextValue: vi.fn(),
            getContextValue: vi.fn((key: string) => key === DISABLE_AUTO_FOCUS_KEY && Boolean(options?.disableAutoFocus)),
        },
    };

    class TestSheetInterceptorService {
        writeCellInterceptor = mocks.sheetInterceptorService.writeCellInterceptor;
    }

    class TestSheetSkeletonService {
        getSkeleton = mocks.sheetSkeletonService.getSkeleton;
    }

    class TestRenderManagerService {
        getRenderUnitById = mocks.renderManagerService.getRenderUnitById;
    }

    class TestThemeService {
        getColorFromTheme = mocks.themeService.getColorFromTheme;
    }

    class TestUniverInstanceService {
        getTypeOfUnitDisposed$ = mocks.univerInstanceService.getTypeOfUnitDisposed$;
        getCurrentUnitOfType = mocks.univerInstanceService.getCurrentUnitOfType;
        getUnit = mocks.univerInstanceService.getUnit;
        setCurrentUnitForType = mocks.univerInstanceService.setCurrentUnitForType;
    }

    class TestEditorService {
        getFocusEditor = mocks.editorService.getFocusEditor;
        focus = mocks.editorService.focus;
    }

    class TestContextService {
        setContextValue = mocks.contextService.setContextValue;
        getContextValue = mocks.contextService.getContextValue;
    }

    const injector = new Injector();
    injector.add([SheetInterceptorService, { useClass: TestSheetInterceptorService as never }]);
    injector.add([SheetSkeletonService, { useClass: TestSheetSkeletonService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ThemeService, { useClass: TestThemeService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);
    injector.add([IContextService, { useClass: TestContextService as never }]);
    injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
    const service = injector.get(IEditorBridgeService) as EditorBridgeService;

    return { service, mocks };
}

function createLatestState() {
    return {
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        row: 1,
        column: 2,
        documentLayoutObject: { id: 'doc-layout' },
        editorUnitId: 'doc-editor',
        position: {
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        },
        canvasOffset: {
            left: 0,
            top: 0,
        },
        scaleX: 1,
        scaleY: 1,
    };
}

function createEditCellParam() {
    return {
        scene: {},
        engine: {},
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        primary: {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            actualRow: 1,
            actualColumn: 2,
            isMerged: false,
            isMergedMainCell: true,
        },
    } as any;
}

function createPositionedEditCellParam() {
    return {
        ...createEditCellParam(),
        scene: {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 1.5 }),
            getViewport: () => ({}),
            getViewportScrollXY: () => ({ x: 5, y: 10 }),
        },
        engine: {
            getCanvasElement: () => ({
                getBoundingClientRect: () => ({ left: 12, top: 18 }),
            }),
        },
    } as any;
}

describe('EditorBridgeService', () => {
    it('syncs edit state/layout from latest state and reacts to disposed unit', () => {
        const { service, mocks } = createService();
        const latest = createLatestState();
        const currentEditCombined: any[] = [];
        service.currentEditCell$.subscribe((value) => currentEditCombined.push(value));

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState');
        getLatestSpy.mockReturnValue(latest as any);
        service.setEditCell(createEditCellParam());

        expect(mocks.editorService.focus).toHaveBeenCalled();
        expect(mocks.contextService.setContextValue).toHaveBeenCalledTimes(2);
        expect(service.getEditCellState()).toEqual(latest);
        expect(service.getEditCellLayout()).toEqual({
            position: latest.position,
            canvasOffset: latest.canvasOffset,
            scaleX: 1,
            scaleY: 1,
        });
        expect(service.getEditLocation()).toEqual(
            expect.objectContaining({
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 1,
                column: 2,
            })
        );
        expect(currentEditCombined.at(-1)).toEqual(expect.objectContaining({ row: 1, column: 2 }));

        service.updateEditLocation(8, 9);
        expect(service.getEditLocation()).toEqual(expect.objectContaining({ row: 8, column: 9 }));

        getLatestSpy.mockReturnValue(null as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toBeNull();

        getLatestSpy.mockReturnValue(latest as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toEqual(latest);

        mocks.unitDisposed$.next({
            getUnitId: () => 'unit-1',
        });
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
    });

    it('selects the internal editor without focusing its DOM input when automatic focus is disabled', () => {
        const { service, mocks } = createService({
            disableAutoFocus: true,
            hasInternalEditorDocument: true,
        });
        vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(undefined);

        service.setEditCell(createEditCellParam());

        expect(mocks.univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(mocks.editorService.focus).not.toHaveBeenCalled();
        expect(mocks.contextService.setContextValue).not.toHaveBeenCalled();
    });

    it('does not select the internal editor before its document is registered', () => {
        const { service, mocks } = createService({ disableAutoFocus: true });
        vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(undefined);

        service.setEditCell(createEditCellParam());

        expect(mocks.univerInstanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(mocks.editorService.focus).not.toHaveBeenCalled();
    });

    it('manages visible/dirty/force-keep states and null-latest branches', () => {
        const { service, mocks } = createService({ hasFocusEditor: true });
        const visibleValues: any[] = [];
        const afterVisibleValues: any[] = [];
        const forceValues: boolean[] = [];
        service.visible$.subscribe((value) => visibleValues.push(value));
        service.afterVisible$.subscribe((value) => afterVisibleValues.push(value));
        service.forceKeepVisible$.subscribe((value) => forceValues.push(value));

        expect(service.getCurrentEditorId()).toBe(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
        expect(service.getEditLocation()).toBeNull();
        expect(service.getEditorDirty()).toBe(false);

        service.changeEditorDirty(true);
        expect(service.getEditorDirty()).toBe(true);

        service.changeVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.isVisible()).toEqual({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.getEditorDirty()).toBe(false);
        expect(visibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));
        expect(afterVisibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));

        service.enableForceKeepVisible();
        service.disableForceKeepVisible();
        expect(service.isForceKeepVisible()).toBe(false);
        expect(forceValues.slice(-2)).toEqual([true, false]);

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(undefined);
        service.setEditCell(createEditCellParam());
        expect(service.getEditCellState()).toBeNull();

        service.refreshEditCellState();
        service.refreshEditCellPosition();
        expect(getLatestSpy).toHaveBeenCalled();
        expect(mocks.editorService.focus).not.toHaveBeenCalled();
    });

    it('builds the edit cell state from workbook, skeleton, render and intercepted cell data', () => {
        const { service, mocks } = createService();
        const body: any = {
            dataStream: '=SUM(A1:A2)\r\n',
            textRuns: [],
        };
        const documentModel = {
            documentStyle: {
                renderConfig: {},
            },
            getBody: () => body,
            setZoomRatio: vi.fn(),
        };
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getFreeze: () => null,
            getCellInfoInMergeData: () => createEditCellParam().primary,
            getCellRaw: vi.fn(() => ({ v: '=SUM(A1:A2)' })),
            getCell: vi.fn(() => ({ isInArrayFormulaRange: true, isPercentFormat: true })),
            getCellDocumentModelWithFormula: vi.fn(() => ({ documentModel })),
            getBlankCellDocumentModel: vi.fn(() => ({ documentModel })),
        };
        mocks.univerInstanceService.getCurrentUnitOfType.mockReturnValue({
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        } as never);
        mocks.sheetSkeletonService.getSkeleton.mockReturnValue({
            getNoMergeCellWithCoordByIndex: (row: number, column: number) => ({
                startX: column * 100,
                startY: row * 20,
                endX: column * 100 + 100,
                endY: row * 20 + 20,
            }),
        } as never);
        mocks.renderManagerService.getRenderUnitById.mockReturnValue({
            with: vi.fn(),
        } as never);

        service.setEditCell(createPositionedEditCellParam());

        expect(service.getEditLocation()).toEqual(expect.objectContaining({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 1,
            column: 2,
            editorUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            isPercentFormat: true,
        }));
        expect(service.getEditCellLayout()).toEqual(expect.objectContaining({
            scaleX: 2,
            scaleY: 1.5,
            canvasOffset: { left: 12, top: 18 },
        }));
        expect(documentModel.setZoomRatio).toHaveBeenCalledWith(2);
        expect(body.textRuns[0].ts.cl.rgb).toBe('#d0d0d0');

        service.refreshEditCellPosition(true);
        expect(service.getEditCellLayout()?.position.startX).toBeGreaterThan(0);
    });

    it('builds and refreshes the edit cell state from the target unit when current sheet unit is different', () => {
        const { service, mocks } = createService();
        const documentModel = {
            documentStyle: {
                renderConfig: {},
            },
            getBody: () => ({ dataStream: 'Embedded\r\n', textRuns: [] }),
            setZoomRatio: vi.fn(),
        };
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getFreeze: () => null,
            getCellInfoInMergeData: () => createEditCellParam().primary,
            getCellRaw: vi.fn(() => ({ v: 'Embedded' })),
            getCell: vi.fn(() => ({ v: 'Embedded' })),
            getCellDocumentModelWithFormula: vi.fn(() => ({ documentModel })),
            getBlankCellDocumentModel: vi.fn(() => ({ documentModel })),
        };
        const childWorkbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        mocks.univerInstanceService.getCurrentUnitOfType.mockReturnValue({
            getUnitId: () => 'host-or-other-sheet',
            getActiveSheet: () => null,
        } as never);
        mocks.univerInstanceService.getUnit.mockImplementation((unitId: string, type?: UniverInstanceType) => (
            unitId === 'unit-1' && type === UniverInstanceType.UNIVER_SHEET ? childWorkbook : null
        ) as never);
        mocks.sheetSkeletonService.getSkeleton.mockReturnValue({
            getNoMergeCellWithCoordByIndex: (row: number, column: number) => ({
                startX: column * 80,
                startY: row * 24,
                endX: column * 80 + 80,
                endY: row * 24 + 24,
            }),
        } as never);
        mocks.renderManagerService.getRenderUnitById.mockReturnValue({
            with: vi.fn(),
        } as never);

        service.setEditCell(createPositionedEditCellParam());

        expect(service.getEditLocation()).toEqual(expect.objectContaining({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 1,
            column: 2,
        }));
        expect(service.getEditCellLayout()).toEqual(expect.objectContaining({
            canvasOffset: { left: 12, top: 18 },
            scaleX: 2,
            scaleY: 1.5,
        }));

        service.refreshEditCellPosition();
        expect(service.getEditCellLayout()?.position.startX).toBeGreaterThan(0);
    });
});

describe('EditorBridgeService merged-cell layout with real providers', () => {
    let univer: Univer;

    beforeEach(() => {
        // Happy DOM has no canvas backend; workbook, editor, and skeleton services remain real.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([SheetSkeletonService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([DocSelectionManagerService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        injector.get(SheetSkeletonService);
        injector.get(SheetInterceptorService);
        injector.get(IRenderManagerService).registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        const commands = injector.get(ICommandService);
        [
            AddWorksheetMergeCommand,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeCommand,
            RemoveWorksheetMergeMutation,
            SetRangeValuesMutation,
            SetSelectionsOperation,
        ].forEach((command) => commands.registerCommand(command));
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it.each(['position', 'size', 'state'] as const)('refreshes %s after merge changes without reselecting the cell', async (refresh) => {
        const injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'merge-editor',
            name: 'Merge editor',
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    rowCount: 20,
                    columnCount: 10,
                    defaultColumnWidth: 100,
                    defaultRowHeight: 24,
                    cellData: {},
                },
            },
        });
        const render = injector.get(IRenderManagerService).createRender(workbook.getUnitId());
        injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        });
        render.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
        const range = { startRow: 11, startColumn: 5, endRow: 13, endColumn: 6 };
        const primary = workbook.getActiveSheet()!.getCellInfoInMergeData(11, 5);
        injector.get(SheetsSelectionsService).setSelections([{ range, primary, style: null }]);
        const bridge = injector.get(IEditorBridgeService);
        bridge.setEditCell({
            unitId: workbook.getUnitId(),
            sheetId: 'sheet1',
            scene: render.scene,
            engine: render.engine,
            primary,
        });
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        const commands = injector.get(ICommandService);
        const expectSize = (width: number, height: number) => {
            if (refresh === 'state') {
                bridge.refreshEditCellState();
            } else {
                bridge.refreshEditCellPosition(refresh === 'size');
            }
            const position = bridge.getEditCellLayout()!.position;
            expect({ width: position.endX - position.startX, height: position.endY - position.startY })
                .toEqual({ width, height });
        };

        await commands.executeCommand(AddWorksheetMergeCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: 'sheet1',
            selections: [range],
        });
        expectSize(200, 72);

        await commands.executeCommand(UndoCommand.id);
        expectSize(100, 24);
        await commands.executeCommand(RedoCommand.id);
        expectSize(200, 72);

        bridge.setEditCell({
            unitId: workbook.getUnitId(),
            sheetId: 'sheet1',
            scene: render.scene,
            engine: render.engine,
            primary: workbook.getActiveSheet()!.getCellInfoInMergeData(11, 5),
        });
        await commands.executeCommand(RemoveWorksheetMergeCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: 'sheet1',
            ranges: [range],
        });
        expectSize(100, 24);
        await commands.executeCommand(UndoCommand.id);
        expectSize(200, 72);
        await commands.executeCommand(RedoCommand.id);
        expectSize(100, 24);
    });
});
