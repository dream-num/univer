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

import { RichTextEditingMutation } from '@univerjs/docs';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocEditorBridgeController } from '../doc-editor-bridge.controller';

function createController(options: { cancelResize?: boolean; sheetEditor?: boolean; focusEditorId?: string | null } = {}) {
    const blur$ = new Subject<void>();
    const onBlur$ = new Subject<void>();
    const commandHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const scene = { transformByState: vi.fn() };
    const mainComponent = { resize: vi.fn() };
    const editor = {
        getEditorId: vi.fn(() => 'editor-1'),
        cancelDefaultResizeListener: options.cancelResize ?? false,
        render: { scene, mainComponent },
        getBoundingClientRect: vi.fn(() => ({ width: 120, height: 80 })),
        params: { scrollBar: false },
        isSheetEditor: vi.fn(() => options.sheetEditor ?? false),
    };
    const editorService = {
        getAllEditor: vi.fn(() => [editor]),
        getEditor: vi.fn(() => editor),
        isSheetEditor: vi.fn((unitId: string) => unitId === 'sheet-editor'),
        blur$,
        blur: vi.fn(),
        getFocusEditor: vi.fn(() => options.focusEditorId ? { getEditorId: () => options.focusEditorId } : null),
    };
    const skeleton = {
        calculate: vi.fn(),
        getActualSize: vi.fn(() => ({ actualWidth: 150, actualHeight: 90 })),
    };
    const canvasEle = document.createElement('canvas');
    const controller = new DocEditorBridgeController(
        { unitId: 'editor-1' } as never,
        {
            getUnit: vi.fn(() => ({
                getSnapshot: () => ({
                    documentStyle: {
                        marginTop: 10,
                        marginBottom: 20,
                        marginLeft: 5,
                        marginRight: 15,
                    },
                }),
            })),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject({ getUnitId: () => 'sheet-1' })),
        } as never,
        editorService as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
        } as never,
        {
            blur: vi.fn(),
            onBlur$,
        } as never,
        {
            getSkeleton: vi.fn(() => skeleton),
        } as never,
        {
            getRenderById: vi.fn(() => ({
                engine: {
                    getCanvas: () => ({
                        getCanvasEle: () => canvasEle,
                    }),
                },
            })),
        } as never
    );

    return {
        controller,
        editor,
        scene,
        mainComponent,
        skeleton,
        editorService,
        blur$,
        onBlur$,
        commandHandlers,
        canvasEle,
    };
}

describe('DocEditorBridgeController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('resizes editor scene and main component from skeleton content plus document margins', () => {
        const { controller, scene, mainComponent, skeleton } = createController();

        expect(skeleton.calculate).toHaveBeenCalled();
        expect(scene.transformByState).toHaveBeenCalledWith({ width: 170, height: 120 });
        expect(mainComponent.resize).toHaveBeenCalledWith(170, 120);

        controller.dispose();
    });

    it('refreshes editor size after rich text edits for the same text editor', () => {
        const { controller, scene, commandHandlers } = createController();
        scene.transformByState.mockClear();

        commandHandlers[0]({ id: RichTextEditingMutation.id, params: { unitId: 'other-editor' } });
        commandHandlers[0]({ id: RichTextEditingMutation.id, params: { unitId: 'sheet-editor' } });
        commandHandlers[0]({ id: RichTextEditingMutation.id, params: { unitId: 'editor-1' } });

        expect(scene.transformByState).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('bridges blur state and keeps formula helper mouse events from stealing focus', () => {
        const { controller, editorService, blur$, onBlur$, canvasEle } = createController();
        const windowStop = vi.fn();
        const canvasStop = vi.fn();
        const formulaHelp = document.createElement('div');
        formulaHelp.className = 'univer-formula-help';
        document.body.appendChild(formulaHelp);

        blur$.next();
        onBlur$.next();
        formulaHelp.dispatchEvent(Object.assign(new MouseEvent('mousedown', { bubbles: true }), { stopPropagation: windowStop }));
        canvasEle.dispatchEvent(Object.assign(new MouseEvent('mousedown', { bubbles: true }), {
            stopPropagation: canvasStop,
        }));

        expect(editorService.blur).toHaveBeenCalled();
        expect(windowStop).toHaveBeenCalled();
        expect(canvasStop).toHaveBeenCalled();

        document.body.removeChild(formulaHelp);
        controller.dispose();
    });

    it('skips default resize when editor opts out', () => {
        const { controller, scene, mainComponent } = createController({ cancelResize: true });

        expect(scene.transformByState).not.toHaveBeenCalled();
        expect(mainComponent.resize).not.toHaveBeenCalled();

        controller.dispose();
    });
});
