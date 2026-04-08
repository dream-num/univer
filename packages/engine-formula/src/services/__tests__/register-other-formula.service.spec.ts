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

import type { ICommandInfo, LifecycleService } from '@univerjs/core';
import type { IActiveDirtyManagerService } from '../active-dirty-manager.service';
import { describe, expect, it, vi } from 'vitest';
import { OtherFormulaMarkDirty } from '../../commands/mutations/formula.mutation';
import { SetFormulaCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../../commands/mutations/set-other-formula.mutation';
import { FormulaResultStatus } from '../formula-common';
import { OtherFormulaBizType, RegisterOtherFormulaService } from '../register-other-formula.service';

interface ICommandServiceMock {
    executeCommand: ReturnType<typeof vi.fn>;
    onCommandExecuted: (callback: (commandInfo: ICommandInfo) => void) => { dispose: () => void };
    emit: (id: string, params?: unknown) => void;
}

function createCommandServiceMock(): ICommandServiceMock {
    const callbacks = new Set<(commandInfo: ICommandInfo) => void>();
    return {
        executeCommand: vi.fn(async (id: string, params?: unknown) => {
            callbacks.forEach((callback) => callback({ id, params } as ICommandInfo));
            return true;
        }),
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

describe('RegisterOtherFormulaService', () => {
    it('should register dirty conversion for other-formula commands', () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService: IActiveDirtyManagerService = {
            dispose: () => {},
            remove: () => {},
            get: () => null,
            has: () => false,
            register: vi.fn(),
            getDirtyConversionMap: () => new Map(),
        };

        // eslint-disable-next-line no-new
        new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        expect(activeDirtyManagerService.register).toHaveBeenCalledWith(
            OtherFormulaMarkDirty.id,
            expect.objectContaining({
                commandId: OtherFormulaMarkDirty.id,
            })
        );
    });

    it('should buffer register requests until calculation starts', async () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService = { register: vi.fn() } as unknown as IActiveDirtyManagerService;

        const service = new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        expect(formulaId.startsWith('formula.unit-1_sheet-1_default_')).toBe(true);
        expect(commandService.executeCommand).not.toHaveBeenCalledWith(SetOtherFormulaMutation.id, expect.anything(), expect.anything());

        service.calculateStarted$.next(true);
        await Promise.resolve();
        await Promise.resolve();

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetOtherFormulaMutation.id,
            expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
            }),
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            OtherFormulaMarkDirty.id,
            { 'unit-1': { 'sheet-1': { [formulaId]: true } } },
            { onlyLocal: true }
        );
    });

    it('should register immediately after calculation started', async () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService = { register: vi.fn() } as unknown as IActiveDirtyManagerService;
        const service = new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        service.calculateStarted$.next(true);
        service.registerFormulaWithRange('unit-2', 'sheet-2', '=SUM(A1:A5)', [], { source: 'test' }, OtherFormulaBizType.DOC, 'doc-1');

        await Promise.resolve();
        await Promise.resolve();

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetOtherFormulaMutation.id,
            expect.objectContaining({
                unitId: 'unit-2',
                subUnitId: 'sheet-2',
            }),
            { onlyLocal: true }
        );
    });

    it('should cache formula results and resolve pending getFormulaValue', async () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService = { register: vi.fn() } as unknown as IActiveDirtyManagerService;
        const service = new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1+1');
        const pending = service.getFormulaValue('unit-1', 'sheet-1', formulaId);

        commandService.emit(SetFormulaCalculationResultMutation.id, {
            unitOtherData: {
                'unit-1': {
                    'sheet-1': {
                        [formulaId]: {
                            0: {
                                0: [{ v: 2 }],
                            },
                        },
                    },
                },
            },
        });

        const value = await pending;
        expect(value?.status).toBe(FormulaResultStatus.SUCCESS);
        expect((value?.result as any)?.[0]?.[0]?.[0]?.v).toBe(2);
    });

    it('should support delete and dirty marking', async () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService = { register: vi.fn() } as unknown as IActiveDirtyManagerService;
        const service = new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        commandService.emit(SetFormulaCalculationResultMutation.id, {
            unitOtherData: {
                'unit-1': {
                    'sheet-1': {
                        [formulaId]: { 0: { 0: [{ v: 1 }] } },
                    },
                },
            },
        });

        service.markFormulaDirty('unit-1', 'sheet-1', formulaId);
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            OtherFormulaMarkDirty.id,
            { 'unit-1': { 'sheet-1': { [formulaId]: true } } },
            { onlyLocal: true }
        );

        service.deleteFormula('unit-1', 'sheet-1', [formulaId]);
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            RemoveOtherFormulaMutation.id,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                formulaIdList: [formulaId],
            },
            { onlyLocal: true }
        );

        expect(service.getFormulaValueSync('unit-1', 'sheet-1', formulaId)).toBeUndefined();
    });

    it('should return immediate value for succeeded formula', async () => {
        const commandService = createCommandServiceMock();
        const activeDirtyManagerService = { register: vi.fn() } as unknown as IActiveDirtyManagerService;
        const service = new RegisterOtherFormulaService(
            commandService as never,
            activeDirtyManagerService,
            {} as LifecycleService
        );

        const formulaId = service.registerFormulaWithRange('unit-3', 'sheet-3', '=1+1');
        commandService.emit(SetFormulaCalculationResultMutation.id, {
            unitOtherData: {
                'unit-3': {
                    'sheet-3': {
                        [formulaId]: { 0: { 0: [{ v: 2 }] } },
                    },
                },
            },
        });

        const value = await service.getFormulaValue('unit-3', 'sheet-3', formulaId);
        expect(value?.status).toBe(FormulaResultStatus.SUCCESS);
    });
});
