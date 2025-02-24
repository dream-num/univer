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

import type { IDocumentData, Nullable } from '@univerjs/core';
import type { RefObject } from 'react';
import type { Editor } from '../../../services/editor/editor';
import { Tools } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useLayoutEffect, useMemo, useState } from 'react';
import { IEditorService } from '../../../services/editor/editor-manager.service';

export interface IUseEditorProps {
    editorId: string;
    initialValue: Nullable<IDocumentData | string>;
    container: RefObject<HTMLDivElement>;
    autoFocus?: boolean;
    isSingle?: boolean;
}

export function useEditor(opts: IUseEditorProps) {
    const { editorId, initialValue, container, autoFocus: _autoFocus, isSingle } = opts;
    const autoFocus = useMemo(() => _autoFocus ?? false, []);
    const [editor, setEditor] = useState<Editor>();
    const editorService = useDependency(IEditorService);

    useLayoutEffect(() => {
        if (container.current) {
            const initialDoc = typeof initialValue === 'string' ? undefined : Tools.deepClone(initialValue);
            const snapshot: IDocumentData = {
                body: {
                    dataStream: typeof initialValue === 'string' ? `${initialValue}\r\n` : '\r\n',
                    textRuns: [],
                    customBlocks: [],
                    customDecorations: [],
                    customRanges: [],
                    paragraphs: [{
                        startIndex: 0,
                    }],
                },
                ...initialDoc,
                documentStyle: {
                    ...initialDoc?.documentStyle,
                    pageSize: {
                        width: !isSingle ? container.current.clientWidth : Infinity,
                        height: Infinity,
                    },
                },
                id: editorId,
            };
            const dispose = editorService.register(
                {
                    autofocus: true,
                    editorUnitId: editorId,
                    initialSnapshot: snapshot,
                },
                container.current
            );
            const editor = editorService.getEditor(editorId)! as Editor;
            setEditor(editor);

            if (autoFocus) {
                editor.focus();
                const end = (snapshot.body?.dataStream.length ?? 2) - 2;
                editor.setSelectionRanges([{ startOffset: end, endOffset: end }]);
            }

            return () => {
                dispose?.dispose();
            };
        }
    }, []);

    return editor;
}
