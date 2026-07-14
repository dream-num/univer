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
    IContextService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../editor-bridge.service';

function createService(options?: { hasFocusEditor?: boolean }) {
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
            getUnit: vi.fn((unitId: string, type?: UniverInstanceType) => unitId === 'unit-1'
                ? mocks.univerInstanceService.getCurrentUnitOfType(type as never)
                : null),
        },
        editorService: {
            getFocusEditor: vi.fn(() => (options?.hasFocusEditor ? { id: 'existing' } : null)),
            focus: vi.fn(),
        },
        contextService: {
            setContextValue: vi.fn(),
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
    }

    class TestEditorService {
        getFocusEditor = mocks.editorService.getFocusEditor;
        focus = mocks.editorService.focus;
    }

    class TestContextService {
        setContextValue = mocks.contextService.setContextValue;
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
            getCellRaw: vi.fn(() => ({ v: '=SUM(A1:A2)' })),
            getCell: vi.fn(() => ({ isInArrayFormulaRange: true })),
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
            with: () => ({
                getViewPort: () => ({ viewportKey: 'main' }),
            }),
        } as never);

        service.setEditCell(createPositionedEditCellParam());

        expect(service.getEditLocation()).toEqual(expect.objectContaining({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 1,
            column: 2,
            editorUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
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
            with: () => ({
                getViewPort: () => ({ viewportKey: 'embedded-main' }),
            }),
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
