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

import type { ICommandInfo } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RemoveDefinedNameMutation, SetDefinedNameMutation } from '../../commands/mutations/set-defined-name.mutation';
import { SetSuperTableOptionMutation } from '../../commands/mutations/set-super-table.mutation';
import { SetSuperTableController } from '../set-super-table.controller';

interface ICommandServiceMock {
    onCommandExecuted: (callback: (commandInfo: ICommandInfo) => void) => { dispose: () => void };
    emit: (id: string, params?: unknown) => void;
}

function createCommandServiceMock(): ICommandServiceMock {
    const callbacks = new Set<(commandInfo: ICommandInfo) => void>();
    return {
        onCommandExecuted: (callback: (commandInfo: ICommandInfo) => void) => {
            callbacks.add(callback);
            return {
                dispose: () => callbacks.delete(callback),
            };
        },
        emit: (id: string, params?: unknown) => {
            callbacks.forEach((callback) => callback({ id, params } as ICommandInfo));
        },
    };
}

describe('SetSuperTableController', () => {
    it('should dispatch table register/remove/option commands', () => {
        const commandService = createCommandServiceMock();
        const superTableService = {
            registerTable: vi.fn(),
            remove: vi.fn(),
            registerTableOptionMap: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetSuperTableController(commandService as never, superTableService as never);

        const reference = {
            tableId: 'table-id',
            range: { startRow: 0, endRow: 10, startColumn: 0, endColumn: 2 },
        };

        commandService.emit(SetDefinedNameMutation.id, {
            unitId: 'unit-1',
            tableName: 'Table1',
            reference,
        });
        expect(superTableService.registerTable).toHaveBeenCalledWith('unit-1', 'Table1', reference);

        commandService.emit(RemoveDefinedNameMutation.id, {
            unitId: 'unit-1',
            tableName: 'Table1',
        });
        expect(superTableService.remove).toHaveBeenCalledWith('unit-1', 'Table1');

        const tableOption = {
            Table1: { totalRow: true },
        };
        commandService.emit(SetSuperTableOptionMutation.id, {
            tableOption,
            tableOptionType: 'normal',
        });
        expect(superTableService.registerTableOptionMap).toHaveBeenCalledWith(tableOption, 'normal');
    });

    it('should ignore null params and unrelated commands', () => {
        const commandService = createCommandServiceMock();
        const superTableService = {
            registerTable: vi.fn(),
            remove: vi.fn(),
            registerTableOptionMap: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetSuperTableController(commandService as never, superTableService as never);

        commandService.emit(SetDefinedNameMutation.id, null);
        commandService.emit(RemoveDefinedNameMutation.id, null);
        commandService.emit(SetSuperTableOptionMutation.id, null);
        commandService.emit('unknown.command');

        expect(superTableService.registerTable).not.toHaveBeenCalled();
        expect(superTableService.remove).not.toHaveBeenCalled();
        expect(superTableService.registerTableOptionMap).not.toHaveBeenCalled();
    });
});
