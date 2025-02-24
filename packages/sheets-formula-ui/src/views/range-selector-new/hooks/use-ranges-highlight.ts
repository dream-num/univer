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

import type { Nullable } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { ColorKit, DisposableCollection } from '@univerjs/core';
import { deserializeRangeWithSheet, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { useDocHight } from '../../range-selector/hooks/use-highlight';

export function useRangesHighlight(editor: Nullable<Editor>, focusing: boolean) {
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const highlightDoc = useDocHight('');
    const change = useObservable(editor?.getDocumentDataModel().change$);
    const [sequenceNodes, setSequenceNodes] = useState<(string | ISequenceNode)[]>([]);
    const markSelectionService = useDependency(IMarkSelectionService);
    const last = useRef('');

    useEffect(() => {
        if (!editor) return;
        const text = editor.getDocumentDataModel().getPlainText();
        if (last.current === text) {
            return;
        }
        last.current = text;
        const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
        setSequenceNodes(nodes ?? []);
    }, [change, editor, lexerTreeBuilder]);

    useEffect(() => {
        if (!editor) return;
        if (!focusing) {
            const current = editor.getDocumentData();
            editor.setDocumentData({
                ...current,
                body: {
                    ...current.body,
                    dataStream: current.body?.dataStream ?? '',
                    textRuns: [],
                },
            });
            return;
        }
        const selections = highlightDoc(editor, sequenceNodes, false);
        const disposable = new DisposableCollection();
        selections.forEach((selection) => {
            const rgb = new ColorKit(selection.themeColor).toRgb();
            const id = markSelectionService.addShape({
                range: deserializeRangeWithSheet(selection.token).range,
                style: {
                    stroke: selection.themeColor,
                    fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                },
                primary: null,
            });

            if (id) {
                disposable.add(() => markSelectionService.removeShape(id));
            }
        });

        return () => {
            disposable.dispose();
        };
    }, [editor, focusing, highlightDoc, markSelectionService, sequenceNodes]);

    return { sequenceNodes };
}
