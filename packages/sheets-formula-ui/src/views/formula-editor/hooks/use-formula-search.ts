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
import type { FunctionType, ISearchItemWithType } from '@univerjs/engine-formula';
import type { INode } from './use-formula-token';
import {
    getFormulaReplaceResult as getSharedFormulaReplaceResult,
    IDescriptionService,
    searchFormulaFunctions,
    sequenceNodeType,
} from '@univerjs/engine-formula';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { findIndexFromSequenceNodes } from '../../range-selector/utils/find-index-from-sequence-nodes';
import { useStateRef } from './use-state-ref';

function getFormulaReplaceResult(nodes: INode[], index: number, formulaName: string, functionType: FunctionType) {
    return getSharedFormulaReplaceResult(nodes, index, formulaName, functionType);
}

export const useFormulaSearch = (isNeed: boolean, nodes: INode[] = [], editor?: Editor) => {
    const descriptionService = useDependency(IDescriptionService);

    const [searchList, setSearchList] = useState<ISearchItemWithType[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const indexRef = useRef(-1);
    const stateRef = useStateRef({ nodes });

    const reset = () => {
        setSearchList([]);
        setSearchText('');
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
                        // Why minus 1: because nodes do not include the initial ‘=’ character, but selection does
                        const currentNodeIndex = findIndexFromSequenceNodes(nodes, range.startOffset - 1, false);
                        indexRef.current = currentNodeIndex;
                        const currentNode = nodes[currentNodeIndex];
                        if (currentNode && typeof currentNode !== 'string' && currentNode.nodeType === sequenceNodeType.FUNCTION) {
                            indexRef.current = currentNodeIndex;
                            const token = currentNode.token;
                            const list = searchFormulaFunctions(descriptionService, token);
                            // Here we limit the maximum number of search results to 10 to prevent performance issues caused by rendering too many items in the dropdown.
                            setSearchList(list);
                            setSearchText(token);
                            return;
                        }
                    }
                }
                indexRef.current = -1;
                setSearchText('');
                setSearchList((pre) => {
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

    const handlerFormulaReplace = (formulaName: string, functionType: FunctionType) => {
        return getFormulaReplaceResult(stateRef.current.nodes, indexRef.current, formulaName, functionType);
    };
    return {
        searchList,
        searchText,
        handlerFormulaReplace,
        reset,
    };
};
