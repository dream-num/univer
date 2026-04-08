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

import type { Injector, Univer } from '@univerjs/core';
import type { TestMessageService } from '../../../__tests__/create-test-bed';
import { ICommandService, IConfirmService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createTestBed,
    IFindReplaceService,
    IMessageService,
} from '../../../__tests__/create-test-bed';
import { FindReplaceService } from '../../../services/find-replace.service';
import { ReplaceAllMatchesCommand, ReplaceCurrentMatchCommand } from '../replace.command';

describe('replace.command', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createTestBed(undefined, [[IFindReplaceService, { useClass: FindReplaceService }]]);
        univer = testBed.univer;
        get = testBed.get;

        const commandService = get(ICommandService);
        commandService.registerCommand(ReplaceCurrentMatchCommand);
        commandService.registerCommand(ReplaceAllMatchesCommand);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should proxy ReplaceCurrentMatchCommand to findReplaceService.replace', async () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        const replaceSpy = vi.spyOn(findReplaceService, 'replace').mockResolvedValue(true);

        await expect(commandService.executeCommand(ReplaceCurrentMatchCommand.id)).resolves.toBe(true);
        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it('should return false when confirm is canceled for replace all', async () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        const confirmService = get(IConfirmService);
        const messageService = get(IMessageService) as TestMessageService;

        vi.spyOn(confirmService, 'confirm').mockResolvedValue(false);
        const replaceAllSpy = vi.spyOn(findReplaceService, 'replaceAll');

        await expect(commandService.executeCommand(ReplaceAllMatchesCommand.id)).resolves.toBe(false);
        expect(replaceAllSpy).not.toHaveBeenCalled();
        expect(messageService.messages).toHaveLength(0);
    });

    it('should show success message when all replacements succeed', async () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        const messageService = get(IMessageService) as TestMessageService;
        vi.spyOn(findReplaceService, 'replaceAll').mockResolvedValue({ success: 3, failure: 0 });

        await expect(commandService.executeCommand(ReplaceAllMatchesCommand.id)).resolves.toBe(true);
        expect(messageService.messages[0]).toEqual(expect.objectContaining({ type: MessageType.Success }));
    });

    it('should show warning when partially succeeds and return false', async () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        const messageService = get(IMessageService) as TestMessageService;
        vi.spyOn(findReplaceService, 'replaceAll').mockResolvedValue({ success: 2, failure: 1 });

        await expect(commandService.executeCommand(ReplaceAllMatchesCommand.id)).resolves.toBe(false);
        expect(messageService.messages[0]).toEqual(expect.objectContaining({ type: MessageType.Warning }));
    });

    it('should show error when all replacements fail and return false', async () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        const messageService = get(IMessageService) as TestMessageService;
        vi.spyOn(findReplaceService, 'replaceAll').mockResolvedValue({ success: 0, failure: 2 });

        await expect(commandService.executeCommand(ReplaceAllMatchesCommand.id)).resolves.toBe(false);
        expect(messageService.messages[0]).toEqual(expect.objectContaining({ type: MessageType.Error }));
    });
});
