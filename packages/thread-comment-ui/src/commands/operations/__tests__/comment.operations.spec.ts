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
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThreadCommentPanelService } from '../../../services/thread-comment-panel.service';
import { SetActiveCommentOperation } from '../comment.operations';

describe('SetActiveCommentOperation', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let panelService: ThreadCommentPanelService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ThreadCommentPanelService]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetActiveCommentOperation);
        panelService = injector.get(ThreadCommentPanelService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('activates the thread comment selected by the user', async () => {
        const activeComment = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            commentId: 'comment-1',
        };

        const result = await commandService.executeCommand(SetActiveCommentOperation.id, activeComment);

        expect(result).toBe(true);
        expect(panelService.activeCommentId).toEqual(activeComment);
    });

    it('clears active thread comment when the selection is reset', async () => {
        await commandService.executeCommand(SetActiveCommentOperation.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            commentId: 'comment-1',
        });

        const result = await commandService.executeCommand(SetActiveCommentOperation.id);

        expect(result).toBe(true);
        expect(panelService.activeCommentId).toBeUndefined();
    });
});
