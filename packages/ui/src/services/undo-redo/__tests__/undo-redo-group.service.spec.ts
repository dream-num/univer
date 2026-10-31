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

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UndoRedoGroupService } from '../undo-redo-group.service';

const UNIT_ID = 'group-host';
const SET_VALUE_COMMAND = 'test.command.set-value';
const SET_VALUE_MUTATION = 'test.mutation.set-value';
const TRANSIENT_OPERATION = 'test.operation.selection';

function createTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([UndoRedoGroupService]);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: UNIT_ID });
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    const commands = injector.get(ICommandService);
    const history = injector.get(IUndoRedoService);
    let value = 0;
    const applied: number[] = [];
    commands.registerCommand({
        id: SET_VALUE_MUTATION,
        type: CommandType.MUTATION,
        handler: (_accessor, params?: { value: number }) => {
            if (!params) {
                return false;
            }
            value = params.value;
            applied.push(value);
            return true;
        },
    });
    commands.registerCommand({
        id: SET_VALUE_COMMAND,
        type: CommandType.COMMAND,
        handler: (accessor, params?: { value: number }) => {
            if (!params) {
                return false;
            }
            const previous = value;
            const result = accessor.get(ICommandService).syncExecuteCommand(SET_VALUE_MUTATION, params);
            if (result) {
                accessor.get(IUndoRedoService).pushUndoRedo({
                    unitID: UNIT_ID,
                    undoMutations: [{ id: SET_VALUE_MUTATION, params: { value: previous } }],
                    redoMutations: [{ id: SET_VALUE_MUTATION, params }],
                });
            }
            return result;
        },
    });
    commands.registerCommand({ id: TRANSIENT_OPERATION, type: CommandType.OPERATION, handler: () => true });
    return { univer, injector, commands, history, applied, getValue: () => value };
}

describe('UndoRedoGroupService', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('reuses only active timed groups and always closes the core scope', () => {
        const bed = createTestBed();
        const service = bed.injector.get(UndoRedoGroupService);
        vi.useFakeTimers();
        try {
            vi.setSystemTime(1_000);
            expect(service.runTimed(UNIT_ID, 'drawing:nudge', () => bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 1 }))).toBe(true);
            vi.setSystemTime(1_900);
            expect(service.runTimed(UNIT_ID, 'drawing:nudge', () => bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 2 }))).toBe(true);
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 1, redos: 0 });
            vi.setSystemTime(2_901);
            expect(service.runTimed(UNIT_ID, 'drawing:nudge', () => bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 3 }))).toBe(true);
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 2, redos: 0 });
            expect(bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 4 })).toBe(true);
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 3, redos: 0 });
            for (const expected of [3, 2, 0]) {
                expect(bed.commands.syncExecuteCommand('univer.command.undo')).toBe(true);
                expect(bed.getValue()).toBe(expected);
            }
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 0, redos: 3 });
            for (const expected of [2, 3, 4]) {
                expect(bed.commands.syncExecuteCommand('univer.command.redo')).toBe(true);
                expect(bed.getValue()).toBe(expected);
            }
            expect(bed.applied).toEqual([1, 2, 3, 4, 3, 2, 0, 2, 3, 4]);
        } finally {
            bed.univer.dispose();
        }
    });

    it('creates a runner that can group separated command executions', () => {
        const bed = createTestBed();
        const service = bed.injector.get(UndoRedoGroupService);
        const run = service.createRunner(UNIT_ID);
        try {
            expect(run(() => bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 1 }))).toBe(true);
            expect(bed.commands.syncExecuteCommand(TRANSIENT_OPERATION)).toBe(true);
            expect(run(() => bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 2 }))).toBe(true);
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 1, redos: 0 });
            expect(bed.commands.syncExecuteCommand(SET_VALUE_COMMAND, { value: 3 })).toBe(true);
            expect(bed.history.getUndoRedoStatus(UNIT_ID)).toEqual({ undos: 2, redos: 0 });
            expect(bed.commands.syncExecuteCommand('univer.command.undo')).toBe(true);
            expect(bed.getValue()).toBe(2);
            expect(bed.commands.syncExecuteCommand('univer.command.undo')).toBe(true);
            expect(bed.getValue()).toBe(0);
            expect(bed.commands.syncExecuteCommand('univer.command.redo')).toBe(true);
            expect(bed.getValue()).toBe(2);
            expect(bed.commands.syncExecuteCommand('univer.command.redo')).toBe(true);
            expect(bed.getValue()).toBe(3);
            expect(bed.applied).toEqual([1, 2, 3, 2, 1, 0, 1, 2, 3]);
        } finally {
            bed.univer.dispose();
        }
    });
});
