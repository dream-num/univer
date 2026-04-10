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

import { ICommandService, IUndoRedoService } from '@univerjs/core';

import { describe, expect, it, vi } from 'vitest';
import { SheetReplaceCommand } from '../sheet-replace.command';

describe('SheetReplaceCommand', () => {
    it('should batch undo/redo and execute SetRangeValues for replacements', async () => {
        const dispose = vi.fn();
        const undoRedoService = {
            __tempBatchingUndoRedo: vi.fn(() => ({ dispose })),
        };

        const executeCommand = vi.fn(async () => true);
        const commandService = { executeCommand };

        const accessor = {
            get: vi.fn((token: any) => {
                if (token === IUndoRedoService) return undoRedoService;
                if (token === ICommandService) return commandService;
                return null;
            }),
        } as any;

        const res = await SheetReplaceCommand.handler(accessor, {
            unitId: 'u1',
            replacements: [
                { subUnitId: 's1', count: 2, value: { 0: { 0: { v: 'a' } } } as any },
                { subUnitId: 's2', count: 1, value: { 1: { 1: { v: 'b' } } } as any },
            ],
        });

        expect(executeCommand).toHaveBeenCalledTimes(2);
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(res).toEqual({ success: 3, failure: 0 });
    });
});
