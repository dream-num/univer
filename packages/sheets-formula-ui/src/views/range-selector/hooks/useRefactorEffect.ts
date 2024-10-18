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
import { FOCUSING_EDITOR_INPUT_FORMULA, IContextService, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DISABLE_NORMAL_SELECTIONS, SheetsSelectionsService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IContextMenuService } from '@univerjs/ui';
import { useEffect, useLayoutEffect } from 'react';

import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

// eslint-disable-next-line max-lines-per-function
export const useRefactorEffect = (isNeed: boolean, unitId: string, isOnlyOneRange: boolean) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const sheetsSelectionsService = useDependency(SheetsSelectionsService);
    const contextMenuService = useDependency(IContextMenuService);

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    useEffect(() => {
        if (isNeed) {
            const d1 = refSelectionsRenderService?.enableSelectionChanging();
            contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, true);
            editorBridgeService.enableForceKeepVisible();

            return () => {
                d1?.dispose();
                contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, false);
                editorBridgeService.disableForceKeepVisible();
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

    useEffect(() => {
        if (isOnlyOneRange) {
            refSelectionsRenderService?.setRemainLastEnabled(false);
        } else {
            refSelectionsRenderService?.setRemainLastEnabled(true);
        }
    }, [isOnlyOneRange]);

    // 终止快捷键的监听
    // packages/sheets-formula-ui/src/controllers/shortcuts/prompt.shortcut.ts:52
    // 需要将docs-ui中的 packages/docs-ui/src/services/editor/editor-manager.service.ts:267  focusStyle 解耦到 sheet 中来...
    useEffect(() => {
        if (isNeed) {
            const d = contextService.subscribeContextValue$(FOCUSING_EDITOR_INPUT_FORMULA).subscribe((v) => {
                if (v) {
                    contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
                }
            });
            contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
            return () => {
                d.unsubscribe();
            };
        }
    }, [isNeed]);
};
