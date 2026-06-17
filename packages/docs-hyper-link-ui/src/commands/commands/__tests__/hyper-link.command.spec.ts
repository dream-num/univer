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

import type { DocumentDataModel, ICommand, IDocumentData } from '@univerjs/core';
import { CustomRangeType, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AddDocHyperLinkCommand } from '../add-link.command';
import { DeleteDocHyperLinkCommand } from '../delete-link.command';

const unitId = 'hyper-link-doc';

function createDocData(): IDocumentData {
    return {
        id: unitId,
        body: {
            dataStream: 'Hello world\r\n',
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'existing-link',
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: 'https://before.invalid',
                },
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('doc hyperlink commands', () => {
    let univer: Univer;
    let commandService: ICommandService;

    function getDocBody() {
        return univer.__getInjector()
            .get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)
            ?.getBody();
    }

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);

        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());
        injector.get(IUniverInstanceService).focusUnit(unitId);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddDocHyperLinkCommand);
        commandService.registerCommand(DeleteDocHyperLinkCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds a hyperlink to the selected document text', async () => {
        const result = await commandService.executeCommand(AddDocHyperLinkCommand.id, {
            unitId,
            payload: 'https://added.invalid',
            selections: [{
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
                segmentId: '',
            }],
        });

        let addedLink;
        for (const range of getDocBody()?.customRanges ?? []) {
            if (range.properties?.url === 'https://added.invalid') {
                addedLink = range;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(addedLink).toMatchObject({
            startIndex: 0,
            endIndex: 4,
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'https://added.invalid',
            },
        });
    });

    it('removes a hyperlink while keeping the document text', async () => {
        const result = await commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
            unitId,
            linkId: 'existing-link',
        });

        let removedLinkStillExists = false;
        for (const range of getDocBody()?.customRanges ?? []) {
            if (range.rangeId === 'existing-link') {
                removedLinkStillExists = true;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(getDocBody()?.dataStream).toBe('Hello world\r\n');
        expect(removedLinkStillExists).toBe(false);
    });
});
