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

import type { Editor } from '@univerjs/docs-ui';
import { CommandType, Direction, DisposableCollection, ICommandService } from '@univerjs/core';
import { MoveCursorOperation, MoveSelectionOperation } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand } from '@univerjs/sheets-ui';
import { IShortcutService, KeyCode, MetaKeys, useDependency } from '@univerjs/ui';
import { useEffect, useRef } from 'react';
import { FormulaSelectingType } from './use-formula-selection';

// eslint-disable-next-line max-lines-per-function
export const useLeftAndRightArrow = (isNeed: boolean, shouldMoveSelection: FormulaSelectingType, editor?: Editor, onMoveInEditor?: (keyCode: KeyCode, metaKey?: MetaKeys) => void) => {
    const commandService = useDependency(ICommandService);
    const shortcutService = useDependency(IShortcutService);
    const shouldMoveSelectionRef = useRef(shouldMoveSelection);
    shouldMoveSelectionRef.current = shouldMoveSelection;
    const onMoveInEditorRef = useRef(onMoveInEditor);
    onMoveInEditorRef.current = onMoveInEditor;

    // eslint-disable-next-line max-lines-per-function
    useEffect(() => {
        if (!editor || !isNeed) {
            return;
        }
        const editorId = editor.getEditorId();
        const operationId = `sheet.formula-embedding-editor.${editorId}`;
        const d = new DisposableCollection();
        const handleMoveInEditor = (keycode: KeyCode, metaKey?: MetaKeys) => {
            if (onMoveInEditorRef.current) {
                onMoveInEditorRef.current(keycode, metaKey);
                return;
            }

            let direction = Direction.LEFT;
            if (keycode === KeyCode.ARROW_DOWN) {
                direction = Direction.DOWN;
            } else if (keycode === KeyCode.ARROW_UP) {
                direction = Direction.UP;
            } else if (keycode === KeyCode.ARROW_RIGHT) {
                direction = Direction.RIGHT;
            }

            if (metaKey === MetaKeys.SHIFT) {
                commandService.executeCommand(MoveSelectionOperation.id, {
                    direction,
                });
            } else {
                commandService.executeCommand(MoveCursorOperation.id, {
                    direction,
                });
            }
        };

        const handleKeycode = (keycode: KeyCode, metaKey?: MetaKeys) => {
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
            if (shouldMoveSelectionRef.current) {
                if (metaKey === MetaKeys.CTRL_COMMAND) {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                        extra: 'formula-editor',
                        fromCurrentSelection: shouldMoveSelectionRef.current === FormulaSelectingType.NEED_ADD || shouldMoveSelectionRef.current === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE,
                    });
                } else if (metaKey === MetaKeys.SHIFT) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                        extra: 'formula-editor',
                    });
                } else if (metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT)) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                        extra: 'formula-editor',
                    });
                } else {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                        extra: 'formula-editor',
                        fromCurrentSelection: shouldMoveSelectionRef.current === FormulaSelectingType.NEED_ADD || shouldMoveSelectionRef.current === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE,
                    });
                }
            } else {
                handleMoveInEditor(keycode, metaKey);
            }
        };

        d.add(commandService.registerCommand({
            id: operationId,
            type: CommandType.OPERATION,
            handler(_event, params) {
                const { keyCode, metaKey } = params as { eventType: DeviceInputEventType; keyCode: KeyCode; metaKey?: MetaKeys };
                handleKeycode(keyCode, metaKey);
            },
        }));

        const keyCodes = [
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
        ];

        keyCodes.map(({ keyCode, metaKey }) => {
            return {
                id: operationId,
                binding: metaKey ? keyCode | metaKey : keyCode,
                preconditions: () => true,
                priority: 900,
                staticParameters: {
                    eventType: DeviceInputEventType.Keyboard,
                    keyCode,
                    metaKey,
                },
            };
        }).forEach((item) => {
            d.add(shortcutService.registerShortcut(item));
        });

        return () => {
            d.dispose();
        };
    }, [commandService, editor, isNeed, shortcutService]);
};
