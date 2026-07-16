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
import type { IUniverSheetsFormulaUIConfig } from '../../config/config';
import type { FormulaSelectingType } from './hooks/use-formula-selection';
import type { IRefSelection } from './hooks/use-highlight';
import {
    BuildTextUtils,
    createInternalEditorID,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    generateRandomId,
    HorizontalAlign,
    ICommandService,
    IConfigService,
    Injector,
    IUniverInstanceService,
    noop,
    UniverInstanceType,
    VerticalAlign,
} from '@univerjs/core';
import { clsx } from '@univerjs/design';
import {
    createEditorUndoRedoKeyboardConfig,
    DocBackScrollRenderController,
    DocSelectionRenderService,
    IEditorService,
    useKeyboardEvent,
    useResize,
} from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { EMBEDDING_FORMULA_EDITOR } from '@univerjs/sheets-ui';
import { useDependency, useEvent, useObservable, useUpdateEffect } from '@univerjs/ui';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PLUGIN_CONFIG_KEY_BASE } from '../../config/config';
import { findIndexFromSequenceNodes, findRefSequenceIndex } from '../range-selector/utils/find-index-from-sequence-nodes';
import {
    IFormulaEmbedInteractionBoundaryService,
    IFormulaEmbedRuntimeFocusCoordinator,
    registerFormulaEditorRuntimePortal,
    resolveActiveFormulaEmbedRuntimeDomScope,
    resolveFormulaEmbedRuntimeDomScope,
} from './formula-embed-integration.service';
import { HelpFunction } from './help-function/HelpFunction';
import { hasActiveFormulaEmbedInteraction, shouldRefocusFormulaEditorOnMouseUp, useFocus } from './hooks/use-focus';
import { getSelectionAfterLaggingFormulaInput, useFormulaSelecting } from './hooks/use-formula-selection';
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
    borderless?: boolean;
    canvasStyle?: {
        backgroundColor?: string;
        fontSize?: number;
    };
}

export interface IFormulaEditorRef {
    isClickOutSide: (e: MouseEvent) => boolean;
}

export function shouldApplyFormulaSelectionChange(
    selectingMode: FormulaSelectingType | number,
    isFocusing: boolean | undefined,
    hasActiveInteraction: boolean
): boolean {
    return Boolean(selectingMode) || Boolean(isFocusing) || hasActiveInteraction;
}

interface IFormulaEditorSelectionSyncService {
    getEditor: (editorId: string) => Pick<Editor, 'setSelectionRanges'> | null | undefined | void;
}

export function syncCounterpartFormulaEditorSelection(
    editorService: IFormulaEditorSelectionSyncService,
    editorId: string,
    selections: ITextRange[] | undefined
): void {
    if (!selections?.length) {
        return;
    }

    const syncEditorId = editorId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY
        ? DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
        : editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
            ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
            : null;

    if (!syncEditorId) {
        return;
    }

    editorService.getEditor(syncEditorId)?.setSelectionRanges(selections, false);
}

export { getSelectionAfterLaggingFormulaInput } from './hooks/use-formula-selection';

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
        borderless = false,
        canvasStyle,
    } = props;

    const editorService = useDependency(IEditorService);
    const commandService = useDependency(ICommandService);
    const injector = useDependency(Injector);
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
    const [editor, setEditor] = useState<Editor>();
    const [isFocus, setIsFocus] = useState(_isFocus);
    const formulaEditorContainerRef = useRef<HTMLDivElement>(null);
    const editorId = useMemo(() => propEditorId ?? createInternalEditorID(`${EMBEDDING_FORMULA_EDITOR}-${generateRandomId(4)}`), []);
    const isError = errorText !== undefined;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const document = univerInstanceService.getUnit<DocumentDataModel>(editorId);
    useObservable(document?.change$);
    const getFormulaToken = useFormulaToken();
    const formulaText = BuildTextUtils.transform.getPlainText(document?.getBody()?.dataStream ?? '');
    const formulaTextRef = useStateRef(formulaText);
    const formulaWithoutEqualSymbol = useMemo(() => getFormulaText(formulaText), [formulaText]);
    const sequenceNodes = useMemo(() => getFormulaToken(formulaWithoutEqualSymbol), [formulaWithoutEqualSymbol, getFormulaToken]);
    const { isSelecting, isSelectingRef } = useFormulaSelecting({ unitId, subUnitId, editor, editorId, isFocus, disableOnClick: disableSelectionOnClick });
    const highTextRef = useRef('');
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const isFocusing = docSelectionRenderService?.isFocusing;
    const currentDoc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC), [univerInstanceService]);
    const currentDoc = useObservable(currentDoc$);
    const docFocusing = currentDoc?.getUnitId() === editorId;
    const refSelectionsRef = useRef([] as IRefSelection[]);
    const getRefSelections = useEvent(() => refSelectionsRef.current);
    const getRefSelectionCount = useEvent(() => getRefSelections().length);
    const selectingMode = isSelecting;

    // whether to hide formula search and help popup
    const configService = useDependency(IConfigService);
    const functionScreenTips = configService.getConfig<IUniverSheetsFormulaUIConfig>(PLUGIN_CONFIG_KEY_BASE)?.functionScreenTips ?? true;

    useUpdateEffect(() => {
        onChange(formulaText);
    }, [formulaText, onChange]);

    useEffect(() => {
        if (!isFocus || !editor) {
            return undefined;
        }

        const subscription = editor.input$.subscribe(({ content, isComposing }) => {
            if (isComposing) {
                return;
            }

            queueMicrotask(() => {
                const selection = editor.getSelectionRanges()?.[0];
                const dataStream = editor.getDocumentData().body?.dataStream ?? '';
                const normalizedSelection = getSelectionAfterLaggingFormulaInput(dataStream, selection, content);
                if (!normalizedSelection) {
                    return;
                }

                const selections = [normalizedSelection];
                editor.setSelectionRanges(selections, false);
                syncCounterpartFormulaEditorSelection(editorService, editorId, selections);
            });
        });

        return () => subscription.unsubscribe();
    }, [editor, editorId, editorService, isFocus]);

    const highlightDoc = useDocHight('=');
    const highlightSheet = useSheetHighlight(unitId, subUnitId);
    const highlight = useEvent((text: string, isNeedResetSelection: boolean = true, isEnd?: boolean, newSelections?: ITextRange[]) => {
        if (!editorRef.current) return;
        highTextRef.current = text;
        const formulaStr = text[0] === '=' ? text.slice(1) : '';
        const sequenceNodes = getFormulaToken(formulaStr);
        const ranges = highlightDoc(
            editorRef.current,
            sequenceNodes,
            isNeedResetSelection,
            newSelections,
            formulaStr
        );
        refSelectionsRef.current = ranges;

        if (isEnd) {
            const currentDocSelections = newSelections ?? editor?.getSelectionRanges();
            if (currentDocSelections?.length === 1) {
                const docRange = currentDocSelections[0];
                const offset = docRange.startOffset - 1;
                const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);
                const refIndex = findRefSequenceIndex(sequenceNodes, nodeIndex);
                // make sure current editing selection is at the end
                if (refIndex >= 0) {
                    const target = ranges.splice(refIndex, 1)[0];
                    target && ranges.push(target);
                }
            }

            highlightSheet(isFocus ? ranges : [], editorRef.current, isEnd);
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

    const resolvedKeyboardEventConfig = useMemo(() => createEditorUndoRedoKeyboardConfig({
        commandService,
        univerInstanceService,
        editorUnitId: editorId,
        keyCodes: keyboardEventConfig?.keyCodes,
        handler: keyboardEventConfig?.handler,
    }), [commandService, editorId, keyboardEventConfig, univerInstanceService]);

    useKeyboardEvent(isFocus, resolvedKeyboardEventConfig, editor);

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
                    documentStyle: {
                        pageSize: {
                            width: Number.POSITIVE_INFINITY,
                            height: Number.POSITIVE_INFINITY,
                        },
                        documentFlavor: DocumentFlavor.UNSPECIFIED,
                        marginTop: 0,
                        marginBottom: 0,
                        marginRight: 0,
                        marginLeft: 0,
                        paragraphLineGapDefault: 0,
                        renderConfig: {
                            horizontalAlign: HorizontalAlign.UNSPECIFIED,
                            verticalAlign: VerticalAlign.TOP,
                        },
                    },
                },
                canvasStyle,
            }, formulaEditorContainerRef.current);
            const registeredEditor = editorService.getEditor(editorId)! as Editor;
            editorRef.current = registeredEditor;
            setEditor(registeredEditor);
            highlight(initValue, false, true);
        }

        return () => {
            editorRef.current = undefined;
            dispose?.dispose();
        };
    }, []);

    useEffect(() => {
        const formulaEditorContainer = formulaEditorContainerRef.current;
        if (!isFocus || !formulaEditorContainer || !injector.has(IFormulaEmbedRuntimeFocusCoordinator)) {
            return undefined;
        }

        const focusCoordinator = injector.get(IFormulaEmbedRuntimeFocusCoordinator);
        const scope = resolveFormulaEmbedRuntimeDomScope(formulaEditorContainer) ??
            focusCoordinator.resolveRuntimeScopeByChildUnitId(editorId) ??
            resolveActiveFormulaEmbedRuntimeDomScope(formulaEditorContainer.ownerDocument);
        if (!scope) {
            return undefined;
        }

        const collection = new DisposableCollection();
        const interactionBoundaryService = injector.has(IFormulaEmbedInteractionBoundaryService)
            ? injector.get(IFormulaEmbedInteractionBoundaryService)
            : undefined;

        collection.add(focusCoordinator.acquireLease({
            embedId: scope.embedId,
            role: 'child-editor',
            owner: 'sheet-formula-editor',
            hostUnitId: scope.hostUnitId,
            childUnitId: scope.childUnitId,
            associatedChildUnitIds: [editorId],
        }));
        if (interactionBoundaryService) {
            collection.add(interactionBoundaryService.registerOwnedElement(scope.embedId, formulaEditorContainer));
        }
        collection.add(focusCoordinator.registerElement({
            embedId: scope.embedId,
            role: 'child-editor',
            element: formulaEditorContainer,
        }));
        collection.add(registerFormulaEditorRuntimePortal({
            embedId: scope.embedId,
            editorId,
            ownerDocument: formulaEditorContainer.ownerDocument,
            interactionBoundaryService,
            focusCoordinator,
        }));

        return () => collection.dispose();
    }, [editorId, injector, isFocus]);

    useLayoutEffect(() => {
        let focusRetryFrame = 0;
        let finalFocusRetryFrame = 0;

        const retryFocus = () => {
            if (_isFocus && !docSelectionRenderService?.isFocusing) {
                focus();
            }
        };

        if (_isFocus) {
            setIsFocus(_isFocus);
            focus();
            // In Shadow DOM hosts, canvas dblclick can steal focus back after the editor becomes visible.
            focusRetryFrame = requestAnimationFrame(() => {
                retryFocus();
                finalFocusRetryFrame = requestAnimationFrame(retryFocus);
            });
        } else {
            if (resetSelectionOnBlur) {
                editor?.blur();
                resetSelection();
            }
            setIsFocus(_isFocus);
        }

        return () => {
            cancelAnimationFrame(focusRetryFrame);
            cancelAnimationFrame(finalFocusRetryFrame);
        };
    }, [_isFocus, docSelectionRenderService, editor, focus, resetSelection, resetSelectionOnBlur]);

    const { checkScrollBar } = useResize(editor, isSingle, autoScrollbar);
    useRefactorEffect(isFocus, isSelecting, unitId, editorId, disableContextMenu);
    useLeftAndRightArrow(Boolean(isFocus && isFocusing && moveCursor), selectingMode, editor, onMoveInEditor, getRefSelectionCount);

    const handleSelectionChange = useEvent((refString: string, offset: number, isEnd: boolean) => {
        if (!shouldApplyFormulaSelectionChange(
            selectingMode,
            isFocusing,
            hasActiveFormulaEmbedInteraction(formulaEditorContainerRef.current)
        )) {
            return;
        }

        const newSelections = offset !== -1 ? [{ startOffset: offset + 1, endOffset: offset + 1, collapsed: true }] : undefined;
        highlight(`=${refString}`, true, isEnd, newSelections);
        syncCounterpartFormulaEditorSelection(editorService, editorId, newSelections);
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
        isFocus && Boolean(isSelecting),
        isFocus,
        isSelectingRef,
        unitId,
        subUnitId,
        getRefSelections,
        isSupportAcrossSheet,
        Boolean(selectingMode),
        editor,
        handleSelectionChange
    );
    useSwitchSheet(isFocus && Boolean(isSelecting && docFocusing), unitId, isSupportAcrossSheet, setIsFocus, onBlur, () => {
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

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        if (hasActiveFormulaEmbedInteraction(formulaEditorContainerRef.current)) {
            return;
        }
        if (!shouldRefocusFormulaEditorOnMouseUp({
            target: event.target,
            isFocusing,
            isPointerSelecting: docSelectionRenderService?.isOnPointerEvent,
        })) {
            return;
        }
        setIsFocus(true);
        onFocus();
        focus();
    };

    return (
        <div className={className}>
            <div
                ref={sheetEmbeddingRef}
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-size-full univer-items-center
                  univer-justify-around univer-gap-2 univer-rounded-none univer-p-0
                `, {
                    'univer-ring-1': !borderless,
                    'univer-ring-primary-500': isFocus && !borderless,
                    'univer-ring-red-500': isError && !borderless,
                })}
            >
                <div
                    ref={formulaEditorContainerRef}
                    data-u-comp="formula-editor"
                    className="univer-relative univer-size-full"
                    onMouseUp={handleMouseUp}
                />
            </div>
            {(errorText !== undefined) && (
                <div className="univer-my-1 univer-text-xs univer-text-red-500">
                    {errorText}
                </div>
            )}
            {(functionScreenTips && editor && formulaWithoutEqualSymbol !== '') && (
                <HelpFunction
                    editor={editor}
                    isFocus={isFocus}
                    formulaText={formulaText}
                    onClose={() => focus()}
                />
            )}
            {(functionScreenTips && !!editor) && (
                <SearchFunction
                    isFocus={isFocus}
                    sequenceNodes={sequenceNodes}
                    onSelect={handleFunctionSelect}
                    ref={searchFunctionRef}
                    editor={editor}
                />
            )}
        </div>
    );
});
