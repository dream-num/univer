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

import type { IAccessor, IUnitRangeName, Workbook } from '@univerjs/core';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheetWithCache, isFormulaLexerToken, LexerTreeBuilder, matchRefDrawToken, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useEvent } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { useStateRef } from './use-state-ref';

function getCurrentBodyDataStreamAndOffset(accssor: IAccessor) {
    const univerInstanceService = accssor.get(IUniverInstanceService);
    const documentModel = univerInstanceService.getCurrentUniverDocInstance();

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
}

// eslint-disable-next-line max-lines-per-function
export function useFormulaSelecting(opts: { editorId: string; isFocus: boolean; disableOnClick?: boolean; unitId: string; subUnitId: string }) {
    const { editorId, isFocus, disableOnClick, unitId, subUnitId } = opts;
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
    const refSelectionsRenderService = sheetRenderer?.with(RefSelectionsRenderService);
    const isSelectingRef = useStateRef(isSelecting);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const sourceSheet = workbook?.getSheetBySheetId(subUnitId);

    const setIsSelecting = useEvent((v: FormulaSelectingType) => {
        if (refSelectionsRenderService) {
            refSelectionsRenderService.setSkipLastEnabled(v === FormulaSelectingType.NEED_ADD || v === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE);
        }
        isSelectingRef.current = v;
        innerSetIsSelecting(v);
    });

    // eslint-disable-next-line complexity
    const calculateSelectingType = useEvent(() => {
        if (!workbook) return;
        const currentSheet = workbook.getActiveSheet();
        const activeRange = docSelectionRenderService?.getActiveTextRange();
        const index = activeRange?.collapsed ? activeRange.startOffset! : -1;
        const config = getCurrentBodyDataStreamAndOffset(injector);
        if (!config) return;
        const dataStream = config?.dataStream?.slice(0, -2);
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

        if (dataStream?.substring(0, 1) === '=' && (adding || editing)) {
            if (editing) {
                if (isDisabledByPointer.current) {
                    return;
                }
                if (
                    (!focusingNode.range.sheetName && currentSheet.getSheetId() === sourceSheet?.getSheetId()) ||
                    focusingNode.range.sheetName === currentSheet.getName()
                ) {
                    setIsSelecting(FormulaSelectingType.CAN_EDIT);
                } else {
                    setIsSelecting(FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE);
                }
            } else {
                isDisabledByPointer.current = false;
                setIsSelecting(FormulaSelectingType.NEED_ADD);
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

        return () => sub?.unsubscribe();
    }, [calculateSelectingType, isFocus, workbook?.activeSheet$]);

    return { isSelecting, isSelectingRef };
}
