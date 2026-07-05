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

import type { DocumentDataModel, IAccessor, IUnitRangeName, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheetWithCache, isFormulaLexerToken, LexerTreeBuilder, matchRefDrawToken, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useEvent } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render.service';
import { useStateRef } from './use-state-ref';

export function resolveFormulaSelectionDataStream(accssor: IAccessor, editor?: Pick<Editor, 'getDocumentData'>, editorId?: string) {
    const editorDataStream = editor?.getDocumentData().body?.dataStream;
    if (editorDataStream != null) {
        return { dataStream: editorDataStream, offset: 0 };
    }

    const univerInstanceService = accssor.get(IUniverInstanceService);
    const editorDocumentModel = editorId
        ? univerInstanceService.getUnit<DocumentDataModel>(editorId, UniverInstanceType.UNIVER_DOC)
        : undefined;
    const documentModel = editorDocumentModel ?? univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

    if (!documentModel?.getBody()) {
        return;
    }

    const dataStream = documentModel.getBody()?.dataStream ?? '';
    return { dataStream, offset: 0 };
}

export enum FormulaSelectingType {
    NOT_SELECT = 0,
    NEED_ADD = 1,
    CAN_EDIT = 2,
    // editing cross sheet reference
    EDIT_OTHER_SHEET_REFERENCE = 3,
    EDIT_OTHER_WORKBOOK_REFERENCE = 4,
}

export function shouldSkipReferenceEditingByPointer(isDisabledByPointer: boolean, disableOnClick?: boolean): boolean {
    return isDisabledByPointer && !disableOnClick;
}

export function resolveFormulaSelectionWorkbook<TWorkbook>(currentWorkbook: TWorkbook | null | undefined, fallbackWorkbook: TWorkbook | null | undefined): TWorkbook | undefined {
    return currentWorkbook ?? fallbackWorkbook ?? undefined;
}

export function resolveFormulaSelectionCursorIndex(activeRange: { collapsed?: boolean; startOffset?: number } | undefined, dataStream: string): number {
    const index = activeRange?.collapsed ? activeRange.startOffset! : -1;
    if (index <= 0 && dataStream.startsWith('=') && dataStream.length > 0) {
        return dataStream.length;
    }

    return index;
}

export function getSelectionAfterLaggingFormulaInput(
    dataStream: string,
    selection: { collapsed?: boolean; startOffset?: number; endOffset?: number } | undefined,
    content: string
): { startOffset: number; endOffset: number; collapsed: true } | undefined {
    if (
        !content ||
        content.includes('\r') ||
        content.includes('\n') ||
        !dataStream.startsWith('=') ||
        !selection?.collapsed
    ) {
        return undefined;
    }

    const startOffset = selection.startOffset;
    if (startOffset == null) {
        return undefined;
    }
    if (selection.endOffset !== startOffset) {
        return undefined;
    }

    if (dataStream.slice(startOffset, startOffset + content.length) !== content) {
        return undefined;
    }

    const nextOffset = startOffset + content.length;
    return {
        startOffset: nextOffset,
        endOffset: nextOffset,
        collapsed: true,
    };
}

export function resolveFormulaSelectingIntent(adding: boolean, editing: boolean): FormulaSelectingType {
    if (adding) {
        return FormulaSelectingType.NEED_ADD;
    }

    if (editing) {
        return FormulaSelectingType.CAN_EDIT;
    }

    return FormulaSelectingType.NOT_SELECT;
}

// eslint-disable-next-line max-lines-per-function
export function useFormulaSelecting(opts: { editor?: Editor; editorId: string; isFocus: boolean; disableOnClick?: boolean; unitId: string; subUnitId: string }) {
    const { editor, editorId, isFocus, disableOnClick, unitId, subUnitId } = opts;
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetRenderer = renderManagerService.getRenderById(unitId);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const injector = useDependency(Injector);
    const [isSelecting, innerSetIsSelecting] = useState<FormulaSelectingType>(FormulaSelectingType.NOT_SELECT);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const isDisabledByPointer = useRef(true);
    const lastInputContentRef = useRef('');
    const refSelectionsRenderService = sheetRenderer?.with(RefSelectionsRenderService);
    const isSelectingRef = useStateRef(isSelecting);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const sourceSheet = workbook?.getSheetBySheetId(subUnitId);

    const setIsSelecting = useEvent((v: FormulaSelectingType) => {
        if (refSelectionsRenderService) {
            refSelectionsRenderService.setSkipLastEnabled(v === FormulaSelectingType.NEED_ADD || v === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE || v === FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE);
        }
        isSelectingRef.current = v;
        innerSetIsSelecting(v);
    });

    // eslint-disable-next-line complexity
    const calculateSelectingType = useEvent(() => {
        const currentWorkbook = resolveFormulaSelectionWorkbook(
            univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET),
            workbook
        );
        if (!currentWorkbook) return;
        const currentSheet = currentWorkbook.getActiveSheet();
        const activeRange = editor?.getSelectionRanges()?.[0] ?? docSelectionRenderService?.getActiveTextRange();
        const config = resolveFormulaSelectionDataStream(injector, editor, editorId);
        if (!config) return;
        const dataStream = config?.dataStream?.slice(0, -2);
        const normalizedActiveRange = getSelectionAfterLaggingFormulaInput(dataStream, activeRange, lastInputContentRef.current) ?? activeRange;
        const index = resolveFormulaSelectionCursorIndex(normalizedActiveRange, dataStream);
        const nodes = (lexerTreeBuilder.sequenceNodesBuilder(dataStream) ?? []).map((node) => {
            if (typeof node === 'object') {
                if (node.nodeType === sequenceNodeType.REFERENCE) {
                    return {
                        ...node,
                        range: deserializeRangeWithSheetWithCache(node.token),
                    };
                }

                return {
                    ...node,
                    range: undefined,
                };
            }

            return node;
        });
        const char = dataStream[index - 1];
        const nextChar = dataStream[index];
        const focusingNode = nodes.find((node) => typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE && index === node.endIndex + 2) as unknown as (ISequenceNode & { range: IUnitRangeName });
        const adding = (char && matchRefDrawToken(char)) && (!nextChar || (isFormulaLexerToken(nextChar) && nextChar !== matchToken.OPEN_BRACKET));
        const editing = Boolean(focusingNode);
        const selectingIntent = resolveFormulaSelectingIntent(Boolean(adding), editing);

        if (dataStream?.substring(0, 1) === '=' && selectingIntent !== FormulaSelectingType.NOT_SELECT) {
            if (selectingIntent === FormulaSelectingType.NEED_ADD) {
                isDisabledByPointer.current = false;
                setIsSelecting(FormulaSelectingType.NEED_ADD);
            } else if (focusingNode) {
                if (shouldSkipReferenceEditingByPointer(isDisabledByPointer.current, disableOnClick)) {
                    return;
                }
                isDisabledByPointer.current = false;

                const { sheetName, unitId } = focusingNode.range;
                const currentUnitId = resolveFormulaSelectionWorkbook(
                    univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET),
                    workbook
                )?.getUnitId();
                if (unitId && unitId !== currentUnitId) {
                    setIsSelecting(FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE);
                } else if (
                    (!sheetName && currentSheet.getSheetId() === sourceSheet?.getSheetId()) ||
                    sheetName === currentSheet.getName()
                ) {
                    setIsSelecting(FormulaSelectingType.CAN_EDIT);
                } else {
                    setIsSelecting(FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE);
                }
            }
        } else {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
        }
    });

    useEffect(() => {
        const sub = docSelectionManagerService.textSelection$
            .pipe(filter((param) => param.unitId === editorId))
            .subscribe(() => {
                calculateSelectingType();
            });

        return () => sub.unsubscribe();
    }, [calculateSelectingType, docSelectionManagerService.textSelection$, editorId]);

    useEffect(() => {
        if (!isFocus || !editor) {
            return;
        }

        let timeout: ReturnType<typeof setTimeout> | undefined;
        const sub = editor.input$.subscribe(({ content, isComposing }) => {
            if (!isComposing) {
                lastInputContentRef.current = content;
            }
            queueMicrotask(() => {
                calculateSelectingType();
            });

            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                calculateSelectingType();
                lastInputContentRef.current = '';
            }, 0);
        });

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            sub.unsubscribe();
        };
    }, [calculateSelectingType, editor, isFocus]);

    useEffect(() => {
        if (!isFocus) {
            return;
        }

        const editorDocumentModel = univerInstanceService.getUnit<DocumentDataModel>(editorId, UniverInstanceType.UNIVER_DOC);
        const sub = editorDocumentModel?.change$?.subscribe(() => {
            queueMicrotask(calculateSelectingType);
        });

        return () => sub?.unsubscribe();
    }, [calculateSelectingType, editorId, isFocus, univerInstanceService]);

    useEffect(() => {
        if (!isFocus) {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
            isDisabledByPointer.current = true;
        }
    }, [isFocus, setIsSelecting]);

    useEffect(() => {
        if (!disableOnClick) return;
        const sub = renderer?.mainComponent?.onPointerDown$.subscribeEvent(() => {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
            isDisabledByPointer.current = true;
        });

        return () => sub?.unsubscribe();
    }, [disableOnClick, renderer?.mainComponent?.onPointerDown$, setIsSelecting]);

    useEffect(() => {
        if (!isFocus) return;
        const sub = workbook?.activeSheet$.subscribe(() => {
            calculateSelectingType();
        });
        const sub2 = univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
            calculateSelectingType();
        });

        return () => {
            sub?.unsubscribe();
            sub2?.unsubscribe();
        };
    }, [calculateSelectingType, isFocus, workbook?.activeSheet$, univerInstanceService.getCurrentTypeOfUnit$]);

    return { isSelecting, isSelectingRef };
}
