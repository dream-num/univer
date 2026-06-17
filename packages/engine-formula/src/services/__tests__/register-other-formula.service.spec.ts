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
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { OtherFormulaMarkDirty } from '../../commands/mutations/formula.mutation';
import { SetFormulaCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../../commands/mutations/set-other-formula.mutation';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from '../active-dirty-manager.service';
import { FormulaResultStatus } from '../formula-common';
import { OtherFormulaBizType, RegisterOtherFormulaService } from '../register-other-formula.service';

type FormulaResultMatrix = Record<number, Record<number, Array<{ v?: unknown }>>>;

function createService(): {
    service: RegisterOtherFormulaService;
    commandService: ICommandService;
    activeDirtyManagerService: IActiveDirtyManagerService;
} {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([LifecycleService]);
    injector.add([RegisterOtherFormulaService]);
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetOtherFormulaMutation);
    commandService.registerCommand(RemoveOtherFormulaMutation);
    commandService.registerCommand(OtherFormulaMarkDirty);
    commandService.registerCommand(SetFormulaCalculationResultMutation);

    return {
        service: injector.get(RegisterOtherFormulaService),
        commandService,
        activeDirtyManagerService: injector.get(IActiveDirtyManagerService),
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

    it('should buffer register requests until calculation starts', async () => {
        const { service, commandService } = createService();
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        const formulaId = service.registerFormulaWithRange('unit-1', 'sheet-1', '=A1');
        expect(formulaId.startsWith('formula.unit-1_sheet-1_default_')).toBe(true);
        expect(executedIds).not.toContain(SetOtherFormulaMutation.id);

        service.calculateStarted$.next(true);
        await flushCommandChain();

        expect(executedIds).toEqual([SetOtherFormulaMutation.id, OtherFormulaMarkDirty.id]);
    });

    it('should register immediately after calculation started', async () => {
        const { service, commandService } = createService();
        const executedIds: string[] = [];
        commandService.onCommandExecuted((command) => executedIds.push(command.id));

        service.calculateStarted$.next(true);
        service.registerFormulaWithRange('unit-2', 'sheet-2', '=SUM(A1:A5)', [], { source: 'test' }, OtherFormulaBizType.DOC, 'doc-1');

        await flushCommandChain();

        expect(executedIds).toContain(SetOtherFormulaMutation.id);
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
