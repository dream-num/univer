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

// @vitest-environment jsdom

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Injector } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { describe, expect, it, vi } from 'vitest';
import { isEventTargetInSameFormulaEmbedInteractionBoundary } from '../../formula-embed-integration.service';
import { focusFormulaEditor, hasActiveFormulaEmbedInteraction, shouldRefocusFormulaEditorOnMouseUp } from '../use-focus';

describe('use-focus regression scenarios', () => {
    it('does not rewrite editor selections while doc pointer selection is in progress', () => {
        const editorService = {
            focus: vi.fn(),
        };
        const editor = {
            getEditorId: vi.fn(() => 'editor-1'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: 'abc\r\n' } })),
            docSelectionRenderService: {
                isOnPointerEvent: true,
                focus: vi.fn(),
            },
        };

        const injector = new Injector();
        injector.add([IEditorService, { useValue: { ...editorService, getEditor: () => editor } as never }]);
        try {
            const service = injector.get(IEditorService);
            focusFormulaEditor(service, service.getEditor('editor-1')!);
            expect(editor.setSelectionRanges).not.toHaveBeenCalled();
        } finally {
            injector.dispose();
        }
    });

    it('does not refocus the formula editor on mouse-up when the editor is already focused', () => {
        expect(shouldRefocusFormulaEditorOnMouseUp({
            isFocusing: true,
            isPointerSelecting: false,
        })).toBe(false);
    });

    it('does not refocus the formula editor while pointer text selection is active', () => {
        expect(shouldRefocusFormulaEditorOnMouseUp({
            isFocusing: false,
            isPointerSelecting: true,
        })).toBe(false);
    });

    it('refocuses the formula editor on mouse-up only when focus was lost and no pointer selection is active', () => {
        expect(shouldRefocusFormulaEditorOnMouseUp({
            isFocusing: false,
            isPointerSelecting: false,
        })).toBe(true);
    });

    it('treats sheet range selection inside the same embed owner as an active formula interaction', () => {
        const block = document.createElement('div');
        const editorHost = document.createElement('div');
        const sheetCanvas = document.createElement('canvas');
        block.setAttribute('data-embed-interaction-boundary-owner', 'embed-1');
        block.append(editorHost, sheetCanvas);
        document.body.appendChild(block);

        sheetCanvas.tabIndex = -1;
        sheetCanvas.focus();

        expect(isEventTargetInSameFormulaEmbedInteractionBoundary(editorHost, sheetCanvas)).toBe(true);
        expect(hasActiveFormulaEmbedInteraction(editorHost)).toBe(true);

        block.remove();
    });
});

it.each([DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY])('focuses its own formula input when another instance has editor %s', (editorId) => {
    const injector = new Injector();
    const leftInput = document.createElement('div');
    const rightInput = document.createElement('div');
    for (const input of [leftInput, rightInput]) {
        input.id = `__editor_${editorId}`;
        input.tabIndex = -1;
        document.body.appendChild(input);
    }
    const editor = {
        getEditorId: () => editorId,
        getSelectionRanges: () => [{ startOffset: 1, endOffset: 1 }],
        setSelectionRanges: vi.fn(),
        getDocumentData: () => ({ body: { dataStream: '=A1\r\n' } }),
        docSelectionRenderService: { focus: () => rightInput.focus(), isOnPointerEvent: false },
    };
    injector.add([IEditorService, { useValue: { getEditor: () => editor, focus: () => rightInput.focus() } as never }]);
    try {
        const editorService = injector.get(IEditorService);
        leftInput.focus();
        focusFormulaEditor(editorService, editorService.getEditor(editorId)!);
        expect(document.activeElement).toBe(rightInput);
        expect(editor.setSelectionRanges).toHaveBeenCalledWith([{ startOffset: 1, endOffset: 1 }]);
    } finally {
        injector.dispose();
        leftInput.remove();
        rightInput.remove();
    }
});
