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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../../common/di';

import { ContextService, IContextService } from '../../context/context.service';
import { DesktopLogService, ILogService } from '../../log/log.service';
import type { IMultiCommand } from '../command.service';
import {
    CommandService,
    CommandType,
    ICommandService,
    sequenceExecute,
    sequenceExecuteAsync,
} from '../command.service';

const commandID = 'emit-plural-error-command';
const anotherCommandID = 'another-command';

describe('Test CommandService', () => {
    let injector: Injector;
    let commandService: ICommandService;

    beforeEach(() => {
        injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand({
            id: commandID,
            type: CommandType.COMMAND,
            handler: (_accessor, params: { value: number }) => {
                if (params.value === 100) {
                    throw new Error('100');
                }

                if (params.value % 2 === 0) {
                    return false;
                }

                return true;
            },
        });
    });

    describe('Test "sequenceExecute" utils function', () => {
        it('Should stop on the failure command', () => {
            const spy = vi.spyOn(commandService, 'syncExecuteCommand');

            expect(
                sequenceExecute(
                    [
                        { id: commandID, params: { value: 1 } },
                        { id: commandID, params: { value: 2 } },
                        { id: commandID, params: { value: 3 } },
                    ],
                    commandService
                )
            ).toEqual({ index: 1, result: false });
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('Should stop on the error command', () => {
            const spy = vi.spyOn(commandService, 'syncExecuteCommand');

            expect(
                sequenceExecute(
                    [
                        { id: commandID, params: { value: 1 } },
                        { id: commandID, params: { value: 3 } },
                        { id: commandID, params: { value: 5 } },
                        { id: commandID, params: { value: 100 } },
                        { id: commandID, params: { value: 7 } },
                    ],
                    commandService
                )
            ).toEqual({ index: 3, result: false, error: new Error('100') });
            expect(spy).toHaveBeenCalledTimes(4);
        });
    });

    describe('Test "sequenceExecuteAsync" utils function', () => {
        it('Should stop on the failure command', async () => {
            const spy = vi.spyOn(commandService, 'executeCommand');

            expect(
                await sequenceExecuteAsync(
                    [
                        { id: commandID, params: { value: 1 } },
                        { id: commandID, params: { value: 2 } },
                        { id: commandID, params: { value: 3 } },
                    ],
                    commandService
                )
            ).toEqual({ index: 1, result: false });
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('Should stop on the error command', async () => {
            const spy = vi.spyOn(commandService, 'executeCommand');

            expect(
                await sequenceExecuteAsync(
                    [
                        { id: commandID, params: { value: 1 } },
                        { id: commandID, params: { value: 3 } },
                        { id: commandID, params: { value: 5 } },
                        { id: commandID, params: { value: 100 } },
                        { id: commandID, params: { value: 7 } },
                    ],
                    commandService
                )
            ).toEqual({ index: 3, result: false, error: new Error('100') });
            expect(spy).toHaveBeenCalledTimes(4);
        });
    });

    describe('Test registering command', () => {
        it('Should throw error when registering a command with the same id', () => {
            expect(() => {
                commandService.registerCommand({
                    id: commandID,
                    type: CommandType.COMMAND,
                    handler: () => {
                        return true;
                    },
                });
            }).toThrowError(`[CommandRegistry]: command "${commandID}" has been registered before.`);
        });

        it('Should return an disposable to unregister command', async () => {
            const disposable = commandService.registerCommand({
                id: anotherCommandID,
                type: CommandType.COMMAND,
                handler: () => {
                    return true;
                },
            });

            expect(commandService.syncExecuteCommand(anotherCommandID)).toBeTruthy();
            disposable.dispose();

            expect(() => {
                commandService.syncExecuteCommand(anotherCommandID);
            }).toThrowError(`[CommandService]: command "${anotherCommandID}" is not registered.`);

            expect(commandService.executeCommand(anotherCommandID)).rejects.toThrowError(
                `[CommandService]: command "${anotherCommandID}" is not registered.`
            );
        });
    });

    describe('Test command execution hooks', () => {
        it('Should "beforeCommandExecuted" hook be called before command execution', async () => {
            const numbers: number[] = [];
            const pushValCommandID = 'push-val';
            commandService.registerCommand({
                id: pushValCommandID,
                type: CommandType.COMMAND,
                handler: () => {
                    numbers.push(0);
                    return true;
                },
            });

            const beforeListener = () => numbers.push(-1);
            const beforeDisposable = commandService.beforeCommandExecuted(beforeListener);
            expect(() => commandService.beforeCommandExecuted(beforeListener)).toThrowError(
                '[CommandService]: could not add a listener twice.'
            );
            const listener = () => numbers.push(1);
            const disposable = commandService.onCommandExecuted(listener);
            expect(() => commandService.onCommandExecuted(listener)).toThrowError(
                '[CommandService]: could not add a listener twice.'
            );

            commandService.syncExecuteCommand(pushValCommandID);
            expect(numbers).toEqual([-1, 0, 1]);

            await commandService.executeCommand(pushValCommandID);
            expect(numbers).toEqual([-1, 0, 1, -1, 0, 1]);

            beforeDisposable.dispose();
            disposable.dispose();
            commandService.syncExecuteCommand(pushValCommandID);
            expect(numbers).toEqual([-1, 0, 1, -1, 0, 1, 0]);
        });
    });

    describe('Test MultiCommand', () => {
        it('Should support register command and execute them in priority order', async () => {
            const commandID = 'command';
            const str: string[] = [];

            let executor: string = 'A';

            const disposable = commandService.registerMultipleCommand({
                id: commandID,
                type: CommandType.COMMAND,
                name: 'A',
                multi: true,
                priority: 100,
                preconditions: () => executor === 'A',
                handler: () => {
                    str.push('A');
                    return true;
                },
            } as IMultiCommand);
            const secondDisposable = commandService.registerMultipleCommand({
                id: commandID,
                type: CommandType.COMMAND,
                name: 'B',
                multi: true,
                priority: 10,
                preconditions: () => true,
                handler: () => {
                    str.push('B');
                    return true;
                },
            } as IMultiCommand);

            await commandService.executeCommand(commandID);
            expect(str).toEqual(['A']);

            executor = 'B';
            await commandService.executeCommand(commandID);
            expect(str).toEqual(['A', 'B']);

            executor = 'A';
            disposable.dispose();
            await commandService.executeCommand(commandID);
            expect(str).toEqual(['A', 'B', 'B']);

            secondDisposable.dispose();
            expect(commandService.executeCommand(commandID)).rejects.toThrowError(
                `[CommandService]: command "${commandID}" is not registered.`
            );
        });
    });
});
