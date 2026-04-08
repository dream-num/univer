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
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetDefinedNameMutation } from '../../commands/mutations/set-defined-name.mutation';
import { RemoveFeatureCalculationMutation, SetFeatureCalculationMutation } from '../../commands/mutations/set-feature-calculation.mutation';
import { SetFormulaDataMutation } from '../../commands/mutations/set-formula-data.mutation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '../../commands/mutations/set-other-formula.mutation';
import { SetDependencyController } from '../set-dependency.controller';

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

describe('SetDependencyController', () => {
    it('should react to feature manager changes and command mutations', () => {
        const commandService = createCommandServiceMock();
        const onChanged$ = new Subject<{ unitId: string; subUnitId: string; featureIds: string[] }>();

        const dependencyManagerService = {
            removeFeatureFormulaDependency: vi.fn(),
            removeOtherFormulaDependency: vi.fn(),
            clearFormulaDependency: vi.fn(),
            removeFormulaDependency: vi.fn(),
            removeFormulaDependencyByDefinedName: vi.fn(),
        };

        const featureCalculationManagerService = {
            onChanged$,
        };

        // eslint-disable-next-line no-new
        new SetDependencyController(
            commandService as never,
            dependencyManagerService as never,
            featureCalculationManagerService as never
        );

        onChanged$.next({ unitId: 'u', subUnitId: 's', featureIds: ['f1', 'f2'] });
        expect(dependencyManagerService.removeFeatureFormulaDependency).toHaveBeenCalledWith('u', 's', ['f1', 'f2']);

        commandService.emit(RemoveFeatureCalculationMutation.id, { unitId: 'u', subUnitId: 's', featureIds: ['f3'] });
        expect(dependencyManagerService.removeFeatureFormulaDependency).toHaveBeenCalledWith('u', 's', ['f3']);

        commandService.emit(SetFeatureCalculationMutation.id, {
            featureId: 'f4',
            calculationParam: {
                unitId: 'u',
                subUnitId: 's',
            },
        });
        expect(dependencyManagerService.removeFeatureFormulaDependency).toHaveBeenCalledWith('u', 's', ['f4']);

        commandService.emit(RemoveOtherFormulaMutation.id, {
            unitId: 'u',
            subUnitId: 's',
            formulaIdList: ['fo1'],
        });
        expect(dependencyManagerService.removeOtherFormulaDependency).toHaveBeenCalledWith('u', 's', ['fo1']);

        commandService.emit(SetOtherFormulaMutation.id, {
            unitId: 'u',
            subUnitId: 's',
            formulaMap: {
                a: { f: '=A1', ranges: [] },
                b: { f: '=B1', ranges: [] },
            },
        });
        expect(dependencyManagerService.removeOtherFormulaDependency).toHaveBeenCalledWith('u', 's', ['a', 'b']);

        commandService.emit(SetDefinedNameMutation.id, {
            unitId: 'u',
            name: 'MY_DEFINED_NAME',
        });
        expect(dependencyManagerService.removeFormulaDependencyByDefinedName).toHaveBeenCalledWith('u', 'MY_DEFINED_NAME');
    });

    it('should clear or remove formula dependencies according to formulaData payload', () => {
        const commandService = createCommandServiceMock();
        const dependencyManagerService = {
            removeFeatureFormulaDependency: vi.fn(),
            removeOtherFormulaDependency: vi.fn(),
            clearFormulaDependency: vi.fn(),
            removeFormulaDependency: vi.fn(),
            removeFormulaDependencyByDefinedName: vi.fn(),
        };
        const featureCalculationManagerService = {
            onChanged$: new Subject<{ unitId: string; subUnitId: string; featureIds: string[] }>(),
        };

        // eslint-disable-next-line no-new
        new SetDependencyController(
            commandService as never,
            dependencyManagerService as never,
            featureCalculationManagerService as never
        );

        commandService.emit(SetFormulaDataMutation.id, {
            formulaData: {
                u1: null,
                u2: {
                    s1: null,
                    s2: {
                        1: {
                            2: { f: '=A1' },
                        },
                    },
                },
            },
        });

        expect(dependencyManagerService.clearFormulaDependency).toHaveBeenCalledWith('u1');
        expect(dependencyManagerService.clearFormulaDependency).toHaveBeenCalledWith('u2', 's1');
        expect(dependencyManagerService.removeFormulaDependency).toHaveBeenCalledWith('u2', 's2', 1, 2);
    });

    it('should ignore null mutation params', () => {
        const commandService = createCommandServiceMock();
        const dependencyManagerService = {
            removeFeatureFormulaDependency: vi.fn(),
            removeOtherFormulaDependency: vi.fn(),
            clearFormulaDependency: vi.fn(),
            removeFormulaDependency: vi.fn(),
            removeFormulaDependencyByDefinedName: vi.fn(),
        };
        const featureCalculationManagerService = {
            onChanged$: new Subject<{ unitId: string; subUnitId: string; featureIds: string[] }>(),
        };

        // eslint-disable-next-line no-new
        new SetDependencyController(
            commandService as never,
            dependencyManagerService as never,
            featureCalculationManagerService as never
        );

        commandService.emit(RemoveFeatureCalculationMutation.id, null);
        commandService.emit(SetFeatureCalculationMutation.id, null);
        commandService.emit(RemoveOtherFormulaMutation.id, null);
        commandService.emit(SetOtherFormulaMutation.id, null);
        commandService.emit(SetDefinedNameMutation.id, null);

        expect(dependencyManagerService.removeFeatureFormulaDependency).not.toHaveBeenCalled();
        expect(dependencyManagerService.removeOtherFormulaDependency).not.toHaveBeenCalled();
        expect(dependencyManagerService.removeFormulaDependencyByDefinedName).not.toHaveBeenCalled();
    });
});
