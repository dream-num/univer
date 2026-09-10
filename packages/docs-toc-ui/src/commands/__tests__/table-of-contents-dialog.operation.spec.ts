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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { InsertTableOfContentsCommand } from '@univerjs/docs-toc';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IMessageService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { InsertTableOfContentsOperation } from '../table-of-contents-dialog.operation';

describe('InsertTableOfContentsOperation', () => {
    let univer: Univer;
    afterEach(() => univer?.dispose());

    function createAccessor(body: IDocumentBody) {
        univer = new Univer();
        univer.registerPlugin(UniverDocsPlugin);
        const injector = univer.__getInjector();
        const show = vi.fn(() => ({ dispose: vi.fn() }));
        // The native notification surface is unavailable in this headless test.
        injector.add([IMessageService, { useValue: { show, remove: vi.fn(), removeAll: vi.fn() } }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        univer.createUnit<IDocumentData>(UniverInstanceType.UNIVER_DOC, { id: 'doc-1', body, documentStyle: {} });
        injector.get(IUniverInstanceService).focusUnit('doc-1');
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = injector.get(ICommandService);
        commands.registerCommand(InsertTableOfContentsCommand);
        commands.registerCommand(InsertTableOfContentsOperation);
        const dispatched: unknown[] = [];
        const subscription = commands.beforeCommandExecuted((command) => {
            if (command.id === InsertTableOfContentsCommand.id) {
                dispatched.push(command.params);
            }
        });
        return { commands, dispatched, show, subscription };
    }

    it('shows a localized warning and does not invoke insertion without headings', async () => {
        const { commands, dispatched, show, subscription } = createAccessor({
            dataStream: 'Body\r\n',
            paragraphs: [{ startIndex: 4, paragraphId: 'body' }],
        });

        expect(await commands.executeCommand(InsertTableOfContentsOperation.id, { mode: 'automatic' })).toBe(false);
        expect(show).toHaveBeenCalledWith(expect.objectContaining({ content: enUS['docs-toc-ui'].tableOfContents.noHeadings }));
        expect(dispatched).toHaveLength(0);
        subscription.dispose();
    });

    it('dispatches localized automatic options and rejects insertion without rendered layout', async () => {
        const { commands, dispatched, show, subscription } = createAccessor({
            dataStream: 'Heading\r\n',
            paragraphs: [{
                startIndex: 7,
                paragraphId: 'heading',
                paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 },
            }],
        });

        expect(await commands.executeCommand(InsertTableOfContentsOperation.id, { mode: 'automatic' })).toBe(false);
        expect(show).not.toHaveBeenCalled();
        expect(dispatched).toEqual([expect.objectContaining({
            unitId: 'doc-1',
            levels: 3,
            showPageNumbers: true,
            rightAlignPageNumbers: true,
            tabLeader: 'dots',
            format: 'fromTemplate',
            title: 'Contents',
        })]);
        subscription.dispose();
    });
});
