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

import type { IMultiCommand } from '../command.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../../common/di';
import { CustomCommandExecutionError } from '../../../common/error';
import { ConfigService, IConfigService } from '../../config/config.service';
import { ContextService, IContextService } from '../../context/context.service';
import { DesktopLogService, ILogService } from '../../log/log.service';
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
    let logService: ILogService;

    beforeEach(() => {
        injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);

        commandService = injector.get(ICommandService);
        logService = injector.get(ILogService);
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
        it('Should report command registration state and execute the built-in nil command', () => {
            expect(commandService.hasCommand('nil')).toBe(true);
            expect(commandService.syncExecuteCommand('nil')).toBe(true);

            commandService.unregisterCommand('nil');
            expect(commandService.hasCommand('nil')).toBe(false);
        });

        it('Should throw error when registering a command with the same id', () => {
            expect(() => {
                commandService.registerCommand({
                    id: commandID,
                    type: CommandType.COMMAND,
                    handler: () => {
                        return true;
                    },
                });
            }).toThrow(`[CommandRegistry]: command "${commandID}" has been registered before.`);
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
            }).toThrow(`[CommandService]: command "${anotherCommandID}" is not registered.`);

            await expect(commandService.executeCommand(anotherCommandID)).rejects.toThrow(
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
            expect(() => commandService.beforeCommandExecuted(beforeListener)).toThrow(
                '[CommandService]: could not add a listener twice.'
            );
            const listener = () => numbers.push(1);
            const disposable = commandService.onCommandExecuted(listener);
            expect(() => commandService.onCommandExecuted(listener)).toThrow(
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

        it('Should skip command execution after the command service is disposed', async () => {
            const handler = vi.fn(() => true);
            const beforeListener = vi.fn();
            const listener = vi.fn();
            const warn = vi.spyOn(logService, 'warn');
            const pushValCommandID = 'push-val-after-dispose';
            commandService.registerCommand({
                id: pushValCommandID,
                type: CommandType.COMMAND,
                handler,
            });
            commandService.beforeCommandExecuted(beforeListener);
            commandService.onCommandExecuted(listener);

            injector.dispose();

            expect(commandService.syncExecuteCommand(pushValCommandID)).toBe(false);
            await expect(commandService.executeCommand(pushValCommandID)).resolves.toBe(false);
            expect(handler).not.toHaveBeenCalled();
            expect(beforeListener).not.toHaveBeenCalled();
            expect(listener).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledTimes(2);
            expect(warn).toHaveBeenCalledWith(
                '[CommandService]',
                `command "${pushValCommandID}" skipped because CommandService is disposed.`
            );
        });

        it('Should stop before invoking command handler when disposed by a before hook', async () => {
            const handler = vi.fn(() => true);
            const listener = vi.fn();
            const warn = vi.spyOn(logService, 'warn');
            const beforeListener = vi.fn(() => (commandService as CommandService).dispose());
            const pushValCommandID = 'push-val-dispose-before-hook';
            commandService.registerCommand({
                id: pushValCommandID,
                type: CommandType.COMMAND,
                handler,
            });
            commandService.beforeCommandExecuted(beforeListener);
            commandService.onCommandExecuted(listener);

            expect(await commandService.executeCommand(pushValCommandID)).toBe(false);
            expect(beforeListener).toHaveBeenCalledTimes(1);
            expect(handler).not.toHaveBeenCalled();
            expect(listener).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                '[CommandService]',
                `command "${pushValCommandID}" skipped because CommandService is disposed.`
            );
        });

        it('Should notify collaboration listeners for mutations and skip regular listeners for sync-only mutations', async () => {
            const mutationID = 'mutation-for-collab-listener';
            const regular = vi.fn();
            const collab = vi.fn();
            const regularDisposable = commandService.onCommandExecuted(regular);
            const collabDisposable = commandService.onMutationExecutedForCollab(collab);

            expect(() => commandService.onMutationExecutedForCollab(collab)).toThrow(
                '[CommandService]: could not add a collab mutation listener twice.'
            );

            commandService.registerCommand({
                id: mutationID,
                type: CommandType.MUTATION,
                handler: () => true,
            });

            await expect(commandService.executeCommand(mutationID, {}, { onlyLocal: true })).resolves.toBe(true);
            expect(regular).toHaveBeenCalledTimes(1);
            expect(collab).toHaveBeenCalledTimes(1);
            expect(collab).toHaveBeenLastCalledWith(
                { id: mutationID, type: CommandType.MUTATION, params: {} },
                { onlyLocal: true }
            );

            regular.mockClear();
            collab.mockClear();
            await expect(commandService.executeCommand(mutationID, {}, { syncOnly: true })).resolves.toBe(true);
            expect(regular).not.toHaveBeenCalled();
            expect(collab).toHaveBeenCalledTimes(1);

            regular.mockClear();
            collab.mockClear();
            expect(commandService.syncExecuteCommand(mutationID, {}, { syncOnly: true })).toBe(true);
            expect(regular).not.toHaveBeenCalled();
            expect(collab).toHaveBeenCalledTimes(1);

            regularDisposable.dispose();
            collabDisposable.dispose();
            regular.mockClear();
            collab.mockClear();
            commandService.syncExecuteCommand(mutationID);
            expect(regular).not.toHaveBeenCalled();
            expect(collab).not.toHaveBeenCalled();
        });

        it('Should attach the triggering command id to nested synchronous mutations', () => {
            const mutationID = 'nested-trigger-mutation';
            const commandID = 'nested-trigger-command';
            const params: { trigger?: string } = {};

            commandService.registerCommand({
                id: mutationID,
                type: CommandType.MUTATION,
                handler: (_accessor, mutationParams: { trigger?: string }) => {
                    expect(mutationParams.trigger).toBe(commandID);
                    return true;
                },
            });
            commandService.registerCommand({
                id: commandID,
                type: CommandType.COMMAND,
                handler: (accessor) => accessor.get(ICommandService).syncExecuteCommand(mutationID, params),
            });

            expect(commandService.syncExecuteCommand(commandID)).toBe(true);
            expect(params.trigger).toBe(commandID);
        });

        it('Should convert custom command execution errors into a false result', async () => {
            const customErrorCommandID = 'custom-error-command';
            commandService.registerCommand({
                id: customErrorCommandID,
                type: CommandType.COMMAND,
                handler: () => {
                    throw new CustomCommandExecutionError('canceled by test');
                },
            });

            await expect(commandService.executeCommand(customErrorCommandID)).resolves.toBe(false);
            expect(commandService.syncExecuteCommand(customErrorCommandID)).toBe(false);
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
            await expect(commandService.executeCommand(commandID)).rejects.toThrow(
                `[CommandService]: command "${commandID}" is not registered.`
            );
        });

        it('Should reject mixing single commands with multi command implementations', () => {
            commandService.registerCommand({
                id: anotherCommandID,
                type: CommandType.COMMAND,
                handler: () => true,
            });

            expect(() => commandService.registerMultipleCommand({
                id: anotherCommandID,
                type: CommandType.COMMAND,
                name: 'multi',
                multi: true,
                priority: 1,
                handler: () => true,
            } as IMultiCommand)).toThrow('Command has registered as a single command.');
        });

        it('Should continue to lower priority implementations when a multi command returns false', async () => {
            const commandID = 'fallback-multi-command';
            const calls: string[] = [];

            commandService.registerMultipleCommand({
                id: commandID,
                type: CommandType.COMMAND,
                name: 'first',
                multi: true,
                priority: 10,
                handler: () => {
                    calls.push('first');
                    return false;
                },
            } as IMultiCommand);
            commandService.registerMultipleCommand({
                id: commandID,
                type: CommandType.COMMAND,
                name: 'second',
                multi: true,
                priority: 1,
                handler: () => {
                    calls.push('second');
                    return true;
                },
            } as IMultiCommand);

            await expect(commandService.executeCommand(commandID)).resolves.toBe(true);
            expect(calls).toEqual(['first', 'second']);
        });
    });
});
