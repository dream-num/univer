/**
 * Copyright 2023-present DreamNum Inc.
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

import { useDependency } from '@univerjs/core';
import { type Editor, IEditorService } from '@univerjs/docs-ui';
import { useMemo } from 'react';

export const useFocus = (editor?: Editor) => {
    const editorService = useDependency(IEditorService);

    const focus = useMemo(() => {
        return () => {
            if (editor) {
                editor.focus();

                // @TODO:editorService: 当完全移除editorService 的时候,这段代码可以删掉.
                editorService.focus(editor.getEditorId());
                // end
                const selections = editor.getSelectionRanges();
                if (!selections.length) {
                    const body = editor.getDocumentData().body?.dataStream ?? '\r\n';
                    const offset = Math.max(body.length - 2, 0);
                    editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
                }
            }
        };
    }, [editor]);
    return focus;
};

