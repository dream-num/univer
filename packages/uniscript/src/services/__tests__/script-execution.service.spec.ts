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

import { DesktopLogService, ICommandService, ILogService, Injector, IUniverInstanceService, LifecycleService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IUniscriptExecutionService, UniscriptExecutionService } from '../script-execution.service';

type UniscriptGlobal = typeof globalThis & { __uniscriptResult?: boolean };

describe('UniscriptExecutionService', () => {
    let service: IUniscriptExecutionService;
    let logService: ILogService;

    beforeEach(() => {
        Reflect.deleteProperty(globalThis, '__uniscriptResult');
        const injector = new Injector();
        class TestCommandService {}

        class TestUniverInstanceService {}

        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([LifecycleService]);
        injector.add([IUniscriptExecutionService, { useClass: UniscriptExecutionService }]);
        service = injector.get(IUniscriptExecutionService);
        logService = injector.get(ILogService);
    });

    afterEach(() => {
        Reflect.deleteProperty(globalThis, '__uniscriptResult');
        vi.restoreAllMocks();
    });

    it('executes user script code with the Univer API argument available', async () => {
        await expect(service.execute('globalThis.__uniscriptResult = typeof univerAPI === "object";')).resolves.toBe(true);

        expect((globalThis as UniscriptGlobal).__uniscriptResult).toBe(true);
    });

    it('logs script runtime errors and reports failure', async () => {
        const errorSpy = vi.spyOn(logService, 'error');

        await expect(service.execute('throw new Error("boom");')).resolves.toBe(false);

        expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
});
