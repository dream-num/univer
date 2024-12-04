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

import type { DocumentDataModel, IDisposable } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { KeyCode, MetaKeys } from '@univerjs/ui';
import type { ReactNode } from 'react';
import type { IKeyboardEventConfig } from '../range-selector/hooks/useKeyboardEvent';
import { BuildTextUtils, createInternalEditorID, generateRandomId, IUniverInstanceService, useDependency, useObservable } from '@univerjs/core';
import { DocBackScrollRenderController, IEditorService } from '@univerjs/docs-ui';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import { useEvent } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useEmitChange } from '../range-selector/hooks/useEmitChange';
import { useFocus } from '../range-selector/hooks/useFocus';
import { useFormulaToken } from '../range-selector/hooks/useFormulaToken';
import { useDocHight, useSheetHighlight } from '../range-selector/hooks/useHighlight';
import { useKeyboardEvent } from '../range-selector/hooks/useKeyboardEvent';
import { useLeftAndRightArrow } from '../range-selector/hooks/useLeftAndRightArrow';
import { useRefactorEffect } from '../range-selector/hooks/useRefactorEffect';
import { useRefocus } from '../range-selector/hooks/useRefocus';
import { useResetSelection } from '../range-selector/hooks/useResetSelection';
import { useResize } from '../range-selector/hooks/useResize';
import { useSwitchSheet } from '../range-selector/hooks/useSwitchSheet';
import { HelpFunction } from './help-function/HelpFunction';
import { useFormulaDescribe } from './hooks/useFormulaDescribe';
import { useFormulaSearch } from './hooks/useFormulaSearch';
import { FormulaSelectingType, useFormulaSelecting } from './hooks/useFormulaSelection';
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
    className?: string;
    editorId?: string;
    moveCursor?: boolean;
    onFormulaSelectingChange?: (isSelecting: FormulaSelectingType) => void;
    keyboradEventConfig?: IKeyboardEventConfig;
    onMoveInEditor?: (keyCode: KeyCode, metaKey?: MetaKeys) => void;
    resetSelectionOnBlur?: boolean;
}

const noop = () => { };
export function FormulaEditor(props: IFormulaEditorProps) {
    const {
        errorText,
        initValue,
        unitId,
        subUnitId,
        isFocus: _isFocus = true,
        isSupportAcrossSheet = false,
        onFocus = noop,
        onBlur = noop,
        onChange,
        onVerify,
        actions,
        className,
        editorId: propEditorId,
        moveCursor = true,
        onFormulaSelectingChange: propOnFormulaSelectingChange,
        keyboradEventConfig,
        onMoveInEditor,
        resetSelectionOnBlur = true,
    } = props;

    const editorService = useDependency(IEditorService);
    const sheetEmbeddingRef = useRef<HTMLDivElement>(null);

    // init actions
    if (actions) {
        actions.handleOutClick = (e: MouseEvent, cb: () => void) => {
            if (sheetEmbeddingRef.current) {
                const isContain = sheetEmbeddingRef.current.contains(e.target as Node);
                !isContain && cb();
            }
        };
    }

    const onFormulaSelectingChange = useEvent(propOnFormulaSelectingChange);
    const searchFunctionRef = useRef<HTMLElement>(null);
    const [editor, editorSet] = useState<Editor>();
    const [isFocus, isFocusSet] = useState(_isFocus);
    const formulaEditorContainerRef = useRef(null);
    const editorId = useMemo(() => propEditorId ?? createInternalEditorID(`${EMBEDDING_FORMULA_EDITOR}-${generateRandomId(4)}`), []);
    const isError = useMemo(() => errorText !== undefined, [errorText]);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const document = univerInstanceService.getUnit<DocumentDataModel>(editorId);
    useObservable(document?.change$);
    const getFormulaToken = useFormulaToken();
    const formulaText = BuildTextUtils.transform.getPlainText(document?.getBody()?.dataStream ?? '');
    const formulaWithoutEqualSymbol = useMemo(() => getFormulaText(formulaText), [formulaText]);
    const sequenceNodes = useMemo(() => getFormulaToken(formulaWithoutEqualSymbol), [formulaWithoutEqualSymbol, getFormulaToken]);
    const isSelecting = useFormulaSelecting(editorId, sequenceNodes);
    const [shouldMoveRefSelection, setShouldMoveRefSelection] = useState(false);
    const highTextRef = useRef('');

    useEffect(() => {
        if (isSelecting === FormulaSelectingType.NEED_ADD) {
            setShouldMoveRefSelection(true);
        }
        if (isSelecting === FormulaSelectingType.NOT_SELECT) {
            setShouldMoveRefSelection(false);
        }
    }, [isSelecting]);

    const needEmit = useEmitChange(sequenceNodes, (text: string) => {
        onChange(`=${text}`);
    }, editor);

    const highlightDoc = useDocHight('=');
    const highlightSheet = useSheetHighlight(unitId);
    const highligh = useEvent((text: string, isNeedResetSelection: boolean = true) => {
        if (!editor) {
            return;
        }
        const preText = highTextRef.current;
        highTextRef.current = text;
        const sequenceNodes = getFormulaToken(text[0] === '=' ? text.slice(1) : '');
        const ranges = highlightDoc(
            editor,
            sequenceNodes,
            isNeedResetSelection,
            // remove equals need to remove highlight style
            preText.slice(1) === text && preText[0] === '='
        );
        highlightSheet(isFocus ? ranges : []);
    });

    useEffect(() => {
        highligh(formulaText, false);
    }, [highligh, formulaText, isFocus]);

    useVerify(isFocus, onVerify, formulaText);
    const focus = useFocus(editor);

    const resetSelection = useResetSelection(isFocus);

    useEffect(() => {
        onFormulaSelectingChange(isSelecting);
    }, [onFormulaSelectingChange, isSelecting]);

    useKeyboardEvent(isFocus, keyboradEventConfig, editor);
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
            if (resetSelectionOnBlur) {
                resetSelection();
            }
            isFocusSet(_isFocus);
        }
    }, [_isFocus, focus, resetSelectionOnBlur]);

    const { checkScrollBar } = useResize(editor);
    useRefactorEffect(isFocus, Boolean(isSelecting), unitId);
    useLeftAndRightArrow(isFocus && moveCursor, shouldMoveRefSelection, editor, onMoveInEditor);

    const handleSelectionChange = useEvent((refString: string, offset: number, isEnd: boolean) => {
        needEmit();
        highligh(`=${refString}`);
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
    });
    useSheetSelectionChange(isFocus, unitId, subUnitId, sequenceNodes, isSupportAcrossSheet, shouldMoveRefSelection, editor, handleSelectionChange);

    useRefocus();
    useSwitchSheet(isFocus, unitId, isSupportAcrossSheet, isFocusSet, onBlur, noop);

    const { searchList, searchText, handlerFormulaReplace, reset: resetFormulaSearch } = useFormulaSearch(isFocus, sequenceNodes, editor);
    const { functionInfo, paramIndex, reset } = useFormulaDescribe(isFocus, formulaText, editor);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (formulaEditorContainerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
                isSingle: true,
                initialSnapshot: {
                    id: editorId,
                    body: {
                        dataStream: `${initValue}\r\n`,
                        textRuns: [],
                        customBlocks: [],
                        customDecorations: [],
                        customRanges: [],
                    },
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
            highligh(`=${res.text}`);
        }
    };

    const handleMouseUp = () => {
        // 在进行多个 input 切换的时候,失焦必须快于获得焦点.
        // 即使失焦是 mousedown 事件,
        // 聚焦是 mouseup 事件,
        // 但是 react 的 useEffect 无法保证顺序,无法确保失焦在聚焦之前.
        if (isSelecting !== FormulaSelectingType.NEED_ADD) {
            setShouldMoveRefSelection(false);
        }

        setTimeout(() => {
            isFocusSet(true);
            onFocus();
            focus();
        }, 30);
    };
    return (
        <div className={clsx(styles.sheetEmbeddingFormulaEditor, className)}>
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
