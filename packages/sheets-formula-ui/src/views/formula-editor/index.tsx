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

import type { DocumentDataModel, IDisposable, ITextRange } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { KeyCode, MetaKeys } from '@univerjs/ui';
import type { ReactNode } from 'react';
import type { IRefSelection } from '../range-selector/hooks/useHighlight';
import type { IKeyboardEventConfig } from '../range-selector/hooks/useKeyboardEvent';
import type { FormulaSelectingType } from './hooks/useFormulaSelection';
import { BuildTextUtils, createInternalEditorID, generateRandomId, IUniverInstanceService, UniverInstanceType, useDependency, useObservable } from '@univerjs/core';
import { DocBackScrollRenderController, DocSelectionRenderService, IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import { useEvent, useUpdateEffect } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFocus } from '../range-selector/hooks/useFocus';
import { useFormulaToken } from '../range-selector/hooks/useFormulaToken';
import { useDocHight, useSheetHighlight } from '../range-selector/hooks/useHighlight';
import { useKeyboardEvent } from '../range-selector/hooks/useKeyboardEvent';
import { useLeftAndRightArrow } from '../range-selector/hooks/useLeftAndRightArrow';
import { useRefactorEffect } from '../range-selector/hooks/useRefactorEffect';
import { useResetSelection } from '../range-selector/hooks/useResetSelection';
import { useResize } from '../range-selector/hooks/useResize';
import { useSwitchSheet } from '../range-selector/hooks/useSwitchSheet';
import { HelpFunction } from './help-function/HelpFunction';
import { useFormulaSelecting } from './hooks/useFormulaSelection';
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
    isSingle?: boolean;
    autoScrollbar?: boolean;
    /**
     * Disable selection when click formula editor
     */
    disableSelectionOnClick?: boolean;
    disableContextMenu?: boolean;
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
        onChange: propOnChange,
        onVerify,
        actions,
        className,
        editorId: propEditorId,
        moveCursor = true,
        onFormulaSelectingChange: propOnFormulaSelectingChange,
        keyboradEventConfig,
        onMoveInEditor,
        resetSelectionOnBlur = true,
        autoScrollbar = true,
        isSingle = true,
        disableSelectionOnClick = false,
        disableContextMenu,
    } = props;

    const editorService = useDependency(IEditorService);
    const sheetEmbeddingRef = useRef<HTMLDivElement>(null);
    const onChange = useEvent(propOnChange);
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
    const editorRef = useRef<Editor>();
    const editor = editorRef.current;
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
    const { isSelecting } = useFormulaSelecting(editorId, isFocus, disableSelectionOnClick);
    const highTextRef = useRef('');
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const isFocusing = docSelectionRenderService?.isFocusing;
    const currentDoc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC), [univerInstanceService]);
    const currentDoc = useObservable(currentDoc$);
    const docFocusing = currentDoc?.getUnitId() === editorId;
    const refSelections = useRef([] as IRefSelection[]);
    const selectingMode = isSelecting;

    useUpdateEffect(() => {
        onChange(formulaText);
    }, [formulaText, onChange]);

    const highlightDoc = useDocHight('=');
    const highlightSheet = useSheetHighlight(unitId, subUnitId);
    const highlight = useEvent((text: string, isNeedResetSelection: boolean = true, isEnd?: boolean, newSelections?: ITextRange[]) => {
        if (!editorRef.current) {
            return;
        }
        highTextRef.current = text;
        const sequenceNodes = getFormulaToken(text[0] === '=' ? text.slice(1) : '');
        const ranges = highlightDoc(
            editorRef.current,
            sequenceNodes,
            isNeedResetSelection,
            newSelections
        );
        refSelections.current = ranges;

        if (isEnd) {
            highlightSheet(isFocus ? ranges : [], editorRef.current);
        }
    });

    useEffect(() => {
        if (isFocus) {
            highlight(formulaText, false, true);
        }
    }, [formulaText, isFocus, highlight]);

    useVerify(isFocus, onVerify, formulaText);
    const focus = useFocus(editor);

    const resetSelection = useResetSelection(isFocus, unitId, subUnitId);

    useEffect(() => {
        onFormulaSelectingChange(isSelecting);
    }, [onFormulaSelectingChange, isSelecting]);

    useKeyboardEvent(isFocus, keyboradEventConfig, editor);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (formulaEditorContainerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
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
            editorRef.current = editor;
            highlight(initValue, false, true);
        }

        return () => {
            dispose?.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (_isFocus) {
            isFocusSet(_isFocus);
            focus();
        } else {
            if (resetSelectionOnBlur) {
                editor?.blur();
                resetSelection();
            }
            isFocusSet(_isFocus);
        }
    }, [_isFocus, editor, focus, resetSelection, resetSelectionOnBlur]);

    const { checkScrollBar } = useResize(editor, isSingle, autoScrollbar);
    useRefactorEffect(isFocus, Boolean(isSelecting && docFocusing), unitId, disableContextMenu);
    useLeftAndRightArrow(isFocus && moveCursor, selectingMode, editor, onMoveInEditor);

    const handleSelectionChange = useEvent((refString: string, offset: number, isEnd: boolean) => {
        if (!isFocusing) {
            return;
        }

        const newSelections = offset !== -1 ? [{ startOffset: offset + 1, endOffset: offset + 1, collapsed: true }] : undefined;
        highlight(`=${refString}`, true, isEnd, newSelections);
        if (isEnd) {
            focus();
            if (offset !== -1) {
                setTimeout(() => {
                    const range = { startOffset: offset + 1, endOffset: offset + 1 };
                    const docBackScrollRenderController = editor?.render.with(DocBackScrollRenderController);
                    docBackScrollRenderController?.scrollToRange({ ...range, collapsed: true });
                }, 50);
            }
            checkScrollBar();
        }
    });
    useSheetSelectionChange(
        isFocus && Boolean(isSelecting && docFocusing),
        isFocus,
        isSelecting,
        unitId,
        subUnitId,
        sequenceNodes,
        refSelections,
        isSupportAcrossSheet,
        Boolean(selectingMode),
        editor,
        handleSelectionChange
    );
    useSwitchSheet(isFocus && Boolean(isSelecting && docFocusing), unitId, isSupportAcrossSheet, isFocusSet, onBlur, noop);

    const handleFunctionSelect = (res: { text: string; offset: number }) => {
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
            focus();
            highlight(`=${res.text}`);
        }
    };

    const handleMouseUp = () => {
        isFocusSet(true);
        onFocus();
        focus();
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
            </div>
            {errorText !== undefined ? <div className={styles.sheetEmbeddingFormulaEditorErrorWrap}>{errorText}</div> : null}
            {editor
                ? (
                    <HelpFunction
                        editor={editor}
                        isFocus={isFocus}
                        formulaText={formulaText}
                        onClose={() => focus()}
                    />
                )
                : null}
            {editor
                ? (
                    <SearchFunction
                        isFocus={isFocus}
                        sequenceNodes={sequenceNodes}
                        onSelect={handleFunctionSelect}
                        ref={searchFunctionRef}
                        editor={editor}
                    />
                )
                : null}
        </div>
    )
    ;
}
