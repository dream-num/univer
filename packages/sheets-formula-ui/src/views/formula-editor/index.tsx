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

import type { DocumentDataModel, IDisposable, ITextRange } from '@univerjs/core';
import type { Editor, IKeyboardEventConfig } from '@univerjs/docs-ui';
import type { KeyCode, MetaKeys } from '@univerjs/ui';
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { FormulaSelectingType } from './hooks/use-formula-selection';
import type { IRefSelection } from './hooks/use-highlight';
import { BuildTextUtils, createInternalEditorID, generateRandomId, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { DocBackScrollRenderController, DocSelectionRenderService, IEditorService, useKeyboardEvent, useResize } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import { useDependency, useEvent, useObservable, useUpdateEffect } from '@univerjs/ui';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { findIndexFromSequenceNodes, findRefSequenceIndex } from '../range-selector/utils/find-index-from-sequence-nodes';
import { HelpFunction } from './help-function/HelpFunction';
import { useFocus } from './hooks/use-focus';
import { useFormulaSelecting } from './hooks/use-formula-selection';
import { useFormulaToken } from './hooks/use-formula-token';
import { useDocHight, useSheetHighlight } from './hooks/use-highlight';
import { useLeftAndRightArrow } from './hooks/use-left-and-right-arrow';
import { useRefactorEffect } from './hooks/use-refactor-effect';
import { useResetSelection } from './hooks/use-reset-selection';
import { useSheetSelectionChange } from './hooks/use-sheet-selection-change';
import { useStateRef } from './hooks/use-state-ref';
import { useSwitchSheet } from './hooks/use-switch-sheet';
import { useVerify } from './hooks/use-verify';
import { SearchFunction } from './search-function/SearchFunction';
import { getFormulaText } from './utils/get-formula-text';

export interface IFormulaEditorProps {
    unitId: string;
    subUnitId: string;
    initValue: `=${string}`;
    autofocus?: boolean;
    onChange: (text: string) => void;
    errorText?: string | ReactNode;
    onVerify?: (res: boolean, result: string) => void;
    isFocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    isSupportAcrossSheet?: boolean;
    className?: string;
    editorId?: string;
    moveCursor?: boolean;
    onFormulaSelectingChange?: (isSelecting: FormulaSelectingType, isFocusing: boolean) => void;
    keyboardEventConfig?: IKeyboardEventConfig;
    onMoveInEditor?: (keyCode: KeyCode, metaKey?: MetaKeys) => void;
    resetSelectionOnBlur?: boolean;
    isSingle?: boolean;
    autoScrollbar?: boolean;
    /**
     * Disable selection when click formula editor
     */
    disableSelectionOnClick?: boolean;
    disableContextMenu?: boolean;
    style?: CSSProperties;
}

const noop = () => { };

export interface IFormulaEditorRef {
    isClickOutSide: (e: MouseEvent) => boolean;
}

export const FormulaEditor = forwardRef((props: IFormulaEditorProps, ref: Ref<IFormulaEditorRef>) => {
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
        className,
        editorId: propEditorId,
        moveCursor = true,
        onFormulaSelectingChange: propOnFormulaSelectingChange,
        keyboardEventConfig,
        onMoveInEditor,
        resetSelectionOnBlur = true,
        autoScrollbar = true,
        isSingle = true,
        disableSelectionOnClick = false,
        autofocus = true,
        disableContextMenu,
        style,
    } = props;

    const editorService = useDependency(IEditorService);
    const sheetEmbeddingRef = useRef<HTMLDivElement>(null);
    const onChange = useEvent(propOnChange);
    useImperativeHandle(ref, () => ({
        isClickOutSide: (e: MouseEvent) => {
            if (sheetEmbeddingRef.current) {
                return !sheetEmbeddingRef.current.contains(e.target as Node);
            }
            return false;
        },
    }));
    const onFormulaSelectingChange = useEvent(propOnFormulaSelectingChange);
    const searchFunctionRef = useRef<HTMLElement>(null);
    const editorRef = useRef<Editor>(undefined);
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
    const formulaTextRef = useStateRef(formulaText);
    const formulaWithoutEqualSymbol = useMemo(() => getFormulaText(formulaText), [formulaText]);
    const sequenceNodes = useMemo(() => getFormulaToken(formulaWithoutEqualSymbol), [formulaWithoutEqualSymbol, getFormulaToken]);
    const { isSelecting, isSelectingRef } = useFormulaSelecting({ unitId, subUnitId, editorId, isFocus, disableOnClick: disableSelectionOnClick });
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
        if (!editorRef.current) return;
        highTextRef.current = text;
        const formulaStr = text[0] === '=' ? text.slice(1) : '';
        const sequenceNodes = getFormulaToken(formulaStr);
        const parsedFormula = sequenceNodes.reduce((pre, cur) => (typeof cur === 'object' ? `${pre}${cur.token}` : `${pre}${cur}`), '');
        const ranges = highlightDoc(
            editorRef.current,
            parsedFormula === formulaStr ? sequenceNodes : [],
            isNeedResetSelection,
            newSelections
        );
        refSelections.current = ranges;

        if (isEnd) {
            const currentDocSelections = newSelections ?? editor?.getSelectionRanges();
            if (currentDocSelections?.length !== 1) {
                return;
            }
            const docRange = currentDocSelections[0];
            const offset = docRange.startOffset - 1;
            const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);
            const refIndex = findRefSequenceIndex(sequenceNodes, nodeIndex);
            // make sure current editing selection is at the end
            if (refIndex >= 0) {
                const target = ranges.splice(refIndex, 1)[0];
                target && ranges.push(target);
            }

            highlightSheet(isFocus ? ranges : [], editorRef.current);
        }
    });

    // re highlight when focus
    useEffect(() => {
        if (isFocus) {
            highlight(formulaText, false, true);
        }
    }, [isFocus]);

    // re highlight when formula text changed
    useEffect(() => {
        if (isFocus) {
            if (highTextRef.current === formulaText) return;
            highlight(formulaText, false, true);
        }
    }, [formulaText]);

    useVerify(isFocus, onVerify, formulaText);
    const focus = useFocus(editor);

    const resetSelection = useResetSelection(isFocus, unitId, subUnitId);

    useEffect(() => {
        onFormulaSelectingChange(isSelecting, docSelectionRenderService?.isFocusing ?? true);
    }, [onFormulaSelectingChange, isSelecting]);

    useKeyboardEvent(isFocus, keyboardEventConfig, editor);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (formulaEditorContainerRef.current) {
            dispose = editorService.register({
                autofocus,
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
    useLeftAndRightArrow(Boolean(isFocus && isFocusing && moveCursor), selectingMode, editor, onMoveInEditor);

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
        isSelectingRef,
        unitId,
        subUnitId,
        refSelections,
        isSupportAcrossSheet,
        Boolean(selectingMode),
        editor,
        handleSelectionChange
    );
    useSwitchSheet(isFocus && Boolean(isSelecting && docFocusing), unitId, isSupportAcrossSheet, isFocusSet, onBlur, () => {
        highlight(formulaTextRef.current, false, true);
    });

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
        <div className={className}>
            <div
                className={clsx(
                    `
                      univer-relative univer-box-border univer-flex univer-h-full univer-w-full univer-items-center
                      univer-justify-around univer-gap-2 univer-rounded-none univer-p-0 univer-ring-1
                    `,
                    {
                        'univer-ring-primary-500': isFocus,
                        'univer-ring-red-500': isError,
                    }
                )}
                ref={sheetEmbeddingRef}
            >
                <div
                    ref={formulaEditorContainerRef}
                    className="univer-relative univer-h-full univer-w-full"
                    onMouseUp={handleMouseUp}
                />
            </div>
            {errorText !== undefined
                ? (
                    <div className="univer-my-1 univer-text-xs univer-text-red-500">
                        {errorText}
                    </div>
                )
                : null}
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
});
