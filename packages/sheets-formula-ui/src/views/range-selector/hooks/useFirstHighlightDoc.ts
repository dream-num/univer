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

import type { Editor } from '@univerjs/docs-ui';
import type { useDocHight, useSheetHighlight } from './useHighlight';
import { useEffect, useRef } from 'react';
import { useFormulaToken } from './useFormulaToken';

export const useFirstHighlightDoc = (
    text: string,
    leadingCharacter: string,
    isNeed: boolean,
    highlightDoc: ReturnType<typeof useDocHight>,
    highlightSheet: ReturnType<typeof useSheetHighlight>,
    editor?: Editor
) => {
    const getFormulaToken = useFormulaToken();
    const isInit = useRef(true);
    useEffect(() => {
        if (editor) {
            if (isInit.current) {
                const sequenceNodes = getFormulaToken(text);
                if (sequenceNodes.length) {
                    const ranges = highlightDoc(editor, sequenceNodes);
                    if (isNeed) {
                        highlightSheet(ranges);
                    }
                } else {
                    const data = editor.getDocumentData();
                    const dataStream = data.body?.dataStream ?? `${leadingCharacter}\r\n`;
                    const cloneBody = { dataStream, ...data.body };
                    editor.setDocumentData({ ...data, body: cloneBody });
                }
                isInit.current = false;
            } else {
                if (isNeed) {
                    const sequenceNodes = getFormulaToken(text);
                    const ranges = highlightDoc(editor, sequenceNodes);
                    highlightSheet(ranges);
                }
            }
        }
    }, [editor, isNeed]);
};
