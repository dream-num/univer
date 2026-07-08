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

import type { Editor } from '@univerjs/docs-ui';
import { Tools } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { useDependency, useEvent } from '@univerjs/ui';
import { isEventTargetInSameFormulaEmbedInteractionBoundary } from '../formula-embed-integration.service';

export function focusFormulaEditor(
    editorService: Pick<IEditorService, 'focus'>,
    editor?: Pick<Editor, 'getEditorId' | 'getSelectionRanges' | 'setSelectionRanges' | 'getDocumentData' | 'docSelectionRenderService'> & { editorDOM?: HTMLElement },
    offset?: number
) {
    if (!editor) {
        return;
    }

    editorService.focus(editor.getEditorId());
    focusFormulaEditorElement(editor);
    if (editor.docSelectionRenderService.isOnPointerEvent) {
        return;
    }

    const selections = [...editor.getSelectionRanges()];
    if (Tools.isDefine(offset)) {
        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
    } else if (!selections.length) {
        const body = editor.getDocumentData().body?.dataStream ?? '\r\n';
        const offset = Math.max(body.length - 2, 0);
        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
    } else {
        editor.setSelectionRanges(selections);
    }
}

function focusFormulaEditorElement(editor: Pick<Editor, 'getEditorId'> & { editorDOM?: HTMLElement }): void {
    const ownerDocument = editor.editorDOM?.ownerDocument ?? document;
    const editorElement = ownerDocument.getElementById(`__editor_${editor.getEditorId()}`);
    editorElement?.focus({ preventScroll: true });
}

export function shouldSkipFormulaEditorMouseUpFocus(_target: EventTarget | null): boolean {
    return false;
}

export function shouldRefocusFormulaEditorOnMouseUp(options: {
    target: EventTarget | null;
    isFocusing: boolean | undefined;
    isPointerSelecting: boolean | undefined;
}): boolean {
    if (shouldSkipFormulaEditorMouseUpFocus(options.target)) {
        return false;
    }

    if (options.isPointerSelecting || options.isFocusing) {
        return false;
    }

    return true;
}

export function hasActiveFormulaEmbedInteraction(scopeElement: HTMLElement | null | undefined): boolean {
    const ownerDocument = scopeElement?.ownerDocument;
    return isEventTargetInSameFormulaEmbedInteractionBoundary(scopeElement, ownerDocument?.activeElement);
}

export const useFocus = (editor?: Editor) => {
    const editorService = useDependency(IEditorService);
    const focus = useEvent((offset?: number) => {
        focusFormulaEditor(editorService, editor, offset);
    });

    return focus;
};
