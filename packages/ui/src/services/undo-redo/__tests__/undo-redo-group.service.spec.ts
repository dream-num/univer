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

import { describe, expect, it, vi } from 'vitest';
import { UndoRedoGroupService } from '../undo-redo-group.service';

describe('UndoRedoGroupService', () => {
    it('reuses only active timed groups and always closes the core scope', () => {
        const dispose = vi.fn();
        const beginUndoRedoGroup = vi.fn((_unitId: string, _groupId: string) => ({ dispose }));
        const service = new UndoRedoGroupService({ beginUndoRedoGroup });

        vi.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(1_900).mockReturnValueOnce(2_901);
        service.runTimed('unit-1', 'drawing:nudge', () => true);
        service.runTimed('unit-1', 'drawing:nudge', () => true);
        service.runTimed('unit-1', 'drawing:nudge', () => true);

        expect(beginUndoRedoGroup.mock.calls[1][1]).toBe(beginUndoRedoGroup.mock.calls[0][1]);
        expect(beginUndoRedoGroup.mock.calls[2][1]).not.toBe(beginUndoRedoGroup.mock.calls[0][1]);
        expect(dispose).toHaveBeenCalledTimes(3);
    });

    it('creates a runner that can group separated command executions', () => {
        const dispose = vi.fn();
        const beginUndoRedoGroup = vi.fn((_unitId: string, _groupId: string) => ({ dispose }));
        const service = new UndoRedoGroupService({ beginUndoRedoGroup });
        const run = service.createRunner('unit-1');

        run(() => true);
        run(() => true);

        expect(beginUndoRedoGroup.mock.calls[1][1]).toBe(beginUndoRedoGroup.mock.calls[0][1]);
        expect(dispose).toHaveBeenCalledTimes(2);
    });
});
