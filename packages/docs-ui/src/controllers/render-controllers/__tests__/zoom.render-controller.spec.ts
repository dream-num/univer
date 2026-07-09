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

import { DocumentFlavor } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocZoomRenderController, shouldHandleDocWheelZoom } from '../zoom.render-controller';

const mockSceneScale = vi.hoisted(() => vi.fn());
const mockClearSelectedObjects = vi.hoisted(() => vi.fn());

vi.mock('../../../basics/component-tools', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../basics/component-tools')>();

    return {
        ...actual,
        neoGetDocObject: () => ({
            scene: {
                scale: mockSceneScale,
                getTransformer: () => ({
                    clearSelectedObjects: mockClearSelectedObjects,
                }),
            },
        }),
    };
});

describe('DocZoomRenderController', () => {
    beforeEach(() => {
        mockSceneScale.mockClear();
        mockClearSelectedObjects.mockClear();
    });

    it('handles wheel zoom intent for focused modern docs', () => {
        expect(shouldHandleDocWheelZoom({ ctrlKey: true, metaKey: false }, true, DocumentFlavor.MODERN)).toBe(true);
    });

    it('handles platform zoom modifier variants only while docs are focused', () => {
        expect(shouldHandleDocWheelZoom({ ctrlKey: false, metaKey: true }, true, DocumentFlavor.TRADITIONAL)).toBe(true);
        expect(shouldHandleDocWheelZoom({ ctrlKey: false, metaKey: false }, true, DocumentFlavor.TRADITIONAL)).toBe(false);
        expect(shouldHandleDocWheelZoom({ ctrlKey: true, metaKey: false }, false, DocumentFlavor.TRADITIONAL)).toBe(false);
    });

    it('applies composed view scale and immediately renders embedded docs while receiving user zoom', () => {
        const controller = Object.create(DocZoomRenderController.prototype) as DocZoomRenderController;
        const refreshSelection = vi.fn();
        const makeDirty = vi.fn();
        const render = vi.fn();
        Object.assign(controller, {
            _context: {
                unitId: 'doc-unit',
                scene: {
                    makeDirty,
                    render,
                },
            },
            _docViewScaleService: {
                getViewScale: vi.fn(() => 1.875),
            },
            _editorService: {
                isEditor: vi.fn(() => false),
            },
            _docPageLayoutService: {
                calculatePagePosition: vi.fn(),
            },
            _textSelectionManagerService: {
                refreshSelection,
            },
            _embedInteractionBoundaryService: {
                hasRecentInteraction: vi.fn(() => false),
            },
            _univerInstanceService: {
                getUnitCreateOptions: vi.fn(() => ({ embeddedRender: true, skipAutoRender: true })),
            },
        });

        controller.updateViewZoom(1.25);

        expect((controller as never as { _docViewScaleService: { getViewScale: ReturnType<typeof vi.fn> } })._docViewScaleService.getViewScale).toHaveBeenCalledWith(1.25);
        expect(mockSceneScale).toHaveBeenCalledWith(1.875, 1.875);
        expect(makeDirty).toHaveBeenCalled();
        expect(render).toHaveBeenCalled();
        expect(refreshSelection).toHaveBeenCalled();
    });

    it('does not force an immediate render for standalone docs', () => {
        const controller = Object.create(DocZoomRenderController.prototype) as DocZoomRenderController;
        const makeDirty = vi.fn();
        const render = vi.fn();
        Object.assign(controller, {
            _context: {
                unitId: 'doc-unit',
                scene: {
                    makeDirty,
                    render,
                },
            },
            _docViewScaleService: {
                getViewScale: vi.fn(() => 1.875),
            },
            _editorService: {
                isEditor: vi.fn(() => false),
            },
            _docPageLayoutService: {
                calculatePagePosition: vi.fn(),
            },
            _textSelectionManagerService: {
                refreshSelection: vi.fn(),
            },
            _embedInteractionBoundaryService: {
                hasRecentInteraction: vi.fn(() => false),
            },
            _univerInstanceService: {
                getUnitCreateOptions: vi.fn(() => undefined),
            },
        });

        controller.updateViewZoom(1.25);

        expect(mockSceneScale).toHaveBeenCalledWith(1.875, 1.875);
        expect(makeDirty).not.toHaveBeenCalled();
        expect(render).not.toHaveBeenCalled();
    });

    it('does not refresh host document selection while embed interaction is active', () => {
        const controller = Object.create(DocZoomRenderController.prototype) as DocZoomRenderController;
        const refreshSelection = vi.fn();
        Object.assign(controller, {
            _context: {
                unitId: 'doc-unit',
                scene: {
                    makeDirty: vi.fn(),
                    render: vi.fn(),
                },
            },
            _docViewScaleService: {
                getViewScale: vi.fn(() => 1.875),
            },
            _editorService: {
                isEditor: vi.fn(() => false),
            },
            _docPageLayoutService: {
                calculatePagePosition: vi.fn(),
            },
            _textSelectionManagerService: {
                refreshSelection,
            },
            _embedInteractionBoundaryService: {
                hasRecentInteraction: vi.fn(() => true),
            },
            _univerInstanceService: {
                getUnitCreateOptions: vi.fn(() => ({ embeddedRender: true })),
            },
        });

        controller.updateViewZoom(1.25);

        expect(refreshSelection).not.toHaveBeenCalled();
    });
});
