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

import type { IAccessor } from '@univerjs/core';
import { Injector, IUniverInstanceService, useDependency } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { isFormulaLexerToken, LexerTreeBuilder, matchRefDrawToken, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect, useRef, useState } from 'react';
import { filter, map } from 'rxjs';

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
}

export function useFormulaSelecting(editorId: string, isFocus: boolean, disableOnClick?: boolean) {
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const injector = useDependency(Injector);
    const [isSelecting, setIsSelecting] = useState<FormulaSelectingType>(FormulaSelectingType.NOT_SELECT);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const isDisabledByPointer = useRef(true);
    const isSelectingRef = useRef(isSelecting);
    isSelectingRef.current = isSelecting;

    useEffect(() => {
        const sub = docSelectionManagerService.textSelection$
            .pipe(
                filter((param) => param.unitId === editorId),
                map(() => {
                    const activeRange = docSelectionRenderService?.getActiveTextRange();
                    const index = activeRange?.collapsed ? activeRange.startOffset! : -1;
                    return index;
                })
            )
            .subscribe((index) => {
                const config = getCurrentBodyDataStreamAndOffset(injector);
                if (!config) return;
                const dataStream = config?.dataStream?.slice(0, -2);
                const nodes = lexerTreeBuilder.sequenceNodesBuilder(dataStream) ?? [];
                const char = dataStream[index - 1];
                const nextChar = dataStream[index];
                const focusingIndex = nodes.findIndex((node) => typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE && index === node.endIndex + 2);
                const adding = (char && matchRefDrawToken(char)) && (!nextChar || (isFormulaLexerToken(nextChar) && nextChar !== matchToken.OPEN_BRACKET));
                const editing = focusingIndex > -1;

                if (dataStream?.substring(0, 1) === '=' && (adding || editing)) {
                    if (editing) {
                        if (isDisabledByPointer.current) {
                            return;
                        }
                        setIsSelecting(FormulaSelectingType.CAN_EDIT);
                    } else {
                        isDisabledByPointer.current = false;
                        setIsSelecting(FormulaSelectingType.NEED_ADD);
                    }
                } else {
                    setIsSelecting(FormulaSelectingType.NOT_SELECT);
                }
            });

        return () => sub.unsubscribe();
    }, [docSelectionManagerService.textSelection$, docSelectionRenderService, editorId, injector, lexerTreeBuilder]);

    useEffect(() => {
        if (!isFocus) {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
            isDisabledByPointer.current = true;
        }
    }, [isFocus]);

    useEffect(() => {
        if (!disableOnClick) return;
        const sub = renderer?.mainComponent?.onPointerDown$.subscribeEvent(() => {
            setIsSelecting(FormulaSelectingType.NOT_SELECT);
            isDisabledByPointer.current = true;
        });

        return () => sub?.unsubscribe();
    }, [disableOnClick, renderer?.mainComponent?.onPointerDown$]);

    return { isSelecting };
}
