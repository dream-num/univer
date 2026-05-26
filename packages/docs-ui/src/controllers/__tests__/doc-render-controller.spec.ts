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
import { DocumentFlavor } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocRenderController } from '../render-controllers/doc.render-controller';

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

        constructor(_key: string, _skeleton?: unknown, config?: { pageMarginLeft?: number; pageMarginTop?: number }) {
            this.pageMarginLeft = config?.pageMarginLeft ?? 0;
            this.pageMarginTop = config?.pageMarginTop ?? 0;
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
            constructor(..._args: unknown[]) { }
        },
        Viewport: class MockViewport {
            constructor(..._args: unknown[]) { }
            onMouseWheel() { }
        },
    };
});

function createControllerFixture() {
    const commandCallbacks: Array<(command: ICommandInfo) => void> = [];
    const skeleton = {
        calculate: vi.fn(),
        getSkeletonData: vi.fn(() => ({
            pages: [{
                pageWidth: 640,
                pageHeight: 900,
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
    const context = {
        unitId: 'doc-unit',
        unit: {
            getUnitId: vi.fn(() => 'doc-unit'),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
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
            runRenderLoop: vi.fn(),
            stopRenderLoop: vi.fn(),
            getCanvas: vi.fn(() => ({
                getCanvasEle: vi.fn(() => ({ style: {} })),
            })),
        },
        components: new Map(),
        activated$: new Subject<boolean>(),
    };
    const commandService = {
        onCommandExecuted: vi.fn((callback) => {
            commandCallbacks.push(callback);
            return { dispose: vi.fn() };
        }),
    };
    const pageLayoutService = {
        calculatePagePosition: vi.fn(),
    };
    const selectionManager = {
        refreshSelection: vi.fn(),
    };

    const Controller = DocRenderController as unknown as new (...args: unknown[]) => DocRenderController;
    new Controller(
        context,
        commandService,
        { __attachScrollEvent: vi.fn() },
        skeletonManager,
        {
            isEditor: vi.fn(() => false),
            getEditor: vi.fn(() => null),
        },
        {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => skeletonManager),
            })),
        },
        {
            getCurrentUnitOfType: vi.fn(() => ({
                getUnitId: vi.fn(() => 'doc-unit'),
            })),
        },
        pageLayoutService,
        selectionManager
    );

    return {
        commandCallbacks,
        pageLayoutService,
        selectionManager,
    };
}

describe('doc render controller', () => {
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
});
