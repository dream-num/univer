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
import type { INode } from '../../range-selector/utils/filterReferenceNode';
import { useDependency } from '@univerjs/core';
import { compareToken, LexerTreeBuilder, matchToken, operatorToken } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEvent } from '@univerjs/ui';
import { useEffect, useMemo, useRef } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { findIndexFromSequenceNodes } from '../../range-selector/utils/findIndexFromSequenceNodes';

const createLock = (initValue: boolean, step = 300) => {
    let isEnableCancel = initValue;
    let time = 0 as any;
    const getValue = () => isEnableCancel;
    const setValue = (v: boolean) => {
        clearTimeout(time);
        isEnableCancel = v;
    };
    function reset() {
        clearTimeout(time);
        time = setTimeout(() => {
            isEnableCancel = initValue;
        }, step);
    }
    return {
        getValue,
        setValue,
        reset,
    };
};

const baseToken = [
    compareToken.EQUALS,
    compareToken.GREATER_THAN,
    compareToken.GREATER_THAN_OR_EQUAL,
    compareToken.LESS_THAN,
    compareToken.LESS_THAN_OR_EQUAL,
    compareToken.NOT_EQUAL,
    operatorToken.CONCATENATE,
    operatorToken.DIVIDED,
    operatorToken.MINUS,
    operatorToken.MULTIPLY,
    operatorToken.PLUS,
    operatorToken.POWER,
    matchToken.COMMA,
];
const currentNodeAddToken = [
    ...baseToken,
    matchToken.COLON,
    matchToken.OPEN_BRACKET,
];

const nextNodeAddToken = [
    ...baseToken,
    matchToken.CLOSE_BRACKET,
];

const getContent = (node: INode) => typeof node === 'string' ? node : node.token;
/**
 * 根据输入内容,以及当前光标位置判断下一个 mouseDown 事件是不是需要新增选区
 *
 * @param {string} unitId
 * @param {INode[]} sequenceNodes
 * @param {Editor} [editor]
 * @return {*}
 */
// eslint-disable-next-line max-lines-per-function
export const useSelectionAdd = (unitId: string, editor?: Editor) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const isNeedAddSelection = useRef(false);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    // 非用户行为导致的选区改变,应该屏蔽选区变更事件
    const isLockSelectionEvent = useMemo(() => createLock(false, 300), []);

    const setIsAddSelection = useEvent((v: boolean) => {
        if (refSelectionsRenderService) {
            refSelectionsRenderService.setSkipLastEnabled(v);
        }
        isNeedAddSelection.current = v;
    });

    const getIsNeedAddSelection = useEvent(() => isNeedAddSelection.current);

    useEffect(() => {
        if (editor && refSelectionsRenderService) {
            const d1 = editor.input$.subscribe((e) => {
                const content = e.content as any;
                if (content.length === 1 && currentNodeAddToken.includes(content)) {
                    setIsAddSelection(true);
                    isLockSelectionEvent.setValue(true);
                    isLockSelectionEvent.reset();
                } else {
                    setIsAddSelection(false);
                    isLockSelectionEvent.setValue(false);
                }
            });
            // sequenceNodes 的创建会在 input 事件之后,为了拿到最新的 sequenceNodes , 这里延后 100ms
            const d2 = editor.selectionChange$.subscribe((e) => {
                if (isLockSelectionEvent.getValue()) {
                    return;
                }
                const dataStream = editor.getDocumentData().body?.dataStream.slice(0, -2) ?? '';
                const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(dataStream);
                const selections = e.textRanges;
                if (!selections.length) {
                    return;
                }
                if (selections.length !== 1) {
                    setIsAddSelection(false);
                    return;
                }
                const range = selections[0];
                if (!range.collapsed) {
                    setIsAddSelection(false);
                    return;
                }
                if (!sequenceNodes?.length) {
                    setIsAddSelection(true);
                    return;
                }
                // ‘=’不会进入 sequenceNodes ,所以需要 -1
                const startOffset = range.startOffset - 1;

                if (startOffset === 0) {
                    const nextIndex = findIndexFromSequenceNodes(sequenceNodes, 1, false);
                    const nextNode = sequenceNodes[nextIndex] || '';
                    const nextContent = getContent(nextNode);
                    if (baseToken.includes(nextContent as any)) {
                        setIsAddSelection(true);
                        return;
                    }
                }
                const index = findIndexFromSequenceNodes(sequenceNodes, startOffset, false);
                const currentNode = sequenceNodes[index];
                if (!currentNode) {
                    setIsAddSelection(false);
                    return;
                }
                const nextNode = sequenceNodes[index + 1] || '';
                const nextContent = getContent(nextNode) as any;
                const content = getContent(currentNode) as any;
                if (currentNodeAddToken.includes(content) && (!nextNode || nextNodeAddToken.includes(nextContent))) {
                    setIsAddSelection(true);
                } else {
                    setIsAddSelection(false);
                }
            });
            // 增加一个延时,外部接收到 moveEnd 事件后，再重置状态
            refSelectionsRenderService.selectionMoveEnd$.subscribe(() => {
                Promise.resolve().then(() => {
                    setIsAddSelection(false);
                });
            });

            return () => {
                d1.unsubscribe();
                d2.unsubscribe();
            };
        }
    }, [editor, isLockSelectionEvent, lexerTreeBuilder, refSelectionsRenderService, setIsAddSelection]);

    return {
        setIsAddSelection,
        getIsNeedAddSelection,
        isLockSelectionEvent,
    };
};
