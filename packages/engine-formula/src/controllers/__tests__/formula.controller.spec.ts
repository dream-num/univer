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
    toDisposable,
} from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import type { IUniverEngineFormulaConfig } from '../../config/config';
import { OtherFormulaMarkDirty } from '../../commands/mutations/formula.mutation';
import { ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../../config/config';
import { CustomFunction } from '../../functions/custom-function';
import { SetFormulaCalculationStartMutation, SetTriggerFormulaCalculationStartMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from '../../services/active-dirty-manager.service';
import { FormulaCacheService } from '../../services/formula-cache.service';
import { FunctionService, IFunctionService } from '../../services/function.service';
import { RegisterOtherFormulaService } from '../../services/register-other-formula.service';
import { FormulaController } from '../formula.controller';

type FormulaDataSyncController = Pick<
    DataSyncPrimaryController,
    'registerSyncingMutations' | 'syncUnitMutations' | 'waitForPendingMutations'
>;

function createController(dataSyncPrimaryController?: FormulaDataSyncController, config?: IUniverEngineFormulaConfig): {
    controller: FormulaController;
    commandService: ICommandService;
    registerOtherFormulaService: RegisterOtherFormulaService;
    functions: IFunctionService;
} {
    const injector = new Injector();
    onTestFinished(() => injector.dispose());
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([FormulaCacheService]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([LifecycleService]);
    injector.add([RegisterOtherFormulaService]);
    injector.add([FormulaController]);
    if (dataSyncPrimaryController) {
        injector.add([DataSyncPrimaryController, { useValue: dataSyncPrimaryController as DataSyncPrimaryController }]);
    }
    injector.get(IConfigService).setConfig(ENGINE_FORMULA_PLUGIN_CONFIG_KEY, config ?? {});
    const registerOtherFormulaService = injector.get(RegisterOtherFormulaService);
    const commandService = injector.get(ICommandService);
    return {
        controller: injector.get(FormulaController),
        commandService,
        registerOtherFormulaService,
        functions: injector.get(IFunctionService),
    };
}

describe('FormulaController', () => {
    it('bootstraps the exact registry without creating default or duplicate executors', () => {
        let created = 0;
        const first = createController(undefined, { functionRegistry: [{ name: 'ONLY', create: () => {
            created++;
            const executor = new CustomFunction('ONLY');
            executor.calculateCustom = (value) => Number(value) * 2;
            return executor;
        } }] });
        expect(created).toBe(1);
        expect(first.functions.hasExecutor('SUM')).toBe(false);
        const second = createController(undefined, { functionRegistry: first.functions.getFunctionRegistrations() });
        expect(created).toBe(2);
        expect(second.functions.getExecutor('ONLY')?.calculateCustom(4)).toBe(8);
        expect(second.functions.getExecutor('ONLY')).not.toBe(first.functions.getExecutor('ONLY'));
        first.functions.unregisterExecutors('ONLY');
        const empty = createController(undefined, { functionRegistry: first.functions.getFunctionRegistrations() });
        expect(empty.functions.getExecutors().size).toBe(0);
    });

    it('registers the generic other-formula dirty mutation', () => {
        const { commandService, controller } = createController();

        expect(commandService.hasCommand(OtherFormulaMarkDirty.id)).toBe(true);
        controller.dispose();
    });

    it('syncs calculation requests and registers each other-formula host once', () => {
        const dispose = vi.fn();
        const dataSyncPrimaryController = {
            registerSyncingMutations: vi.fn<DataSyncPrimaryController['registerSyncingMutations']>(),
            syncUnitMutations: vi.fn<DataSyncPrimaryController['syncUnitMutations']>(() => toDisposable(dispose)),
            waitForPendingMutations: vi.fn<DataSyncPrimaryController['waitForPendingMutations']>(() => Promise.resolve()),
        };
        const { controller, commandService, registerOtherFormulaService } = createController(dataSyncPrimaryController);

        expect(commandService.hasCommand(SetTriggerFormulaCalculationStartMutation.id)).toBe(true);
        expect(dataSyncPrimaryController.registerSyncingMutations).not.toHaveBeenCalledWith(SetTriggerFormulaCalculationStartMutation);
        expect(dataSyncPrimaryController.registerSyncingMutations).toHaveBeenCalledWith(SetFormulaCalculationStartMutation);

        registerOtherFormulaService.registerFormulaWithRange('doc-1', 'body-1', '=1');
        registerOtherFormulaService.registerFormulaWithRange('doc-1', 'body-1', '=2');
        registerOtherFormulaService.registerFormulaWithRange('slide-1', 'page-1', '=3');

        expect(dataSyncPrimaryController.syncUnitMutations).toHaveBeenCalledTimes(2);
        expect(dataSyncPrimaryController.syncUnitMutations).toHaveBeenNthCalledWith(1, 'doc-1');
        expect(dataSyncPrimaryController.syncUnitMutations).toHaveBeenNthCalledWith(2, 'slide-1');

        controller.dispose();
        expect(dispose).toHaveBeenCalledTimes(2);
    });

    it('supports formula registration when RPC data sync is unavailable', () => {
        const { controller, registerOtherFormulaService } = createController();

        expect(() => {
            registerOtherFormulaService.registerFormulaWithRange('doc-1', 'body-1', '=1');
        }).not.toThrow();
        controller.dispose();
    });
});
