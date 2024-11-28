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
import { matchRefDrawToken } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs';

function getCurrentBodyDataStreamAndOffset(accssor: IAccessor) {
    const univerInstanceService = accssor.get(IUniverInstanceService);
    const documentModel = univerInstanceService.getCurrentUniverDocInstance();

    if (!documentModel?.getBody()) {
        return;
    }

    const dataStream = documentModel.getBody()?.dataStream ?? '';
    return { dataStream, offset: 0 };
}

function getCurrentChar(accssor: IAccessor) {
    const docSelectionManagerService = accssor.get(DocSelectionManagerService);
    const activeRange = docSelectionManagerService.getActiveTextRange();

    if (activeRange == null) {
        return;
    }

    const { startOffset } = activeRange;

    const config = getCurrentBodyDataStreamAndOffset(accssor);

    if (config == null || startOffset == null) {
        return;
    }

    const dataStream = config.dataStream;

    return dataStream[startOffset - 1 + config.offset];
}

export function useFormulaSelecting(editorId: string) {
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const injector = useDependency(Injector);
    const textSelections$ = useMemo(() => docSelectionRenderService?.textSelectionInner$ ?? of(), [docSelectionRenderService?.textSelectionInner$]);
    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        const sub = textSelections$.subscribe(() => {
            const char = getCurrentChar(injector);
            const dataStream = getCurrentBodyDataStreamAndOffset(injector)?.dataStream;
            if (dataStream?.substring(0, 1) === '=' && char && matchRefDrawToken(char)) {
                setIsSelecting(true);
            } else {
                setIsSelecting(false);
            }
        });

        return () => sub.unsubscribe();
    }, [injector, textSelections$]);

    return isSelecting;
}
