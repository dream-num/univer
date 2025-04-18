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

export const useFocus = (editor?: Editor) => {
    const editorService = useDependency(IEditorService);
    const focus = useEvent((offset?: number) => {
        if (editor) {
            editorService.focus(editor.getEditorId());
            const selections = [...editor.getSelectionRanges()];
            if (Tools.isDefine(offset)) {
                editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
            } else if (!selections.length && !editor.docSelectionRenderService.isOnPointerEvent) {
                const body = editor.getDocumentData().body?.dataStream ?? '\r\n';
                const offset = Math.max(body.length - 2, 0);
                editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
            } else {
                editor.setSelectionRanges(selections);
            }
        };
    });

    return focus;
};
