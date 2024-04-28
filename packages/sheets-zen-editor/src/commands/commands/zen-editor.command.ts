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

import type { ICommand, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IZenZoneService, KeyCode } from '@univerjs/ui';

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
            });
        }

        zenZoneEditorService.close();

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
            });
        }

        zenZoneEditorService.close();

        const currentSheetInstance = univerInstanceManager.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (currentSheetInstance) {
            univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
            editorBridgeService.refreshEditCellState();
            return true;
        }

        return false;
    },
};
