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

import type { Workbook } from '@univerjs/core';
import { EDITOR_ACTIVATED, IContextService, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DISABLE_NORMAL_SELECTIONS, IRefSelectionsService, SheetsSelectionsService } from '@univerjs/sheets';
import { IContextMenuService } from '@univerjs/ui';
import { useEffect, useLayoutEffect } from 'react';

import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

export const useRefactorEffect = (isNeed: boolean, unitId: string) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);
    const sheetsSelectionsService = useDependency(SheetsSelectionsService);
    const contextMenuService = useDependency(IContextMenuService);
    const refSelectionsService = useDependency(IRefSelectionsService);

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    useLayoutEffect(() => {
        if (isNeed) {
            const d1 = refSelectionsRenderService?.enableSelectionChanging();
            contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, true);
            contextService.setContextValue(EDITOR_ACTIVATED, true);

            return () => {
                contextService.setContextValue(EDITOR_ACTIVATED, false);
                contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, false);
                d1?.dispose();
            };
        }
    }, [isNeed]);

    // reset selection
    useLayoutEffect(() => {
        if (isNeed) {
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const sheet = workbook?.getActiveSheet();
            const selections = [...sheetsSelectionsService.getCurrentSelections()];
            return () => {
                refSelectionsService.clear();
                const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const currentSheet = workbook?.getActiveSheet();
                if (currentSheet && currentSheet === sheet) {
                    sheetsSelectionsService.setSelections(selections);
                }
            };
        }
    }, [isNeed]);

    //right context controller
    useEffect(() => {
        if (isNeed) {
            contextMenuService.disable();
            return () => {
                contextMenuService.enable();
            };
        }
    }, [isNeed]);

    // reset setSkipLastEnabled
    useEffect(() => {
        if (isNeed) {
            refSelectionsRenderService?.setSkipLastEnabled(false);
        }
    }, [isNeed]);
};
