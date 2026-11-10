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

import type { ITextRange } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';

interface IFormulaEditorSelectionSyncService {
    getEditor: (editorId: string) => Pick<Editor, 'setSelectionRanges' | 'docSelectionRenderService'> | null | undefined | void;
}

export function syncCounterpartFormulaEditorSelection(
    editorService: IFormulaEditorSelectionSyncService,
    editorId: string,
    selections: ITextRange[] | undefined
): void {
    if (!selections?.length) {
        return;
    }

    const syncEditorId = editorId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY
        ? DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
        : editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
            ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
            : null;

    if (!syncEditorId) {
        return;
    }

    const syncEditor = editorService.getEditor(syncEditorId);
    syncEditor?.setSelectionRanges(selections, false);
    // Keep the mirrored position for focus changes without displaying a second caret.
    syncEditor?.docSelectionRenderService.removeAllRanges();
}
