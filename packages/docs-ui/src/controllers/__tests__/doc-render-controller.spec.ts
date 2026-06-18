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

import type { ICommandInfo } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DocumentFlavor } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_VIEW_KEY } from '../../basics/docs-view-key';
import { DocRenderController } from '../render-controllers/doc.render-controller';

const mockScrollBarProps = vi.hoisted(() => [] as unknown[]);

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();
    const PageLayoutType = {
        VERTICAL: 0,
        HORIZONTAL: 1,
    };

    class MockDocComponent {
        width = 0;
        height = 0;
        pageMarginLeft: number;
        pageMarginTop: number;
        pageLayoutType = PageLayoutType.VERTICAL;
        zIndex = 0;

        fillColors: unknown[] | null = null;

        constructor(_key: string, _skeleton?: unknown, config?: { pageMarginLeft?: number; pageMarginTop?: number; backgroundFillColor?: string; pageFillColor?: string; pageStrokeColor?: string; marginStrokeColor?: string }) {
            this.pageMarginLeft = config?.pageMarginLeft ?? 0;
            this.pageMarginTop = config?.pageMarginTop ?? 0;
            this.fillColors = [
                config?.backgroundFillColor,
                config?.pageFillColor,
                config?.pageStrokeColor,
                config?.marginStrokeColor,
            ];
        }

        changeSkeleton() {
            return this;
        }

        resize(width: number, height: number) {
            this.width = width;
            this.height = height;
            return this;
        }

        makeDirty() {
            return this;
        }

        setFillColors(...colors: unknown[]) {
            this.fillColors = colors;
            return this;
        }
    }

    return {
        ...actual,
        DOCS_COMPONENT_BACKGROUND_LAYER_INDEX: 0,
        DocBackground: MockDocComponent,
        Documents: MockDocComponent,
        IRenderManagerService: () => undefined,
        Layer: class MockLayer {
            constructor(..._args: unknown[]) { }
        },
        PageLayoutType,
        ScrollBar: class MockScrollBar {
            constructor(...args: unknown[]) {
                mockScrollBarProps.push(args[1]);
            }
        },
        Viewport: class MockViewport {
            constructor(..._args: unknown[]) { }
            onMouseWheel() { }
        },
    };
});

function createControllerFixture(options?: {
    documentFlavor?: DocumentFlavor;
    fitToWidth?: {
        align?: 'center' | 'start';
        mode?: 'none' | 'fit-width';
        target?: 'viewport' | 'container';
    };
    pendingEditorBackgroundColor?: string | null;
    pages?: Array<Record<string, unknown>>;
    unitId?: string;
}) {
    mockScrollBarProps.length = 0;
    const commandCallbacks: Array<(command: ICommandInfo) => void> = [];
    const darkMode$ = new Subject<boolean>();
    const canvasElement = { style: {} as Record<string, string> };
    const canvasColorService = {
        getRenderColor: vi.fn((color: string) => color),
    };
    const skeleton = {
        calculate: vi.fn(),
        getSkeletonData: vi.fn(() => ({
            pages: options?.pages ?? [{
                pageWidth: 640,
                pageHeight: 900,
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        })),
        getViewModel: vi.fn(() => ({
            getDataModel: vi.fn(() => ({
                getSnapshot: vi.fn(() => ({ disabled: false })),
            })),
        })),
    };
    const skeletonManager = {
        currentSkeletonBefore$: new Subject(),
        getSkeleton: vi.fn(() => skeleton),
    };
    const unitId = options?.unitId ?? 'doc-unit';
    const context = {
        unitId,
        unit: {
            getUnitId: vi.fn(() => unitId),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: options?.documentFlavor ?? DocumentFlavor.TRADITIONAL,
                },
            })),
        },
        scene: {
            attachControl: vi.fn(),
            onMouseWheel$: { subscribeEvent: vi.fn() },
            addLayer: vi.fn(),
            addObjects: vi.fn(),
            enableLayerCache: vi.fn(),
            resize: vi.fn(),
        },
        engine: {
            canvasColorService,
            runRenderLoop: vi.fn(),
            stopRenderLoop: vi.fn(),
            getCanvas: vi.fn(() => ({
                getCanvasEle: vi.fn(() => canvasElement),
            })),
        },
        mainComponent: undefined as { width: number } | undefined,
        components: new Map(),
        activated$: new Subject<boolean>(),
    };
    const commandService = {
        onCommandExecuted: vi.fn((callback) => {
            commandCallbacks.push(callback);
            return { dispose: vi.fn() };
        }),
    };
    const pendingEditorRenderConfig = options?.pendingEditorBackgroundColor === undefined
        ? null
        : {
            canvasStyle: options.pendingEditorBackgroundColor == null
                ? {}
                : { backgroundColor: options.pendingEditorBackgroundColor },
        };
    const editorRenderConfig = pendingEditorRenderConfig;
    const pageLayoutService = {
        calculatePagePosition: vi.fn(),
    };
    const selectionManager = {
        refreshSelection: vi.fn(),
    };

    const Controller = DocRenderController as unknown as new (...args: unknown[]) => DocRenderController;
    const controller = new Controller(
        context,
        commandService,
        { __attachScrollEvent: vi.fn() },
        skeletonManager,
        {
            isEditor: vi.fn(() => editorRenderConfig != null),
            getEditor: vi.fn(() => null),
            getEditorRenderConfig: vi.fn(() => editorRenderConfig),
        },
        {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => skeletonManager),
            })),
        },
        {
            getCurrentUnitOfType: vi.fn(() => ({
                getUnitId: vi.fn(() => unitId),
            })),
        },
        pageLayoutService,
        selectionManager,
        {
            getOptions: vi.fn(() => ({
                mode: options?.fitToWidth?.mode ?? 'none',
                target: options?.fitToWidth?.target ?? 'viewport',
                align: options?.fitToWidth?.align ?? 'center',
            })),
        },
        { darkMode$ }
    );

    return {
        commandCallbacks,
        controller,
        context,
        canvasElement,
        canvasColorService,
        skeletonManager,
        pageLayoutService,
        selectionManager,
    };
}

describe('doc render controller', () => {
    it('disables only the horizontal scrollbar for container-fitted embedded docs', () => {
        createControllerFixture({
            fitToWidth: {
                mode: 'fit-width',
                target: 'container',
                align: 'start',
            },
        });

        expect(mockScrollBarProps[0]).toMatchObject({
            enableHorizontal: false,
        });
    });

    it('keeps the horizontal scrollbar for normal docs', () => {
        createControllerFixture();

        expect(mockScrollBarProps[0]).toMatchObject({
            enableHorizontal: true,
        });
    });

    it('refreshes page layout and selection after rich text mutations resize the document', () => {
        const { commandCallbacks, pageLayoutService, selectionManager } = createControllerFixture();

        commandCallbacks[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-unit',
                actions: [],
            },
        } as unknown as ICommandInfo);

        expect(pageLayoutService.calculatePagePosition).toHaveBeenCalledTimes(1);
        expect(selectionManager.refreshSelection).toHaveBeenCalledTimes(1);
    });

    it('keeps modern doc width anchored to page width when a table grows wider than the text column', () => {
        const { context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.MODERN,
            pages: [{
                pageWidth: 960,
                pageHeight: Number.POSITIVE_INFINITY,
                width: 960,
                height: 640,
                marginLeft: 66.66666666666667,
                marginRight: 66.66666666666667,
                marginTop: 72,
                marginBottom: 72,
                skeDrawings: new Map(),
                skeTables: new Map([['table-1', {
                    left: 0,
                    top: 180,
                    width: 1254,
                    height: 240,
                }]]),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(context.mainComponent?.width).toBe(960);
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { width: number }).width).toBe(960);
    });

    it('keeps internal editor doc background transparent before the render config is registered', () => {
        const { canvasElement, context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            pages: [{
                pageWidth: 300,
                pageHeight: 80,
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(canvasElement.style.backgroundColor).toBe('transparent');
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { fillColors: unknown[] }).fillColors).toEqual([
            'transparent',
            'transparent',
            'transparent',
            'transparent',
        ]);
    });

    it('keeps editor doc background transparent when the host provides a surface color', () => {
        const { canvasElement, context, skeletonManager } = createControllerFixture({
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            pendingEditorBackgroundColor: '#fff',
            pages: [{
                pageWidth: 300,
                pageHeight: 80,
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        });

        skeletonManager.currentSkeletonBefore$.next(skeletonManager.getSkeleton());

        expect(canvasElement.style.backgroundColor).toBe('#fff');
        expect((context.components.get(DOCS_VIEW_KEY.BACKGROUND) as { fillColors: unknown[] }).fillColors).toEqual([
            'transparent',
            'transparent',
            'transparent',
            'transparent',
        ]);
    });
});
