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
import { describe, expect, it, vi } from 'vitest';
import { OtherFormulaMarkDirty } from '../../commands/mutations/formula.mutation';
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

function createController(dataSyncPrimaryController?: FormulaDataSyncController): {
    controller: FormulaController;
    commandService: ICommandService;
    registerOtherFormulaService: RegisterOtherFormulaService;
} {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([FormulaCacheService]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
    injector.add([LifecycleService]);
    injector.add([RegisterOtherFormulaService]);
    if (dataSyncPrimaryController) {
        injector.add([DataSyncPrimaryController, { useValue: dataSyncPrimaryController as DataSyncPrimaryController }]);
    }
    injector.add([FormulaController]);
    return {
        controller: injector.get(FormulaController),
        commandService: injector.get(ICommandService),
        registerOtherFormulaService: injector.get(RegisterOtherFormulaService),
    };
}

describe('FormulaController', () => {
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
