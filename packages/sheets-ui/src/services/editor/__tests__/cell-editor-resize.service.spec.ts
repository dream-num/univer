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
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    HorizontalAlign,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocalUndoRedoService,
    ThemeService,
    UniverInstanceService,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../../editor-bridge.service';
import { EmbedFloatingGeometryService } from '../../sheet-embed-integration.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { CellEditorManagerService, ICellEditorManagerService } from '../cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../cell-editor-resize.service';

class TestLayoutService {
    getContentElement() {
        return {
            getBoundingClientRect: () => ({ left: 10, top: 20 }),
        };
    }
}

class TestCellEditorManagerService {
    private _state: Record<string, number | boolean> | null = null;

    setState(state: Record<string, number | boolean>) {
        this._state = state;
    }

    getState() {
        return this._state;
    }
}

class TestEditorBridgeService {
    refreshCount = 0;

    readonly editCellState = {
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        row: 1,
        column: 1,
        position: {
            startX: 100,
            startY: 60,
            endX: 160,
            endY: 84,
        },
        canvasOffset: {
            left: 0,
            top: 0,
        },
        scaleX: 1,
        scaleY: 1,
        documentLayoutObject: {
            textRotation: undefined,
            wrapStrategy: WrapStrategy.UNSPECIFIED,
            verticalAlign: VerticalAlign.TOP,
            horizontalAlign: HorizontalAlign.LEFT,
            paddingData: {
                l: 4,
                r: 6,
                t: 3,
                b: 5,
            },
            fill: '#fff',
        },
    };

    getEditCellState() {
        return this.editCellState;
    }

    isVisible() {
        return { visible: true };
    }

    refreshEditCellPosition() {
        this.refreshCount += 1;
    }

    getCurrentEditorId() {
        return DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    }
}

class TestUniverInstanceService {
    readonly documentModel = {
        pageSize: 0,
        margin: {},
        renderConfig: {},
        updateDocumentDataPageSize: (pageSize: number) => {
            this.documentModel.pageSize = pageSize;
        },
        updateDocumentDataMargin: (margin: Record<string, number | undefined>) => {
            this.documentModel.margin = margin;
        },
        updateDocumentRenderConfig: (renderConfig: Record<string, unknown>) => {
            this.documentModel.renderConfig = renderConfig;
        },
    };

    getUnit(unitId: string) {
        return unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY ? this.documentModel : null;
    }

    getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET
            ? { getUnitId: () => 'unit-1' }
            : null;
    }
}

class TestUniverInstanceServiceWithDifferentCurrent extends TestUniverInstanceService {
    override getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET
            ? { getUnitId: () => 'host-or-other-sheet' }
            : null;
    }
}

class TestRenderManagerService {
    readonly sheetCanvasElement = {
        style: { width: '800px' },
        getBoundingClientRect: () => ({ left: 30, top: 50, width: 800, height: 600 }),
    };

    readonly sheetEngine = {
        width: 800,
        getCanvasElement: () => this.sheetCanvasElement,
    };

    readonly editorEngine = {
        resized: null as null | { width: number; height: number },
        resizeBySize: (width: number, height: number) => {
            this.editorEngine.resized = { width, height };
        },
    };

    readonly editorDocument = {
        resized: null as null | { width: number; height: number },
        resize: (width: number, height: number) => {
            this.editorDocument.resized = { width, height };
        },
    };

    readonly editorScene = {
        transformed: null as null | Record<string, number>,
        background: null as null | unknown,
        getViewport: () => ({
            getScrollBar: () => null,
            scrollToViewportPos: () => { },
        }),
        getObject: () => null,
        addObjects: (objects: unknown[]) => {
            this.editorScene.background = objects[0];
        },
        getPrecisionScale: () => ({ scaleX: 1, scaleY: 1 }),
        transformByState: (state: Record<string, number>) => {
            this.editorScene.transformed = state;
        },
    };

    readonly docSkeleton = {
        calculate: () => { },
        resetInitialWidth: () => { },
        getActualSize: () => ({ actualWidth: 120, actualHeight: 36 }),
    };

    getRenderById(unitId: string) {
        if (unitId === 'unit-1') {
            return {
                engine: this.sheetEngine,
                with: (dependency: unknown) => {
                    if (dependency === SheetSkeletonManagerService) {
                        return {
                            getSkeletonParam: () => ({
                                skeleton: {
                                    getCellWithCoordByIndex: () => ({
                                        mergeInfo: {
                                            startX: 100,
                                            startY: 60,
                                            endX: 160,
                                            endY: 84,
                                        },
                                    }),
                                },
                            }),
                        };
                    }
                },
            };
        }

        if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            return {
                mainComponent: this.editorDocument,
                scene: this.editorScene,
                engine: this.editorEngine,
                components: new Map(),
                with: (dependency: unknown) => {
                    if (dependency === DocSkeletonManagerService) {
                        return {
                            getSkeleton: () => this.docSkeleton,
                        };
                    }
                },
            };
        }
    }
}

class TestCachedWidthRenderManagerService extends TestRenderManagerService {
    private _initialWidth = 696;

    override readonly docSkeleton = {
        calculate: () => { },
        resetInitialWidth: () => {
            this._initialWidth = 0;
        },
        getActualSize: () => {
            const actualWidth = Math.max(this._initialWidth, 120);
            this._initialWidth = actualWidth;

            return { actualWidth, actualHeight: 36 };
        },
    };
}

class TestViewportEdgeRenderManagerService extends TestRenderManagerService {
    override readonly sheetCanvasElement = {
        style: { width: '1192px' },
        getBoundingClientRect: () => ({ left: 30, top: 50, width: 1192, height: 773 }),
    };

    override readonly sheetEngine = {
        width: 1192,
        getCanvasElement: () => this.sheetCanvasElement,
    };
}

describe('SheetCellEditorResizeService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('does not resize anything when no cell editor is active', () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        let callbackCalled = false;
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: CellEditorManagerService }]);
        injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);

        injector.get(SheetCellEditorResizeService).fitTextSize(() => {
            callbackCalled = true;
        });

        expect(callbackCalled).toBe(false);
    });

    it('expands the active cell editor to fit rendered text content', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);

        let callbackCalled = false;
        injector.get(SheetCellEditorResizeService).fitTextSize(() => {
            callbackCalled = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        const renderManager = injector.get(IRenderManagerService) as unknown as TestRenderManagerService;
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            startX: 120,
            startY: 90,
            endX: 250,
            endY: 134,
            show: true,
        }));
        expect(renderManager.editorDocument.resized).toEqual({ width: 130, height: 44 });
        expect(renderManager.editorEngine.resized).toEqual({ width: 130, height: 44 });
        expect(callbackCalled).toBe(true);
    });

    it('does not use stale maximum skeleton width when fitting the active cell editor', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestCachedWidthRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);

        injector.get(SheetCellEditorResizeService).fitTextSize();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            endX: 250,
            show: true,
        }));
    });

    it('positions embedded sheet editors against the child content root', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([EmbedFloatingGeometryService]);
        injector.add([SheetCellEditorResizeService]);
        const geometryService = injector.get(EmbedFloatingGeometryService);
        geometryService.register({
            embedId: 'embed-1',
            childUnitId: 'unit-1',
            root: {} as HTMLElement,
            contentRoot: {
                getBoundingClientRect: () => ({ left: 30, top: 50 }),
            } as HTMLElement,
        });

        injector.get(SheetCellEditorResizeService).fitTextSize();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            startX: 120,
            startY: 90,
            endX: 250,
            endY: 134,
            show: true,
        }));
    });

    it('uses the editing unit renderer even when the current sheet unit is different', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceServiceWithDifferentCurrent as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);

        injector.get(SheetCellEditorResizeService).fitTextSize();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            startX: 120,
            startY: 90,
            endX: 250,
            endY: 134,
            show: true,
        }));
    });

    it('refits the editor when its container size drifts from the edited cell', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);
        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        editorManager.setState({
            startX: 100,
            startY: 60,
            endX: 120,
            endY: 70,
            show: true,
        });

        let callbackCalled = false;
        injector.get(SheetCellEditorResizeService).resizeCellEditor(() => {
            callbackCalled = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorBridgeService = injector.get(IEditorBridgeService) as unknown as TestEditorBridgeService;
        expect(editorBridgeService.refreshCount).toBeGreaterThanOrEqual(2);
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            endX: 250,
            endY: 134,
            show: true,
        }));
        expect(callbackCalled).toBe(true);
    });

    it('positions expanded editor content according to cell alignment', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);
        const editorBridge = injector.get(IEditorBridgeService) as unknown as TestEditorBridgeService;
        editorBridge.editCellState.documentLayoutObject.verticalAlign = VerticalAlign.MIDDLE;
        editorBridge.editCellState.documentLayoutObject.horizontalAlign = HorizontalAlign.RIGHT;

        injector.get(SheetCellEditorResizeService).fitTextSize();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        expect(editorManager.getState()).toEqual(expect.objectContaining({
            startX: 50,
            startY: 90,
            endX: 180,
            show: true,
        }));
    });

    it('keeps a centered merged-cell editor at least as wide as the edited merged range', async () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
        injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
        injector.add([IRenderManagerService, { useClass: TestViewportEdgeRenderManagerService as never }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);
        const editorBridge = injector.get(IEditorBridgeService) as unknown as TestEditorBridgeService;
        editorBridge.editCellState.position = {
            startX: 426,
            startY: 90,
            endX: 1206,
            endY: 122,
        };
        editorBridge.editCellState.documentLayoutObject.horizontalAlign = HorizontalAlign.CENTER;

        injector.get(SheetCellEditorResizeService).fitTextSize();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const editorManager = injector.get(ICellEditorManagerService) as unknown as TestCellEditorManagerService;
        const state = editorManager.getState();
        expect(state!.endX as number - (state!.startX as number)).toBe(780);
    });
});
