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
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_FX_BAR_EDITOR,
} from '@univerjs/core';
import { CoverContentCommand, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { FormulaEditorController } from '../formula-editor.controller';

function createController() {
    const fxBtnClick$ = new Subject<void>();
    const position = { width: 240, height: 40 };
    let focusEditorId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    const contextValues = new Map<string, unknown>([
        [FOCUSING_EDITOR_BUT_HIDDEN, true],
        [EDITOR_ACTIVATED, false],
        [FOCUSING_FX_BAR_EDITOR, false],
    ]);
    const scrollBar = { dispose: vi.fn() };
    const viewport = {
        getScrollBar: vi.fn(() => scrollBar),
        scrollToViewportPos: vi.fn(),
        resetCanvasSizeAndUpdateScroll: vi.fn(),
    };
    const scene = { transformByState: vi.fn(), getViewport: vi.fn((key) => key === VIEWPORT_KEY.VIEW_MAIN ? viewport : null) };
    const mainComponent = { resize: vi.fn() };
    const formulaDoc = {
        getBody: vi.fn(() => ({ dataStream: 'SUM(A1:A3)\r\n' })),
        getSnapshot: vi.fn(() => ({ documentStyle: { marginTop: 4, marginBottom: 6 } })),
        updateDocumentDataPageSize: vi.fn(),
    };
    const render = {
        scene,
        mainComponent,
        with: vi.fn(() => ({
            getSkeleton: vi.fn(() => ({
                getActualSize: vi.fn(() => ({ actualHeight: 24 })),
            })),
        })),
    };
    const controller = Object.create(FormulaEditorController.prototype) as any;
    controller.dispose$ = new Subject<void>();
    controller._formulaEditorManagerService = {
        fxBtnClick$,
        getPosition: vi.fn(() => position),
        position$: new Subject(),
    };
    controller._renderManagerService = {
        getRenderById: vi.fn((unitId: string) => unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? render : null),
    };
    controller._univerInstanceService = {
        setCurrentUnitForType: vi.fn(),
        getUnit: vi.fn(() => formulaDoc),
    };
    controller._editorBridgeService = { isVisible: vi.fn(() => ({ visible: false })) };
    controller._commandService = { syncExecuteCommand: vi.fn() };
    controller._contextService = {
        getContextValue: vi.fn((key: string) => contextValues.get(key)),
        setContextValue: vi.fn((key: string, value: unknown) => contextValues.set(key, value)),
    };
    controller._textSelectionManagerService = { replaceDocRanges: vi.fn() };
    controller._editorService = {
        getFocusEditor: vi.fn(() => ({ getEditorId: () => focusEditorId })),
    };

    return {
        controller,
        contextValues,
        fxBtnClick$,
        formulaDoc,
        mainComponent,
        scene,
        setFocusEditorId: (editorId: string) => {
            focusEditorId = editorId;
        },
        scrollBar,
        viewport,
    };
}

describe('FormulaEditorController business methods', () => {
    it('resizes the formula editor and resets scroll when content fits in the formula bar', () => {
        const { controller, mainComponent, scene, scrollBar, viewport } = createController();

        controller.autoScroll();

        expect(scene.transformByState).toHaveBeenCalledWith({ width: 240, height: 34 });
        expect(mainComponent.resize).toHaveBeenCalledWith(240, 34);
        expect(viewport.scrollToViewportPos).toHaveBeenCalledWith({ viewportScrollX: 0, viewportScrollY: 0 });
        expect(scrollBar.dispose).toHaveBeenCalled();
    });

    it('turns hidden formula-bar content into a formula when fx button is clicked', () => {
        const { controller, fxBtnClick$ } = createController();
        const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
        const raf = vi.fn((cb: FrameRequestCallback) => {
            cb(0);
            return 1;
        });
        vi.stubGlobal('requestAnimationFrame', raf);

        controller._listenFxBtnClick();
        fxBtnClick$.next();

        expect(controller._univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.PointerDown,
            unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        });
        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(CoverContentCommand.id, {
            unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: { dataStream: '=SUM(A1:A3)' },
            segmentId: '',
            textRanges: [{ startOffset: 11, endOffset: 11 }],
        });
        expect(controller._textSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith([], {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });
        expect(controller._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_FX_BAR_EDITOR, true);

        vi.stubGlobal('requestAnimationFrame', originalRequestAnimationFrame);
    });

    it('keeps formula bar focus while formula range picking is active', () => {
        const { contextValues, controller, setFocusEditorId } = createController();
        contextValues.set(FOCUSING_FX_BAR_EDITOR, true);
        contextValues.set(EDITOR_ACTIVATED, true);
        setFocusEditorId(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);

        controller._syncFxBarFocusContext();

        expect(contextValues.get(FOCUSING_FX_BAR_EDITOR)).toBe(true);
        expect(controller._contextService.setContextValue).not.toHaveBeenCalledWith(FOCUSING_FX_BAR_EDITOR, false);
    });

    it('clears formula bar focus when focus leaves outside formula range picking', () => {
        const { contextValues, controller, setFocusEditorId } = createController();
        contextValues.set(FOCUSING_FX_BAR_EDITOR, true);
        contextValues.set(EDITOR_ACTIVATED, false);
        setFocusEditorId(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);

        controller._syncFxBarFocusContext();

        expect(contextValues.get(FOCUSING_FX_BAR_EDITOR)).toBe(false);
    });
});
