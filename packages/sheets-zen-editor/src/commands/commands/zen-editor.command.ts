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

import type { IAccessor, ICommand, ITextRange, Workbook } from '@univerjs/core';
import { CommandType, DOCS_ZEN_EDITOR_UNIT_ID_KEY, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocBackScrollRenderController } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IZenZoneService, KeyCode } from '@univerjs/ui';

function scrollToTop(accessor: IAccessor) {
    const renderManagerService = accessor.get(IRenderManagerService);
    const backScrollController = renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)?.with(DocBackScrollRenderController);
    const textRange = {
        startOffset: 0,
        endOffset: 0,
    };
    if (backScrollController) {
        backScrollController.scrollToRange(DOCS_ZEN_EDITOR_UNIT_ID_KEY, textRange as ITextRange);
    }
}

export const CancelZenEditCommand: ICommand = {
    id: 'zen-editor.command.cancel-zen-edit',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const zenZoneEditorService = accessor.get(IZenZoneService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const univerInstanceManager = accessor.get(IUniverInstanceService);

        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode: KeyCode.ESC,
                unitId: '',
            });
        }

        zenZoneEditorService.close();

        scrollToTop(accessor);

        const currentSheetInstance = univerInstanceManager.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (currentSheetInstance) {
            univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
            editorBridgeService.refreshEditCellState();

            return true;
        }

        return false;
    },
};

export const ConfirmZenEditCommand: ICommand = {
    id: 'zen-editor.command.confirm-zen-edit',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const zenZoneEditorService = accessor.get(IZenZoneService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const univerInstanceManager = accessor.get(IUniverInstanceService);

        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: '',
            });
        }

        zenZoneEditorService.close();

        scrollToTop(accessor);

        const currentSheetInstance = univerInstanceManager.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (currentSheetInstance) {
            univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
            editorBridgeService.refreshEditCellState();
            return true;
        }

        return false;
    },
};
