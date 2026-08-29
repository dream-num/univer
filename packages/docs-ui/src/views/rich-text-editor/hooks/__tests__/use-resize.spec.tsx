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

/**
 * @vitest-environment jsdom
 */

import type { Editor } from '../../../../services/editor/editor';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { resizeEditor } from '../use-resize';

describe('useResize', () => {
    it('makes the document hit area available on the first editor layout', () => {
        const updateDocumentDataPageSize = vi.fn();
        const sceneTransform = vi.fn();
        const documentResize = vi.fn();
        const documentTranslate = vi.fn();
        const backgroundTranslate = vi.fn();
        const engineResize = vi.fn();
        const editor = {
            getBoundingClientRect: () => ({ width: 320, height: 96 }),
            getSelectionRanges: () => [],
            input$: new Subject(),
            render: {
                components: { get: () => ({ translate: backgroundTranslate }) },
                engine: {
                    getCanvas: () => ({ setPixelRatio: vi.fn() }),
                    resizeBySize: engineResize,
                },
                mainComponent: { resize: documentResize, translate: documentTranslate },
                scene: { transformByState: sceneTransform },
                with: () => ({
                    getViewModel: () => ({
                        getDataModel: () => ({ updateDocumentDataPageSize }),
                    }),
                }),
            },
        } as unknown as Editor;

        resizeEditor(editor, false);

        expect(updateDocumentDataPageSize).toHaveBeenCalledWith(320, Infinity);
        expect(engineResize).toHaveBeenCalledWith(320, 96);
        expect(sceneTransform).toHaveBeenCalledWith({ width: 320, height: 96 });
        expect(documentResize).toHaveBeenCalledWith(320, 96);
        expect(documentTranslate).toHaveBeenCalledWith(0, 0);
        expect(backgroundTranslate).toHaveBeenCalledWith(0, 0);
    });

    it('uses the explicit layout size when the editor DOM is CSS transformed', () => {
        const updateDocumentDataPageSize = vi.fn();
        const sceneTransform = vi.fn();
        const documentResize = vi.fn();
        const engineResize = vi.fn();
        const setPixelRatio = vi.fn();
        const editor = {
            getBoundingClientRect: () => ({ width: 24, height: 480 }),
            getSelectionRanges: () => [],
            input$: new Subject(),
            render: {
                components: { get: () => ({ translate: vi.fn() }) },
                engine: {
                    getCanvas: () => ({ setPixelRatio }),
                    resizeBySize: engineResize,
                },
                mainComponent: { resize: documentResize, translate: vi.fn() },
                scene: { transformByState: sceneTransform },
                with: () => ({
                    getViewModel: () => ({
                        getDataModel: () => ({ updateDocumentDataPageSize }),
                    }),
                }),
            },
        } as unknown as Editor;

        resizeEditor(editor, false, { width: 480, height: 24 }, 2);

        expect(updateDocumentDataPageSize).toHaveBeenCalledWith(480, Infinity);
        expect(engineResize).toHaveBeenCalledWith(480, 24);
        expect(setPixelRatio).toHaveBeenCalledWith(2);
        expect(sceneTransform).toHaveBeenCalledWith({ width: 480, height: 24 });
        expect(documentResize).toHaveBeenCalledWith(480, 24);
    });

    it('can oversize the canvas without changing the document reflow width', () => {
        const updateDocumentDataPageSize = vi.fn();
        const documentResize = vi.fn();
        const engineResize = vi.fn();
        const editor = {
            getBoundingClientRect: () => ({ width: 204, height: 30 }),
            getSelectionRanges: () => [],
            input$: new Subject(),
            render: {
                components: { get: () => ({ translate: vi.fn() }) },
                engine: {
                    getCanvas: () => ({ setPixelRatio: vi.fn() }),
                    resizeBySize: engineResize,
                },
                mainComponent: { resize: documentResize, translate: vi.fn() },
                scene: { transformByState: vi.fn() },
                with: () => ({
                    getViewModel: () => ({
                        getDataModel: () => ({ updateDocumentDataPageSize }),
                    }),
                }),
            },
        } as unknown as Editor;

        resizeEditor(
            editor,
            false,
            { width: 240, height: 30 },
            1,
            { width: 204, height: 30 }
        );

        expect(engineResize).toHaveBeenCalledWith(240, 30);
        expect(updateDocumentDataPageSize).toHaveBeenCalledWith(204, Infinity);
        expect(documentResize).toHaveBeenCalledWith(204, 30);
    });
});
