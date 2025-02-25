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
import type { ISearchItem } from '@univerjs/sheets-formula';
import type { INode } from './use-formula-token';
import { matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { findIndexFromSequenceNodes } from '../../range-selector/utils/find-index-from-sequence-nodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequence-node-to-text';
import { useStateRef } from '../hooks/use-state-ref';

export const useFormulaSearch = (isNeed: boolean, nodes: INode[] = [], editor?: Editor) => {
    const descriptionService = useDependency(IDescriptionService);

    const [searchList, searchListSet] = useState<ISearchItem[]>([]);
    const [searchText, searchTextSet] = useState<string>('');
    const indexRef = useRef(-1);
    const stateRef = useStateRef({ nodes });

    const reset = () => {
        searchListSet([]);
        searchTextSet('');
        indexRef.current = -1;
    };

    useEffect(() => {
        if (editor && isNeed) {
            const d = editor.input$.pipe(debounceTime(300)).subscribe(() => {
                const selections = editor.getSelectionRanges();
                if (selections.length === 1) {
                    const nodes = stateRef.current.nodes;
                    const range = selections[0];
                    if (range.collapsed) {
                        // 为什么减1,因为nodes是不包含初始 ‘=’ 字符的,但是 selection 会包含 '='
                        const currentNodeIndex = findIndexFromSequenceNodes(nodes, range.startOffset - 1, false);
                        indexRef.current = currentNodeIndex;
                        const currentNode = nodes[currentNodeIndex];
                        if (currentNode && typeof currentNode !== 'string' && currentNode.nodeType === sequenceNodeType.FUNCTION) {
                            indexRef.current = currentNodeIndex;
                            const token = currentNode.token;
                            const list = descriptionService.getSearchListByNameFirstLetter(token);
                            searchListSet(list);
                            searchTextSet(token);
                            return;
                        }
                    }
                }
                indexRef.current = -1;
                searchTextSet('');
                searchListSet((pre) => {
                    if (!pre?.length) {
                        return pre;
                    }
                    return [];
                });
            });
            return () => {
                d.unsubscribe();
            };
        };
    }, [editor, isNeed]);

    useEffect(() => {
        if (!isNeed) {
            reset();
        }
    }, [isNeed]);

    const handlerFormulaReplace = (formulaName: string) => {
        const cloneNodes = [...stateRef.current.nodes];
        if (indexRef.current !== -1) {
            const lastNodes = cloneNodes.splice(indexRef.current + 1);
            const oldNode = cloneNodes.pop() || '';
            let offset = (typeof oldNode === 'string' ? oldNode.length : oldNode.token.length) - formulaName.length;
            cloneNodes.push(formulaName);
            if (lastNodes[0] !== matchToken.OPEN_BRACKET) {
                cloneNodes.push(matchToken.OPEN_BRACKET);
                offset--;
            }
            const text = sequenceNodeToText([...cloneNodes, ...lastNodes]);
            return { text, offset };
        }
    };
    return {
        searchList,
        searchText,
        handlerFormulaReplace,
        reset,
    };
};
