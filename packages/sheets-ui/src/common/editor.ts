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

import type { IEditorBridgeServiceVisibleParam } from '../services/editor-bridge.service';
import { type IAccessor, ICommandService } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { SetCellEditVisibleOperation } from '../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../services/editor-bridge.service';

export function quitEditingBeforeCommand(accessor: IAccessor) {
    const editorBridgeService = accessor.get(IEditorBridgeService);
    const commandService = accessor.get(ICommandService);
    const visible = editorBridgeService.isVisible();
    if (visible.visible) {
        const params: IEditorBridgeServiceVisibleParam = {
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            unitId: visible.unitId,
        };

        commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, params);
    }
}
