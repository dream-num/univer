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
import { describe, expect, it } from 'vitest';
import { SetFormulaCalculationNotificationMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { FormulaExecuteStageType } from '../../services/runtime.service';
import { ComputingStatusReporterController } from '../computing-status.controller';

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

describe('ComputingStatusReporterController', () => {
    it('reports formula calculation progress and completion to the global computing status service', () => {
        const commandService = createCommandServiceMock();
        const registeredSubjects: Array<{ getValue: () => boolean; next: (value: boolean) => void; isStopped: boolean }> = [];
        const globalComputingStatusService = {
            pushComputingStatusSubject: (subject: { getValue: () => boolean; next: (value: boolean) => void; isStopped: boolean }) => {
                registeredSubjects.push(subject);
                return {
                    dispose: () => {
                        const index = registeredSubjects.indexOf(subject);
                        if (index !== -1) {
                            registeredSubjects.splice(index, 1);
                        }
                    },
                };
            },
        };

        const controller = new ComputingStatusReporterController(commandService as never, globalComputingStatusService as never);

        expect(registeredSubjects).toHaveLength(1);
        expect(registeredSubjects[0].getValue()).toBe(true);

        commandService.emit(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
            },
        });
        expect(registeredSubjects[0].getValue()).toBe(false);

        commandService.emit(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.CALCULATION_COMPLETED,
            },
        });
        expect(registeredSubjects[0].getValue()).toBe(true);

        controller.dispose();
        expect(registeredSubjects).toHaveLength(0);
    });

    it('ignores unrelated commands and notifications without stage info', () => {
        const commandService = createCommandServiceMock();
        const registeredSubjects: Array<{ getValue: () => boolean; next: (value: boolean) => void; isStopped: boolean }> = [];
        const globalComputingStatusService = {
            pushComputingStatusSubject: (subject: { getValue: () => boolean; next: (value: boolean) => void; isStopped: boolean }) => {
                registeredSubjects.push(subject);
                return { dispose: () => undefined };
            },
        };

        // eslint-disable-next-line no-new
        new ComputingStatusReporterController(commandService as never, globalComputingStatusService as never);

        commandService.emit('unrelated.command', {});
        commandService.emit(SetFormulaCalculationNotificationMutation.id, {});

        expect(registeredSubjects[0].getValue()).toBe(true);
    });
});
