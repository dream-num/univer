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

import { ICommandService, toDisposable } from '@univerjs/core';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { IFindReplaceService } from '@univerjs/find-replace';
import { IMenuManagerService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DocsReplaceCommand } from '../../commands/commands/docs-replace.command';
import { menuSchema } from '../../menu/schema';
import { DocsFindReplaceProvider } from '../../services/docs-find-replace.provider';
import { DocsFindReplaceController } from '../docs-find-replace.controller';

describe('DocsFindReplaceController', () => {
    it('registers and disposes the provider, command, and menu', () => {
        const providerDisposed = vi.fn();
        const registerProvider = vi.fn(() => toDisposable(providerDisposed));
        const mergeMenu = vi.fn();
        const testBed = createCommandTestBed(undefined, [
            [IFindReplaceService, { useValue: { registerFindReplaceProvider: registerProvider } as unknown as IFindReplaceService }],
            [IMenuManagerService, { useValue: { mergeMenu } as unknown as IMenuManagerService }],
        ]);
        testBed.injector.add([DocsFindReplaceProvider]);
        const commandService = testBed.get(ICommandService);
        const registerCommand = vi.spyOn(commandService, 'registerCommand');

        const controller = testBed.injector.createInstance(DocsFindReplaceController);
        expect(registerProvider).toHaveBeenCalledWith(testBed.injector.get(DocsFindReplaceProvider));
        expect(registerCommand).toHaveBeenCalledWith(DocsReplaceCommand);
        expect(mergeMenu).toHaveBeenCalledWith(menuSchema);

        controller.dispose();
        expect(providerDisposed).toHaveBeenCalledOnce();
        testBed.univer.dispose();
    });
});
