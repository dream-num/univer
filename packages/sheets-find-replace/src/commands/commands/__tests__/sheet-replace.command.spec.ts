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

import { ICommandService, Injector, IUndoRedoService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetReplaceCommand } from '../sheet-replace.command';

class SequencedCommandService {
    readonly commands: Array<{ id: string; params?: unknown }> = [];
    results: boolean[] = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.commands.push({ id, params });
        return Promise.resolve(this.results.shift() ?? true);
    }
}

class RecordingUndoRedoService {
    readonly batchingUnits: string[] = [];
    disposeCount = 0;

    __tempBatchingUndoRedo(unitId: string) {
        this.batchingUnits.push(unitId);
        return {
            dispose: () => {
                this.disposeCount++;
            },
        };
    }
}

describe('SheetReplaceCommand', () => {
    it('should batch undo/redo and execute SetRangeValues for replacements', async () => {
        const injector = new Injector();
        injector.add([ICommandService, { useClass: SequencedCommandService as never }]);
        injector.add([IUndoRedoService, { useClass: RecordingUndoRedoService as never }]);
        const commandService = injector.get(ICommandService) as unknown as SequencedCommandService;
        const undoRedoService = injector.get(IUndoRedoService) as unknown as RecordingUndoRedoService;
        commandService.results = [true, true];

        const res = await SheetReplaceCommand.handler(injector, {
            unitId: 'u1',
            replacements: [
                { subUnitId: 's1', count: 2, value: { 0: { 0: { v: 'a' } } } as any },
                { subUnitId: 's2', count: 1, value: { 1: { 1: { v: 'b' } } } as any },
            ],
        });

        expect(commandService.commands.map(({ params }) => params)).toMatchObject([
            { unitId: 'u1', subUnitId: 's1' },
            { unitId: 'u1', subUnitId: 's2' },
        ]);
        expect(undoRedoService.batchingUnits).toEqual(['u1']);
        expect(undoRedoService.disposeCount).toBe(1);
        expect(res).toEqual({ success: 3, failure: 0 });
    });

    it('should report failed replacement counts when a range update fails', async () => {
        const injector = new Injector();
        injector.add([ICommandService, { useClass: SequencedCommandService as never }]);
        injector.add([IUndoRedoService, { useClass: RecordingUndoRedoService as never }]);
        const commandService = injector.get(ICommandService) as unknown as SequencedCommandService;
        const undoRedoService = injector.get(IUndoRedoService) as unknown as RecordingUndoRedoService;
        commandService.results = [true, false];

        const res = await SheetReplaceCommand.handler(injector, {
            unitId: 'u1',
            replacements: [
                { subUnitId: 's1', count: 2, value: { 0: { 0: { v: 'a' } } } as any },
                { subUnitId: 's2', count: 3, value: { 1: { 1: { v: 'b' } } } as any },
            ],
        });

        expect(commandService.commands.map(({ params }) => params)).toMatchObject([
            { unitId: 'u1', subUnitId: 's1' },
            { unitId: 'u1', subUnitId: 's2' },
        ]);
        expect(undoRedoService.batchingUnits).toEqual(['u1']);
        expect(undoRedoService.disposeCount).toBe(1);
        expect(res).toEqual({ success: 2, failure: 3 });
    });
});
