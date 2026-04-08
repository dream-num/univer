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
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../../commands/mutations/set-other-formula.mutation';
import { SetOtherFormulaController } from '../set-other-formula.controller';

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

describe('SetOtherFormulaController', () => {
    it('should register and remove other-formula configs when commands are executed', () => {
        const commandService = createCommandServiceMock();
        const otherFormulaManagerService = {
            batchRegister: vi.fn(),
            batchRemove: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetOtherFormulaController(
            commandService as never,
            otherFormulaManagerService as never,
            {} as never
        );

        const formulaMap = {
            f1: { f: '=A1' },
            f2: { f: '=B2' },
        };

        commandService.emit(SetOtherFormulaMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            formulaMap,
        });

        expect(otherFormulaManagerService.batchRegister).toHaveBeenCalledWith({
            'unit-1': {
                'sheet-1': formulaMap,
            },
        });

        commandService.emit(RemoveOtherFormulaMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            formulaIdList: ['f1', 'f2'],
        });

        expect(otherFormulaManagerService.batchRemove).toHaveBeenCalledWith({
            'unit-1': {
                'sheet-1': {
                    f1: true,
                    f2: true,
                },
            },
        });
    });

    it('should ignore null params and unrelated commands', () => {
        const commandService = createCommandServiceMock();
        const otherFormulaManagerService = {
            batchRegister: vi.fn(),
            batchRemove: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetOtherFormulaController(
            commandService as never,
            otherFormulaManagerService as never,
            {} as never
        );

        commandService.emit(SetOtherFormulaMutation.id, null);
        commandService.emit(RemoveOtherFormulaMutation.id, null);
        commandService.emit('unknown.command', {});

        expect(otherFormulaManagerService.batchRegister).not.toHaveBeenCalled();
        expect(otherFormulaManagerService.batchRemove).not.toHaveBeenCalled();
    });
});
