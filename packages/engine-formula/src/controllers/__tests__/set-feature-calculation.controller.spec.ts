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
import { RemoveFeatureCalculationMutation, SetFeatureCalculationMutation } from '../../commands/mutations/set-feature-calculation.mutation';
import { SetFeatureCalculationController } from '../set-feature-calculation.controller';

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

describe('SetFeatureCalculationController', () => {
    it('registers and removes feature calculation executors from command payloads', () => {
        const commandService = createCommandServiceMock();
        const featureCalculationManagerService = {
            register: vi.fn(),
            remove: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetFeatureCalculationController(commandService as never, featureCalculationManagerService as never);

        const calculationParam = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            dependencyRanges: [
                {
                    unitId: 'unit-1',
                    sheetId: 'sheet-1',
                    range: {
                        startRow: 1,
                        endRow: 3,
                        startColumn: 2,
                        endColumn: 4,
                    },
                },
            ],
            getDirtyData: vi.fn(),
        };

        commandService.emit(SetFeatureCalculationMutation.id, {
            featureId: 'feature-1',
            calculationParam,
        });
        expect(featureCalculationManagerService.register).toHaveBeenCalledWith('unit-1', 'sheet-1', 'feature-1', calculationParam);

        commandService.emit(RemoveFeatureCalculationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            featureIds: ['feature-1'],
        });
        expect(featureCalculationManagerService.remove).toHaveBeenCalledWith('unit-1', 'sheet-1', ['feature-1']);
    });

    it('ignores null params and unrelated commands', () => {
        const commandService = createCommandServiceMock();
        const featureCalculationManagerService = {
            register: vi.fn(),
            remove: vi.fn(),
        };

        // eslint-disable-next-line no-new
        new SetFeatureCalculationController(commandService as never, featureCalculationManagerService as never);

        commandService.emit(SetFeatureCalculationMutation.id, null);
        commandService.emit(RemoveFeatureCalculationMutation.id, null);
        commandService.emit('unknown.command', {});

        expect(featureCalculationManagerService.register).not.toHaveBeenCalled();
        expect(featureCalculationManagerService.remove).not.toHaveBeenCalled();
    });
});
