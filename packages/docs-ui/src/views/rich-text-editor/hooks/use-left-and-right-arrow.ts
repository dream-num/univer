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

import type { Editor } from '../../../services/editor/editor';
import { CommandType, Direction, DisposableCollection, ICommandService } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IShortcutService, KeyCode, MetaKeys, useDependency } from '@univerjs/ui';
import { useEffect, useRef } from 'react';
import { MoveCursorOperation, MoveSelectionOperation } from '../../../commands/operations/doc-cursor.operation';

// eslint-disable-next-line max-lines-per-function
export const useLeftAndRightArrow = (isNeed: boolean, selectingMode: boolean, editor?: Editor, onMoveInEditor?: (keyCode: KeyCode, metaKey?: MetaKeys) => void) => {
    const commandService = useDependency(ICommandService);
    const shortcutService = useDependency(IShortcutService);
    const selectingModeRef = useRef(selectingMode);
    selectingModeRef.current = selectingMode;
    const onMoveInEditorRef = useRef(onMoveInEditor);
    onMoveInEditorRef.current = onMoveInEditor;

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

        d.add(commandService.registerCommand({
            id: operationId,
            type: CommandType.OPERATION,
            handler(_event, params) {
                const { keyCode } = params as { eventType: DeviceInputEventType; keyCode: KeyCode };
                handleMoveInEditor(keyCode);
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
