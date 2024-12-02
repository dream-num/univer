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

import type { Editor } from '@univerjs/docs-ui';
import { CommandType, DisposableCollection, ICommandService, useDependency } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IShortcutService, KeyCode } from '@univerjs/ui';
import { useEffect } from 'react';

export const useLeftAndRightArrow = (isNeed: boolean, editor?: Editor) => {
    const commandService = useDependency(ICommandService);
    const shortcutService = useDependency(IShortcutService);

    useEffect(() => {
        if (!editor || !isNeed) {
            return;
        }
        const editorId = editor.getEditorId();
        const operationId = `sheet.formula-embedding-editor.${editorId}`;
        const d = new DisposableCollection();
        const handleKeycode = (keycode: KeyCode) => {
            const selections = editor.getSelectionRanges();
            if (selections.length === 1) {
                const range = selections[0];
                switch (keycode) {
                    case KeyCode.ARROW_LEFT: {
                        const offset = Math.max(range.startOffset - 1, 0);
                        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
                        break;
                    }
                    case KeyCode.ARROW_RIGHT: {
                        const content = (editor.getDocumentData().body?.dataStream || ',,').length - 2;
                        const offset = Math.min(range.endOffset + 1, content);
                        editor.setSelectionRanges([{ startOffset: offset, endOffset: offset }]);
                        break;
                    }
                }
            }
        };

        d.add(commandService.registerCommand({
            id: operationId,
            type: CommandType.OPERATION,
            handler(_event, params) {
                const { keyCode } = params as { eventType: DeviceInputEventType; keyCode: KeyCode };
                handleKeycode(keyCode);
            },
        }));

        [KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT, KeyCode.ARROW_DOWN, KeyCode.ARROW_UP].map((keyCode) => {
            return {
                id: operationId,
                binding: keyCode,
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
    }, [editor, isNeed]);
};
