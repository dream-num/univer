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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../common/di';
import { afterInitApply } from '../../shared/after-init-apply';
import { CommandService, CommandType, ICommandService } from '../command/command.service';
import { ConfigService, IConfigService } from '../config/config.service';
import { TestConfirmService } from '../confirm/confirm.service';
import { ContextService, IContextService } from '../context/context.service';
import { ErrorService } from '../error/error.service';
import { DesktopLogService, ILogService } from '../log/log.service';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

function createCommandInjector(): Injector {
    const injector = new Injector();

    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);

    return injector;
}

describe('support services and helpers', () => {
    it('should emit errors through ErrorService obtained from DI and complete on dispose', () => {
        const injector = new Injector([[ErrorService]]);
        const service = injector.get(ErrorService);
        const received: string[] = [];
        let completed = false;

        service.error$.subscribe({
            next: (error) => received.push(error.errorKey),
            complete: () => {
                completed = true;
            },
        });

        service.emit('formula.ref');
        service.emit('permission.denied');
        injector.dispose();

        expect(received).toEqual(['formula.ref', 'permission.denied']);
        expect(completed).toBe(true);
    });

    it('should resolve and fail through TestConfirmService obtained from DI', async () => {
        const injector = new Injector([[TestConfirmService]]);
        const service = injector.get(TestConfirmService<string>);
        let completed = false;

        service.confirmOptions$.subscribe({
            complete: () => {
                completed = true;
            },
        });

        await expect(service.confirm('continue')).resolves.toBe(true);
        expect(() => service.open('open')).toThrow('This is not implemented in the test service!');
        expect(() => service.close('id')).toThrow('This is not implemented in the test service!');

        injector.dispose();
        expect(completed).toBe(true);
    });

    it('should resolve afterInitApply on mutation execution before fallback timer', async () => {
        vi.useFakeTimers();

        const injector = createCommandInjector();
        const commandService = injector.get(ICommandService);

        commandService.registerCommand({
            id: 'support.mutation',
            type: CommandType.MUTATION,
            handler: () => true,
        });

        const pending = afterInitApply(commandService);
        await commandService.executeCommand('support.mutation');
        await vi.advanceTimersByTimeAsync(16);

        await expect(pending).resolves.toBeUndefined();
        injector.dispose();
    });

    it('should resolve afterInitApply through the fallback timer when no mutation runs', async () => {
        vi.useFakeTimers();

        const injector = createCommandInjector();
        const commandService = injector.get(ICommandService);
        let settled = false;

        const pending = afterInitApply(commandService).then(() => {
            settled = true;
        });

        await vi.advanceTimersByTimeAsync(320);
        await pending;

        expect(settled).toBe(true);
        injector.dispose();
    });
});
