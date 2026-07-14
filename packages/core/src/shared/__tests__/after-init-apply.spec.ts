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
import { CommandService, CommandType, ICommandService } from '../../services/command/command.service';
import { ConfigService, IConfigService } from '../../services/config/config.service';
import { ContextService, IContextService } from '../../services/context/context.service';
import { DesktopLogService, ILogService } from '../../services/log/log.service';
import { afterInitApply } from '../after-init-apply';

function createCommandInjector(): Injector {
    return new Injector([
        [ICommandService, { useClass: CommandService }],
        [ILogService, { useClass: DesktopLogService }],
        [IContextService, { useClass: ContextService }],
        [IConfigService, { useClass: ConfigService }],
    ]);
}

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('afterInitApply', () => {
    it('resolves after a mutation executes before the fallback timer', async () => {
        vi.useFakeTimers();
        const injector = createCommandInjector();
        const commandService = injector.get(ICommandService);

        commandService.registerCommand({
            id: 'after-init-apply.mutation',
            type: CommandType.MUTATION,
            handler: () => true,
        });

        const pending = afterInitApply(commandService);
        await commandService.executeCommand('after-init-apply.mutation');
        await vi.advanceTimersByTimeAsync(16);

        await expect(pending).resolves.toBeUndefined();
        injector.dispose();
    });

    it('resolves through the fallback timer when no mutation executes', async () => {
        vi.useFakeTimers();
        const injector = createCommandInjector();
        const commandService = injector.get(ICommandService);

        const pending = afterInitApply(commandService);
        await vi.advanceTimersByTimeAsync(320);

        await expect(pending).resolves.toBeUndefined();
        injector.dispose();
    });
});
