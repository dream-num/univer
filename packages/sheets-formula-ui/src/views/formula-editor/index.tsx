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

import type { IDisposable } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ReactNode } from 'react';
import { createInternalEditorID, generateRandomId, useDependency } from '@univerjs/core';
import { DocBackScrollRenderController, IEditorService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, LexerTreeBuilder, operatorToken, sequenceNodeType } from '@univerjs/engine-formula';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useEmitChange } from '../range-selector/hooks/useEmitChange';
import { useFirstHighlightDoc } from '../range-selector/hooks/useFirstHighlightDoc';
import { useFocus } from '../range-selector/hooks/useFocus';
import { useFormulaToken } from '../range-selector/hooks/useFormulaToken';
import { useDocHight, useSheetHighlight } from '../range-selector/hooks/useHighlight';
import { useLeftAndRightArrow } from '../range-selector/hooks/useLeftAndRightArrow';
import { useRefactorEffect } from '../range-selector/hooks/useRefactorEffect';
import { useRefocus } from '../range-selector/hooks/useRefocus';
import { useResetSelection } from '../range-selector/hooks/useResetSelection';
import { useResize } from '../range-selector/hooks/useResize';
import { useSwitchSheet } from '../range-selector/hooks/useSwitchSheet';
import { rangePreProcess } from '../range-selector/utils/rangePreProcess';
import { sequenceNodeToText } from '../range-selector/utils/sequenceNodeToText';
import { unitRangesToText } from '../range-selector/utils/unitRangesToText';
import { HelpFunction } from './help-function/HelpFunction';
import { useFormulaDescribe } from './hooks/useFormulaDescribe';
import { useFormulaSearch } from './hooks/useFormulaSearch';
import { useSheetSelectionChange } from './hooks/useSheetSelectionChange';
import { useVerify } from './hooks/useVerify';
import styles from './index.module.less';
import { SearchFunction } from './search-function/SearchFunction';
import { getFormulaText } from './utils/getFormulaText';

export interface IFormulaEditorProps {
    unitId: string;
    subUnitId: string;
    initValue: `=${string}`;
    onChange: (text: string) => void;
    errorText?: string | ReactNode;
    onVerify?: (res: boolean, result: string) => void;
    isFocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    isSupportAcrossSheet?: boolean;
    actions?: {
        handleOutClick?: (e: MouseEvent, cb: () => void) => void;
    };
}
const noop = () => { };
export function FormulaEditor(props: IFormulaEditorProps) {
    const { errorText, initValue, unitId, subUnitId, isFocus: _isFocus = true, isSupportAcrossSheet = false,
            onFocus = noop,
            onBlur = noop,
            onChange,
            onVerify,
            actions,
    } = props;

    const editorService = useDependency(IEditorService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const sheetEmbeddingRef = useRef<HTMLDivElement>(null);
    const [formulaText, formulaTextSet] = useState(() => {
        if (initValue.startsWith(operatorToken.EQUALS)) {
            return initValue;
        }
        return '';
    });

    // init actions
    if (actions) {
        actions.handleOutClick = (e: MouseEvent, cb: () => void) => {
            if (sheetEmbeddingRef.current) {
                const isContain = sheetEmbeddingRef.current.contains(e.target as Node);
                !isContain && cb();
            }
        };
    }

    const formulaWithoutEqualSymbol = useMemo(() => {
        return getFormulaText(formulaText);
    }, [formulaText]);

    const searchFunctionRef = useRef<HTMLElement>(null);
    const [editor, editorSet] = useState<Editor>();
    const [isFocus, isFocusSet] = useState(_isFocus);
    const formulaEditorContainerRef = useRef(null);
    const editorId = useMemo(() => createInternalEditorID(`${EMBEDDING_FORMULA_EDITOR}-${generateRandomId(4)}`), []);
    const isError = useMemo(() => errorText !== undefined, [errorText]);

    const getFormulaToken = useFormulaToken();
    const sequenceNodes = useMemo(() => getFormulaToken(formulaWithoutEqualSymbol), [formulaWithoutEqualSymbol]);

    const needEmit = useEmitChange(sequenceNodes, (text: string) => {
        const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
        if (nodes) {
            const preNodes = nodes.map((node) => {
                if (typeof node === 'string') {
                    return node;
                } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                    // The 'sequenceNodesBuilder' will cache the results.
                    // You Can't modify the reference here. This will cause a cache error
                    const cloneNode = { ...node };
                    const unitRange = deserializeRangeWithSheet(node.token);
                    unitRange.range = rangePreProcess(unitRange.range);
                    if (!isSupportAcrossSheet) {
                        unitRange.sheetName = '';
                        unitRange.unitId = '';
                    }
                    cloneNode.token = unitRangesToText([unitRange], isSupportAcrossSheet)[0];
                    return cloneNode;
                }
                return node;
            });
            const result = sequenceNodeToText(preNodes);
            onChange(`=${result}`);
        }
    }, editor);

    const highlightDoc = useDocHight('=');
    const highlightSheet = useSheetHighlight(unitId);
    const highligh = (text: string, isNeedResetSelection: boolean = true) => {
        if (!editor) {
            return;
        }
        const sequenceNodes = getFormulaToken(text);
        const ranges = highlightDoc(editor, sequenceNodes, isNeedResetSelection);
        highlightSheet(ranges);
    };

    // const refSelections = useDocHight(editorId, sequenceNodes);
    useVerify(isFocus, onVerify, formulaText);
    const focus = useFocus(editor);

    const resetSelection = useResetSelection(isFocus);

    useLayoutEffect(() => {
        // 在进行多个 input 切换的时候,失焦必须快于获得焦点.
        if (_isFocus) {
            const time = setTimeout(() => {
                isFocusSet(_isFocus);
                if (_isFocus) {
                    focus();
                }
            }, 30);
            return () => {
                clearTimeout(time);
            };
        } else {
            resetSelection();
            isFocusSet(_isFocus);
        }
    }, [_isFocus, focus]);

    const { checkScrollBar } = useResize(editor);
    useRefactorEffect(isFocus, unitId);
    useLeftAndRightArrow(isFocus, editor);

    const handleSelectionChange = (refString: string, offset: number, isEnd: boolean) => {
        const result = `=${refString}`;
        needEmit();
        formulaTextSet(result);
        highligh(refString);
        if (isEnd) {
            focus();
            if (offset !== -1) {
                // 在渲染结束之后再设置选区
                setTimeout(() => {
                    const range = { startOffset: offset + 1, endOffset: offset + 1 };
                    editor?.setSelectionRanges([range]);
                    const docBackScrollRenderController = editor?.render.with(DocBackScrollRenderController);
                    docBackScrollRenderController?.scrollToRange({ ...range, collapsed: true });
                }, 50);
            }
            checkScrollBar();
        }
    };
    useSheetSelectionChange(isFocus, unitId, subUnitId, sequenceNodes, isSupportAcrossSheet, editor, handleSelectionChange);

    useRefocus();
    useSwitchSheet(isFocus, unitId, isSupportAcrossSheet, isFocusSet, onBlur, noop);

    const { searchList, searchText, handlerFormulaReplace, reset: resetFormulaSearch } = useFormulaSearch(isFocus, sequenceNodes, editor);
    const { functionInfo, paramIndex, reset } = useFormulaDescribe(isFocus, formulaText, editor);

    useEffect(() => {
        if (editor) {
            const d = editor.input$.subscribe((e) => {
                const text = (e.data.body?.dataStream ?? '').replaceAll(/\n|\r/g, '');
                needEmit();
                formulaTextSet(text);
                highligh(getFormulaText(text), false);
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor]);

    useFirstHighlightDoc(formulaWithoutEqualSymbol, '=', isFocus, highlightDoc, highlightSheet, editor);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (formulaEditorContainerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
                isSingle: true,
                initialSnapshot: {
                    id: editorId,
                    body: { dataStream: `${initValue}\r\n` },
                    documentStyle: {},
                },
            }, formulaEditorContainerRef.current);
            const editor = editorService.getEditor(editorId)! as Editor;
            editorSet(editor);
        }

        return () => {
            dispose?.dispose();
        };
    }, []);

    const handleFunctionSelect = (v: string) => {
        const res = handlerFormulaReplace(v);
        if (res) {
            formulaTextSet(`=${res.text}`);
            const selections = editor?.getSelectionRanges();
            if (selections && selections.length === 1) {
                const range = selections[0];
                if (range.collapsed) {
                    const offset = res.offset;
                    setTimeout(() => {
                        editor?.setSelectionRanges([{ startOffset: range.startOffset - offset, endOffset: range.endOffset - offset }]);
                    }, 30);
                }
            }
            resetFormulaSearch();
            focus();
            highligh(res.text);
        }
    };

    const handleMouseUp = () => {
        // 在进行多个 input 切换的时候,失焦必须快于获得焦点.
        // 即使失焦是 mousedown 事件,
        // 聚焦是 mouseup 事件,
        // 但是 react 的 useEffect 无法保证顺序,无法确保失焦在聚焦之前.

        setTimeout(() => {
            isFocusSet(true);
            onFocus();
            focus();
        }, 30);
    };
    return (
        <div className={styles.sheetEmbeddingFormulaEditor}>
            <div
                className={clsx(styles.sheetEmbeddingFormulaEditorWrap, {
                    [styles.sheetEmbeddingFormulaEditorActive]: isFocus,
                    [styles.sheetEmbeddingFormulaEditorError]: isError,
                })}
                ref={sheetEmbeddingRef}
            >
                <div
                    className={styles.sheetEmbeddingFormulaEditorText}
                    ref={formulaEditorContainerRef}
                    onMouseUp={handleMouseUp}
                >
                </div>
                {errorText !== undefined ? <div className={styles.sheetEmbeddingFormulaEditorErrorWrap}>{errorText}</div> : null}
            </div>
            <HelpFunction
                editorId={editorId}
                paramIndex={paramIndex}
                functionInfo={functionInfo}
                onClose={() => {
                    reset();
                    focus();
                }}
            >
            </HelpFunction>
            <SearchFunction
                searchText={searchText}
                editorId={editorId}
                searchList={searchList}
                onSelect={handleFunctionSelect}
                ref={searchFunctionRef}
            >
            </SearchFunction>
        </div>
    )
    ;
}
