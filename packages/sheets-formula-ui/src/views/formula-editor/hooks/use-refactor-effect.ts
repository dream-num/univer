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

import type { Workbook } from '@univerjs/core';
import { EDITOR_ACTIVATED, IContextService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, REF_SELECTIONS_ENABLED } from '@univerjs/sheets';
import { IContextMenuService, useDependency, useObservable } from '@univerjs/ui';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

export const useRefactorEffect = (isNeed: boolean, selecting: boolean, unitId: string, disableContextMenu = true) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const contextService = useDependency(IContextService);
    const contextMenuService = useDependency(IContextMenuService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentUnit = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]));
    const render = renderManagerService.getRenderById(currentUnit?.getUnitId() ?? '');
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    useLayoutEffect(() => {
        if (isNeed) {
            contextService.setContextValue(EDITOR_ACTIVATED, true);

            return () => {
                contextService.setContextValue(EDITOR_ACTIVATED, false);
                refSelectionsService.clear();
            };
        }
    }, [contextService, isNeed, refSelectionsService]);

    useLayoutEffect(() => {
        if (isNeed && selecting) {
            const d1 = refSelectionsRenderService?.enableSelectionChanging();
            contextService.setContextValue(REF_SELECTIONS_ENABLED, true);

            return () => {
                contextService.setContextValue(REF_SELECTIONS_ENABLED, false);
                d1?.dispose();
            };
        }
    }, [contextService, isNeed, refSelectionsRenderService, selecting]);

    // right context controller
    useEffect(() => {
        if (isNeed) {
            contextService.setContextValue(EDITOR_ACTIVATED, true);
            disableContextMenu && contextMenuService.disable();
            return () => {
                contextService.setContextValue(EDITOR_ACTIVATED, false);
                disableContextMenu && contextMenuService.enable();
            };
        }
    }, [contextMenuService, contextService, isNeed, disableContextMenu]);

    // reset setSkipLastEnabled
    useEffect(() => {
        if (isNeed) {
            refSelectionsRenderService?.setSkipLastEnabled(false);
        }
    }, [isNeed, refSelectionsRenderService]);
};
