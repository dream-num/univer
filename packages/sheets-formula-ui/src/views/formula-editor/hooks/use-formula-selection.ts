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

import type { DocumentDataModel, IAccessor, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import type { RefObject } from 'react';
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

export function resolveFormulaSelectionDataStream(accssor: IAccessor, editor?: Pick<Editor, 'getDocumentDataModel'>, editorId?: string) {
    const editorDataStream = editor?.getDocumentDataModel()?.getBody()?.dataStream;
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

export function shouldAddFormulaReference(dataStream: string, index: number): boolean {
    if (index <= 0 || index > dataStream.length) return false;
    const prefix = dataStream.slice(0, index);
    // A line break alone never arms point mode; following spaces remain valid delimiters.
    if (/[\r\n]$/.test(prefix)) return false;
    const char = prefix.slice(-1);
    const nextChar = dataStream[index];
    return Boolean(
        char &&
        (matchRefDrawToken(char) || char === '!') &&
        (!nextChar || (isFormulaLexerToken(nextChar) && nextChar !== matchToken.OPEN_BRACKET))
    );
}

interface IFormulaSelectingOptions {
    editor?: Editor;
    editorId: string;
    isFocus: boolean;
    disableOnClick?: boolean;
    resetSignal?: number;
    unitId: string;
    subUnitId: string;
}

function useCalculateFormulaSelectingType(
    opts: IFormulaSelectingOptions,
    setIsSelecting: (value: FormulaSelectingType) => void,
    isDisabledByPointerRef: RefObject<boolean>,
    lastInputContentRef: RefObject<string>
) {
    const { editor, editorId, disableOnClick, unitId, subUnitId } = opts;
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const injector = useDependency(Injector);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const sourceSheet = workbook?.getSheetBySheetId(subUnitId);
    const docSelectionRenderService = renderManagerService.getRenderUnitById(editorId)?.with(DocSelectionRenderService);
    const getReferenceSelectingType = (node: ISequenceNode, currentWorkbook: Workbook) => {
        const { sheetName, unitId: referenceUnitId } = deserializeRangeWithSheetWithCache(node.token);
        if (referenceUnitId && referenceUnitId !== currentWorkbook.getUnitId()) {
            return FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE;
        }
        const currentSheet = currentWorkbook.getActiveSheet();
        return (!sheetName && currentSheet.getSheetId() === sourceSheet?.getSheetId()) || sheetName === currentSheet.getName()
            ? FormulaSelectingType.CAN_EDIT
            : FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE;
    };
    return useEvent(() => {
        const currentWorkbook = resolveFormulaSelectionWorkbook(univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET), workbook);
        if (!currentWorkbook) return;
        const activeRange = editor?.getSelectionRanges()?.[0] ?? docSelectionRenderService?.getActiveTextRange();
        const config = resolveFormulaSelectionDataStream(injector, editor, editorId);
        if (!config) return;
        const dataStream = config.dataStream.slice(0, -2);
        const normalizedActiveRange = getSelectionAfterLaggingFormulaInput(dataStream, activeRange, lastInputContentRef.current) ?? activeRange;
        const index = resolveFormulaSelectionCursorIndex(normalizedActiveRange, dataStream);
        const nodes = lexerTreeBuilder.sequenceNodesBuilder(dataStream) ?? [];
        const focusingNode = nodes.find((node): node is ISequenceNode => typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE && index === node.endIndex + 2);
        const intent = resolveFormulaSelectingIntent(shouldAddFormulaReference(dataStream, index), Boolean(focusingNode));
        if (!dataStream.startsWith('=') || intent === FormulaSelectingType.NOT_SELECT) {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
            return;
        }
        if (intent === FormulaSelectingType.NEED_ADD) {
            isDisabledByPointerRef.current = false;
            setIsSelecting(FormulaSelectingType.NEED_ADD);
        } else if (focusingNode && !shouldSkipReferenceEditingByPointer(isDisabledByPointerRef.current, disableOnClick)) {
            isDisabledByPointerRef.current = false;
            setIsSelecting(getReferenceSelectingType(focusingNode, currentWorkbook));
        }
    });
}

function useFormulaSelectionInput(opts: IFormulaSelectingOptions, calculateSelectingType: () => void, lastInputContentRef: RefObject<string>) {
    const { editor, editorId, isFocus } = opts;
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    useEffect(() => {
        const sub = docSelectionManagerService.textSelection$
            .pipe(filter((param) => param.unitId === editorId))
            .subscribe(calculateSelectingType);
        return () => sub.unsubscribe();
    }, [calculateSelectingType, docSelectionManagerService.textSelection$, editorId]);
    useEffect(() => {
        if (!isFocus || !editor) return;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const sub = editor.input$.subscribe(({ content, isComposing }) => {
            if (!isComposing) lastInputContentRef.current = content;
            queueMicrotask(calculateSelectingType);
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                calculateSelectingType();
                lastInputContentRef.current = '';
            }, 0);
        });
        return () => {
            sub.unsubscribe();
            if (timeout) clearTimeout(timeout);
        };
    }, [calculateSelectingType, editor, isFocus, lastInputContentRef]);
    useEffect(() => {
        if (!isFocus) return;
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>(editorId, UniverInstanceType.UNIVER_DOC);
        const sub = documentModel?.change$?.subscribe(() => queueMicrotask(calculateSelectingType));
        return () => sub?.unsubscribe();
    }, [calculateSelectingType, editorId, isFocus, univerInstanceService]);
}

function useFormulaSelectionReset(opts: IFormulaSelectingOptions, resetSelecting: () => void) {
    const { isFocus, resetSignal, disableOnClick, editorId } = opts;
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderUnitById(editorId);
    useEffect(() => {
        if (!isFocus) resetSelecting();
    }, [isFocus, resetSelecting]);
    useEffect(() => {
        if (resetSignal !== undefined) resetSelecting();
    }, [resetSignal, resetSelecting]);
    useEffect(() => {
        if (!disableOnClick) return;
        const sub = renderer?.mainComponent?.onPointerDown$.subscribeEvent(resetSelecting);
        return () => sub?.unsubscribe();
    }, [disableOnClick, renderer?.mainComponent?.onPointerDown$, resetSelecting]);
}

export function useFormulaSelecting(opts: IFormulaSelectingOptions) {
    const { unitId, isFocus } = opts;
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const refSelectionsRenderService = renderManagerService.getRenderUnitById(unitId)?.with(RefSelectionsRenderService);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const [isSelecting, setIsSelecting] = useState<FormulaSelectingType>(FormulaSelectingType.NOT_SELECT);
    const isDisabledByPointerRef = useRef(true);
    const lastInputContentRef = useRef('');
    const isSelectingRef = useStateRef(isSelecting);
    const updateSelecting = useEvent((value: FormulaSelectingType) => {
        refSelectionsRenderService?.setSkipLastEnabled(value === FormulaSelectingType.NEED_ADD || value === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE || value === FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE);
        isSelectingRef.current = value;
        setIsSelecting(value);
    });
    const resetSelecting = useEvent(() => {
        updateSelecting(FormulaSelectingType.NOT_SELECT);
        isDisabledByPointerRef.current = true;
    });
    const calculateSelectingType = useCalculateFormulaSelectingType(opts, updateSelecting, isDisabledByPointerRef, lastInputContentRef);
    useFormulaSelectionInput(opts, calculateSelectingType, lastInputContentRef);
    useFormulaSelectionReset(opts, resetSelecting);
    useEffect(() => {
        if (!isFocus) return;
        const sub = workbook?.activeSheet$.subscribe(calculateSelectingType);
        const sub2 = univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(calculateSelectingType);
        return () => {
            sub?.unsubscribe();
            sub2.unsubscribe();
        };
    }, [calculateSelectingType, isFocus, workbook?.activeSheet$, univerInstanceService]);
    return { isSelecting, isSelectingRef };
}
