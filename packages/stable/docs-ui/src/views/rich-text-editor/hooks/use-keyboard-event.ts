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

import type { KeyCode, MetaKeys } from '@univerjs/ui';
import type { Editor } from '../../../services/editor/editor';
import { CommandType, DisposableCollection, generateRandomId, ICommandService } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IShortcutService, useDependency } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';

export interface IKeyboardEventConfig {
    keyCodes: { keyCode: KeyCode; metaKey?: MetaKeys }[];
    handler: (keyCode: KeyCode, metaKey?: MetaKeys) => void;
}

export function useKeyboardEvent(isNeed: boolean, config?: IKeyboardEventConfig, editor?: Editor) {
    const commandService = useDependency(ICommandService);
    const shortcutService = useDependency(IShortcutService);
    const key = useMemo(() => generateRandomId(4), []);

    useEffect(() => {
        if (!editor || !isNeed || !config) {
            return;
        }
        const editorId = editor.getEditorId();
        const operationId = `sheet.operation.editor-${editorId}-keyboard-${key}`;
        const d = new DisposableCollection();

        d.add(commandService.registerCommand({
            id: operationId,
            type: CommandType.OPERATION,
            handler(_event, params) {
                const { keyCode, metaKey } = params as { eventType: DeviceInputEventType; keyCode: KeyCode; metaKey?: MetaKeys };
                config.handler(keyCode, metaKey);
            },
        }));

        config.keyCodes.map((keyCode) => {
            return {
                id: operationId,
                binding: keyCode.metaKey ? keyCode.keyCode | keyCode.metaKey : keyCode.keyCode,
                preconditions: () => true,
                priority: 901,
                staticParameters: {
                    eventType: DeviceInputEventType.Keyboard,
                    keyCode: keyCode.keyCode,
                    metaKey: keyCode.metaKey,
                },
            };
        }).forEach((item) => {
            d.add(shortcutService.registerShortcut(item));
        });

        return () => {
            d.dispose();
        };
    }, [commandService, config, editor, isNeed, key, shortcutService]);
}
