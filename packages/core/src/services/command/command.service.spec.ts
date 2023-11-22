/* eslint-disable no-magic-numbers */
import { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DesktopLogService, ILogService } from '../log/log.service';
import { CommandService, CommandType, ICommandService, sequenceExecute, sequenceExecuteAsync } from './command.service';

const commandID = 'emit-plural-error-command';

describe('Test CommandService', () => {
    let injector: Injector;
    let commandService: ICommandService;

    beforeEach(() => {
        injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);

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

    describe('Test "sequenceExecuteAsync" utils function', () => {
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
});
