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

import type { IAccessor, ICommand } from '@univerjs/core';
import { BuildTextUtils, CommandType, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { toggleReferenceAbsoluteAtCursor } from '../utils/reference-absolute';

export const ReferenceAbsoluteOperation: ICommand = {
    id: 'formula-ui.operation.change-ref-to-absolute',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const editorService = accessor.get(IEditorService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const lexerTreeBuilder = accessor.get(LexerTreeBuilder);
        const focusEditor = editorService.getFocusEditor();

        if (!focusEditor) {
            return false;
        }

        const editorId = focusEditor.getEditorId();
        if (editorId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY && editorId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            return false;
        }

        const activeTextRange = docSelectionManagerService.getActiveTextRange();
        if (!activeTextRange) {
            return false;
        }

        const formulaText = BuildTextUtils.transform.getPlainText(focusEditor.getDocumentData().body?.dataStream ?? '');
        const nextReferenceState = toggleReferenceAbsoluteAtCursor(lexerTreeBuilder, formulaText, activeTextRange.endOffset);

        if (!nextReferenceState) {
            return false;
        }

        focusEditor.replaceText(nextReferenceState.formulaText, [{
            startOffset: nextReferenceState.cursorOffset,
            endOffset: nextReferenceState.cursorOffset,
            collapsed: true,
        }]);

        return true;
    },
};
