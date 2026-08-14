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
    CommandService,
    ConfigService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    ILogService,
    Injector,
    LifecycleService,
    LifecycleStages,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { OtherFormulaMarkDirty } from '../../commands/mutations/formula.mutation';
import { SetFormulaCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../../commands/mutations/set-other-formula.mutation';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from '../active-dirty-manager.service';
import { FormulaResultStatus } from '../formula-common';
import { OtherFormulaBizType, RegisterOtherFormulaService } from '../register-other-formula.service';

type FormulaResultMatrix = Record<number, Record<number, Array<{ v?: unknown }>>>;

function createService(registerCommands = true, remoteSync?: () => Promise<void>): {
    service: RegisterOtherFormulaService;
    commandService: ICommandService;
    activeDirtyManagerService: IActiveDirtyManagerService;
    lifecycleService: LifecycleService;
} {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([LifecycleService]);
    injector.add([RegisterOtherFormulaService]);
    const commandService = injector.get(ICommandService);
    const service = injector.get(RegisterOtherFormulaService);
    if (remoteSync) service.setMutationSyncHandler(() => remoteSync);
    if (registerCommands) {
        commandService.registerCommand(SetOtherFormulaMutation);
        commandService.registerCommand(RemoveOtherFormulaMutation);
        commandService.registerCommand(OtherFormulaMarkDirty);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
    }

    return {
        service,
        commandService,
        activeDirtyManagerService: injector.get(IActiveDirtyManagerService),
        lifecycleService: injector.get(LifecycleService),
    };
}

async function flushCommandChain() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RegisterOtherFormulaService', () => {
    it('should register dirty conversion for other-formula commands', () => {
        const { activeDirtyManagerService } = createService();

        expect(activeDirtyManagerService.get(OtherFormulaMarkDirty.id)?.commandId).toBe(OtherFormulaMarkDirty.id);
    });

    it('should register immediately and leave pre-start scheduling to the calculation trigger', async () => {
        const { service, commandService } = createService();
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        expect(formulaId.startsWith('formula.unit-1_sheet-1_default_')).toBe(true);
        await flushCommandChain();

        expect(executedIds).toEqual([SetOtherFormulaMutation.id, OtherFormulaMarkDirty.id]);
    });

    it('marks a formula dirty only after its Worker definition is synchronized', async () => {
        let releaseSync!: () => void;
        const remoteSync = vi.fn<() => Promise<void>>(() => new Promise<void>((resolve) => {
            releaseSync = resolve;
        }));
        const { service, commandService } = createService(true, remoteSync);
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        service.registerFormulaWithRange('doc-1', 'body-1', '=1');
        await flushCommandChain();
        expect(executedIds).toEqual([SetOtherFormulaMutation.id]);
        expect(remoteSync).toHaveBeenCalledOnce();

        releaseSync();
        await flushCommandChain();
        expect(executedIds).toEqual([SetOtherFormulaMutation.id, OtherFormulaMarkDirty.id]);
    });

    it('should register every formula once without a second lifecycle gate', async () => {
        const { service, commandService } = createService();
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        service.registerFormulaWithRange('unit-2', 'sheet-2', '=SUM(A1:A5)', [], { source: 'test' }, OtherFormulaBizType.DOC, 'doc-1');

        await flushCommandChain();

        expect(executedIds).toEqual([SetOtherFormulaMutation.id, OtherFormulaMarkDirty.id]);
    });

    it('should defer registration until formula commands are available', async () => {
        const { service, commandService, lifecycleService } = createService(false);
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        service.registerFormulaWithRange('unit-3', 'sheet-3', '=A1');
        await flushCommandChain();
        expect(executedIds).toEqual([]);

        commandService.registerCommand(SetOtherFormulaMutation);
        commandService.registerCommand(OtherFormulaMarkDirty);
        lifecycleService.stage = LifecycleStages.Ready;
        await flushCommandChain();

        expect(executedIds).toEqual([SetOtherFormulaMutation.id, OtherFormulaMarkDirty.id]);
    });

    it('should expose all registered formulas for host-level dirty propagation', () => {
        const { service } = createService();

        const firstFormulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        const secondFormulaId = service.registerFormulaWithRange('unit-1', 'sheet-2', '=B2');

        expect(service.getFormulaDirtyMap('unit-1')).toEqual({
            'sheet-1': { [firstFormulaId]: true },
            'sheet-2': { [secondFormulaId]: true },
        });
        expect(service.getFormulaDirtyMap('missing-unit')).toEqual({});
    });

    it('should cache formula results and resolve pending getFormulaValue', async () => {
        const { service, commandService } = createService();

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1+1');
        const pending = service.getFormulaValue('unit-1', 'sheet-1', formulaId);

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
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
        expect((value?.result as FormulaResultMatrix | undefined)?.[0]?.[0]?.[0]?.v).toBe(2);
    });

    it('should acknowledge other-formula application after cache and result subscribers update', async () => {
        const { service, commandService } = createService();
        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1+1');
        const resultPayload = {
            unitData: {},
            unitOtherData: {
                'unit-1': {
                    'sheet-1': {
                        [formulaId]: { 0: { 0: [{ v: 2 }] } },
                    },
                },
            },
        };
        let resultDistributed = false;
        let acknowledgedPayload: unknown;

        const resultSubscription = service.formulaResult$.subscribe(() => {
            resultDistributed = true;
        });
        const appliedSubscription = service.otherFormulaResultApplied$.subscribe((payload) => {
            expect(resultDistributed).toBe(true);
            expect(service.getFormulaValueSync('unit-1', 'sheet-1', formulaId)?.status).toBe(FormulaResultStatus.SUCCESS);
            acknowledgedPayload = payload;
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);

        expect(acknowledgedPayload).toBe(resultPayload);
        resultSubscription.unsubscribe();
        appliedSubscription.unsubscribe();
    });

    it('should support delete and dirty marking', async () => {
        const { service, commandService } = createService();
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitOtherData: {
                'unit-1': {
                    'sheet-1': {
                        [formulaId]: { 0: { 0: [{ v: 1 }] } },
                    },
                },
            },
        });

        service.markFormulaDirty('unit-1', 'sheet-1', formulaId);
        await flushCommandChain();
        expect(executedIds.at(-1)).toBe(OtherFormulaMarkDirty.id);

        service.deleteFormula('unit-1', 'sheet-1', [formulaId]);
        await flushCommandChain();
        expect(executedIds.at(-1)).toBe(RemoveOtherFormulaMutation.id);

        expect(service.getFormulaValueSync('unit-1', 'sheet-1', formulaId)).toBeUndefined();
    });

    it('should return immediate value for succeeded formula', async () => {
        const { service, commandService } = createService();

        const formulaId = service.registerFormulaWithRange('unit-3', 'sheet-3', '=1+1');
        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
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
