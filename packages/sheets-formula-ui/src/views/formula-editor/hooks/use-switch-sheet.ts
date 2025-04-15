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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

export const useSwitchSheet = (
    isNeed: boolean,
    unitId: string,
    isSupportAcrossSheet: boolean,
    isFocusSet: (v: boolean) => void,
    onBlur: () => void,
    refresh: () => void
) => {
    const commandService = useDependency(ICommandService);
    const editorService = useDependency(IEditorService);
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            if (isSupportAcrossSheet) {
                const handleRefresh = () => {
                    const length = refSelectionsRenderService.getSelectionControls().length;
                    for (let index = 1; index <= length; index++) {
                        refSelectionsRenderService.clearLastSelection();
                    }

                    return setTimeout(() => {
                        refresh();
                    }, 30);
                };

                const d = commandService.onCommandExecuted((info) => {
                    if (info.id === SetWorksheetActiveOperation.id) {
                        handleRefresh();
                    }
                });

                const d2 = univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
                    handleRefresh();
                });

                return () => {
                    d.dispose();
                    d2.unsubscribe();
                };
            } else {
                const d = commandService.beforeCommandExecuted((info) => {
                    if (info.id === SetWorksheetActiveOperation.id) {
                        isFocusSet(false);
                        onBlur();
                        // Refresh the component
                        refresh();
                        const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                        editor?.focus();
                    }
                });
                return () => {
                    d.dispose();
                };
            }
        }
    }, [isNeed, refSelectionsRenderService]);
};
