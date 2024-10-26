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
import { IEditorService } from '@univerjs/docs-ui';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useBlur } from '../range-selector/hooks/useBlur';
import { useFormulaToken } from '../range-selector/hooks/useFormulaToken';
import { useResize } from '../range-selector/hooks/useResize';
import { HelpFunction } from './help-function/HelpFunction';
import { useClickOutside } from './hooks/useClickOutside';
import { useFormulaDescribe } from './hooks/useFormulaDescribe';
import { useFormulaSearch } from './hooks/useFormulaSearch';
import { useDocHight, useSheetHighlight } from './hooks/useHighlight';
import { useLeftAndRightArrow } from './hooks/useLeftAndRightArrow';
import { useRefactorEffect } from './hooks/useRefactorEffect';
import { useSheetSelectionChange } from './hooks/useSheetSelectionChange';
import styles from './index.module.less';
import { SearchFunction } from './search-function/SearchFunction';
import { getFormulaText } from './utils/getFormulaText';

export interface IFormulaEditorProps {
    unitId: string;
    subUnitId: string;
    initValue: `=${string}`;
    onChange: (text: string) => void;
    errorText?: string | ReactNode;
    isFocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    isSupportAcrossSheet?: boolean;
    actions?: {
        handleOutClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb: (v: boolean) => void) => void;
    };
}
const noop = () => { };
export function FormulaEditor(props: IFormulaEditorProps) {
    const { errorText, initValue, unitId, subUnitId, isFocus: _isFocus = true, isSupportAcrossSheet = false,
            onFocus = noop,
            onChange,
            actions,
    } = props;

    const editorService = useDependency(IEditorService);

    const sheetEmbeddingRef = useRef<HTMLDivElement>(null);
    const [formulaText, formulaTextSet] = useState(() => {
        if (initValue.startsWith('=')) {
            return initValue;
        }
        return `=${initValue}`;
    });

    // init actions
    if (actions) {
        actions.handleOutClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb: (v: boolean) => void) => {
            if (sheetEmbeddingRef.current) {
                const isContain = sheetEmbeddingRef.current.contains(e.target as Node);
                cb(isContain);
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

    const { sequenceNodes, sequenceNodesSet } = useFormulaToken(formulaWithoutEqualSymbol);
    const refSelections = useDocHight(editorId, sequenceNodes);

    const focus = useMemo(() => {
        return () => {
            if (editor) {
                const focusId = editorService.getFocusId();
                if (focusId !== editor.getEditorId()) {
                    editorService.focus(editor?.getEditorId());
                    const selections = editor.getSelectionRanges();
                    if (!selections.length) {
                        const body = editor.getDocumentData().body?.dataStream ?? '\r\n';
                        const offset = Math.max(body.length - 2, 0);
                        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
                    }
                }
            }
        };
    }, [editor]);

    const blur = useMemo(() => () => {
        if (editor) {
            editor.blur();
        }
    }, [editor]);

    const handleSelectionChange = (refString: string, offset: number) => {
        const result = `=${refString}`;
        formulaTextSet(result);
        onChange(result);
        if (offset > -1) {
            setTimeout(() => {
                editor?.setSelectionRanges([{ startOffset: offset + 1, endOffset: offset + 1 }]);
            }, 30);
        }
    };

    useSheetHighlight(isFocus, unitId, subUnitId, refSelections);
    useResize(editor);
    useRefactorEffect(isFocus, unitId);
    useLeftAndRightArrow(editor);
    useSheetSelectionChange(isFocus, unitId, subUnitId, sequenceNodes, isSupportAcrossSheet, editor, handleSelectionChange);
    useBlur(editorId, isFocusSet);
    const { searchList, searchText, handlerFormulaReplace, reset: resetFormulaSearch } = useFormulaSearch(sequenceNodes, editor);
    const { functionInfo, paramIndex, reset } = useFormulaDescribe(formulaText, editor);

    useClickOutside(resetFormulaSearch, searchFunctionRef.current);

    useEffect(() => {
        if (editor) {
            const d = editor.input$.subscribe((e) => {
                const text = (e.data.body?.dataStream ?? '').replaceAll(/\n|\r/g, '');
                if (text.startsWith('=')) {
                    formulaTextSet(text);
                    onChange(text);
                } else {
                    const result = `=${text}`;
                    formulaTextSet(result);
                    onChange(result);
                    // 当无内容的时候,删除'=',会导致 doc 编辑器内的内容和 formulaText 不同步,导致失去焦点, 这里强制同步一次.
                    if (!text) {
                        sequenceNodesSet([]);
                    }
                    setTimeout(() => {
                        editor.setSelectionRanges([{ startOffset: result.length, endOffset: result.length }]);
                    }, 16);
                }
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor]);

    useEffect(() => {
        isFocusSet(_isFocus);
        if (_isFocus) {
            setTimeout(() => {
                focus();
            }, 300);
        } else {
            blur();
        }
    }, [_isFocus]);

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
    }, [formulaEditorContainerRef.current]);

    const handleFunctionSelect = (v: string) => {
        const res = handlerFormulaReplace(v);
        if (res) {
            formulaTextSet(`=${res.text}`);
            focus();
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
        }
    };

    const handleClick = () => {
        if (editor) {
            isFocusSet(true);
            onFocus();
            focus();
        }
    };
    return (
        <div className={styles.sheetEmbeddingFormulaEditor}>
            <div
                className={clsx(styles.sheetEmbeddingFormulaEditorWrap, {
                    [styles.sheetEmbeddingFormulaEditorActive]: isFocus,
                })}
                ref={sheetEmbeddingRef}
            >
                <div
                    className={styles.sheetEmbeddingFormulaEditorText}
                    ref={formulaEditorContainerRef}
                    onClick={() => {
                        setTimeout(() => {
                            handleClick();
                        }, 30);
                    }}
                >
                </div>
                {errorText !== undefined ? <div className={styles.sheetEmbeddingFormulaEditorErrorWrap}>{errorText}</div> : null}
            </div>
            <HelpFunction
                editorId={editorId}
                paramIndex={paramIndex}
                functionInfo={functionInfo}
                onClose={reset}
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
