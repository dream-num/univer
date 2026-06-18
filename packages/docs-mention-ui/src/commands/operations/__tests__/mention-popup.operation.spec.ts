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

import { ICommandService, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocMentionService } from '../../../services/doc-mention.service';
import {
    CloseMentionEditPopupOperation,
    CloseMentionInfoPopupOperation,
    ShowMentionEditPopupOperation,
    ShowMentionInfoPopupOperation,
} from '../mention-popup.operation';

describe('mention edit popup operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let mentionService: DocMentionService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DocMentionService]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(ShowMentionEditPopupOperation);
        commandService.registerCommand(CloseMentionEditPopupOperation);
        commandService.registerCommand(ShowMentionInfoPopupOperation);
        commandService.registerCommand(CloseMentionInfoPopupOperation);
        mentionService = injector.get(DocMentionService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('starts editing a mention at the requested document index', async () => {
        const result = await commandService.executeCommand(ShowMentionEditPopupOperation.id, {
            unitId: 'doc-1',
            startIndex: 8,
        });

        expect(result).toBe(true);
        expect(mentionService.editing).toEqual({
            unitId: 'doc-1',
            index: 8,
        });
    });

    it('closes the active mention editor', async () => {
        await commandService.executeCommand(ShowMentionEditPopupOperation.id, {
            unitId: 'doc-1',
            startIndex: 8,
        });

        const result = await commandService.executeCommand(CloseMentionEditPopupOperation.id);

        expect(result).toBe(true);
        expect(mentionService.editing).toBeUndefined();
    });

    it('does not start mention editing without a target position', async () => {
        const result = await commandService.executeCommand(ShowMentionEditPopupOperation.id);

        expect(result).toBe(false);
        expect(mentionService.editing).toBeUndefined();
    });

    it('keeps info popup operations as event placeholders', async () => {
        await expect(commandService.executeCommand(ShowMentionInfoPopupOperation.id, {
            unitId: 'doc-1',
            mentionId: 'mention-1',
        })).resolves.toBe(false);
        await expect(commandService.executeCommand(CloseMentionInfoPopupOperation.id)).resolves.toBe(false);
    });
});
