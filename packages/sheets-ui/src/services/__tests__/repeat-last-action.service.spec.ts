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

import type { CommandListener, ICommandService } from '@univerjs/core';
import { SetStyleCommand } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { RepeatLastActionService } from '../repeat-last-action.service';

describe('RepeatLastActionService', () => {
    it('records explicit repeatable commands and ignores nested recording-disabled executions', async () => {
        let listener: CommandListener | undefined;
        const commandService = {
            onCommandExecuted: vi.fn((cb: CommandListener) => {
                listener = cb;
                return { dispose: vi.fn() };
            }),
        } as unknown as ICommandService;

        const service = new RepeatLastActionService(commandService);

        listener?.({
            id: SetStyleCommand.id,
            params: {
                style: {
                    type: 'bl',
                    value: true,
                },
            },
        });

        expect(service.getAction()).toEqual({
            kind: 'command',
            commandId: SetStyleCommand.id,
            params: {
                style: {
                    type: 'bl',
                    value: true,
                },
            },
            permission: 'cellStyle',
            selectionRequirement: 'none',
        });

        await service.runWithoutRecording(async () => {
            listener?.({
                id: SetStyleCommand.id,
                params: {
                    style: {
                        type: 'it',
                        value: true,
                    },
                },
            });

            return true;
        });

        expect(service.getAction()).toEqual({
            kind: 'command',
            commandId: SetStyleCommand.id,
            params: {
                style: {
                    type: 'bl',
                    value: true,
                },
            },
            permission: 'cellStyle',
            selectionRequirement: 'none',
        });

        service.setCellContentAction({ v: 'hello', t: 1 } as any);

        expect(service.getAction()).toEqual({
            kind: 'set-range-values',
            value: { v: 'hello', t: 1 },
            permission: 'cellValue',
            selectionRequirement: 'none',
        });
    });
});
