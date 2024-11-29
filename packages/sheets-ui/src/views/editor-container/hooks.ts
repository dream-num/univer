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

import { Direction, ICommandService, useDependency } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { useMemo } from 'react';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand } from '../../commands/commands/set-selection.command';
import { SetCellEditVisibleArrowOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

// eslint-disable-next-line max-lines-per-function
export function useKeyEventConfig(isRefSelecting: React.MutableRefObject<0 | 1 | 2>, unitId: string) {
    const commandService = useDependency(ICommandService);
    const editorBridgeService = useDependency(IEditorBridgeService);

    const keyCodeConfig = useMemo(() => ({
        keyCodes: [
            { keyCode: KeyCode.ENTER },
            { keyCode: KeyCode.ESC },
            { keyCode: KeyCode.TAB },
            { keyCode: KeyCode.ARROW_DOWN },
            { keyCode: KeyCode.ARROW_LEFT },
            { keyCode: KeyCode.ARROW_RIGHT },
            { keyCode: KeyCode.ARROW_UP },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
        ],
        handler: (keycode: KeyCode, metaKey?: MetaKeys) => {
            if (keycode === KeyCode.ENTER || keycode === KeyCode.ESC || keycode === KeyCode.TAB) {
                editorBridgeService.changeVisible({
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    keycode,
                    unitId: unitId!,
                });
                return;
            }

            let direction = Direction.DOWN;
            if (keycode === KeyCode.ARROW_DOWN) {
                direction = Direction.DOWN;
            } else if (keycode === KeyCode.ARROW_UP) {
                direction = Direction.UP;
            } else if (keycode === KeyCode.ARROW_LEFT) {
                direction = Direction.LEFT;
            } else if (keycode === KeyCode.ARROW_RIGHT) {
                direction = Direction.RIGHT;
            }

            if (isRefSelecting.current) {
                if (metaKey === MetaKeys.CTRL_COMMAND) {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                    });
                } else if (metaKey === MetaKeys.SHIFT) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                    });
                } else if (metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT)) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                    });
                } else {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                    });
                }
            } else {
                commandService.executeCommand(SetCellEditVisibleArrowOperation.id, {
                    keycode,
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    isShift: metaKey === MetaKeys.SHIFT || metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT),
                    unitId,
                });
            }
        },
    }), [isRefSelecting, editorBridgeService, unitId, commandService]);

    return keyCodeConfig;
}
