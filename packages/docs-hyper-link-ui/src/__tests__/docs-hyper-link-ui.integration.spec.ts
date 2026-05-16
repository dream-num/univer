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

import type { DocumentDataModel, ICommand, IDisposable, IDocumentData, Injector } from '@univerjs/core';
import {
    awaitTime,
    CustomRangeType,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddDocHyperLinkCommand } from '../commands/commands/add-link.command';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { UpdateDocHyperLinkCommand } from '../commands/commands/update-link.command';
import { ClickDocHyperLinkOperation } from '../commands/operations/popup.operation';
import { DocHyperLinkSelectionController } from '../controllers/doc-hyper-link-selection.controller';
import { DocHyperLinkPopupService } from '../services/hyper-link-popup.service';
import { createDocUiTestBed } from './create-doc-ui-test-bed';

function createDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello world\r\n',
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'link-1',
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

function getBody(get: Injector['get']) {
    return get(IUniverInstanceService)
        .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)
        ?.getBody();
}

function createPopupManagerStub() {
    const disposables: IDisposable[] = [];

    return {
        disposables,
        attachPopupToRange: vi.fn(() => {
            const disposable = {
                dispose: vi.fn(),
            };

            disposables.push(disposable);
            return disposable;
        }),
    };
}

describe('docs-hyper-link-ui integration', () => {
    let univer: ReturnType<typeof createDocUiTestBed>['univer'];
    let get: Injector['get'];
    let injector: Injector;
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createDocUiTestBed(createDocData());
        univer = testBed.univer;
        get = testBed.get;
        injector = testBed.injector;
        commandService = get(ICommandService);

        commandService.registerCommand(AddDocHyperLinkCommand);
        commandService.registerCommand(UpdateDocHyperLinkCommand);
        commandService.registerCommand(DeleteDocHyperLinkCommand);
        commandService.registerCommand(ClickDocHyperLinkOperation);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it('adds a hyperlink through the real command pipeline', async () => {
        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await commandService.executeCommand(AddDocHyperLinkCommand.id, {
            unitId: 'test-doc',
            payload: 'https://added.invalid',
        })).toBeTruthy();
        await awaitTime(0);

        const addedLink = getBody(get)?.customRanges?.find((range) => range.properties?.url === 'https://added.invalid');
        expect(addedLink).toBeDefined();
        expect(addedLink?.rangeType).toBe(CustomRangeType.HYPERLINK);
    });

    it('updates hyperlink text and payload through the real command pipeline', async () => {
        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_add([{
            startOffset: 6,
            endOffset: 11,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
            unitId: 'test-doc',
            linkId: 'link-1',
            payload: 'https://after.invalid',
            label: 'planet',
            segmentId: '',
        })).toBeTruthy();
        await awaitTime(0);

        expect(getBody(get)?.dataStream).toBe('Hello planet\r\n');
        expect(getBody(get)?.customRanges?.find((range) => range.rangeId === 'link-1')?.properties).toEqual({
            url: 'https://after.invalid',
        });
    });

    it('deletes a hyperlink range while keeping the text content', async () => {
        expect(getBody(get)?.dataStream).toBe('Hello world\r\n');

        expect(await commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
            unitId: 'test-doc',
            linkId: 'link-1',
        })).toBeTruthy();
        await awaitTime(0);

        expect(getBody(get)?.dataStream).toBe('Hello world\r\n');
        expect(getBody(get)?.customRanges?.some((range) => range.rangeId === 'link-1')).toBe(false);
    });

    it('shows and hides the info popup when the executed selection enters and leaves a hyperlink', async () => {
        const popupManagerStub = createPopupManagerStub();
        injector.add([DocCanvasPopManagerService, { useValue: popupManagerStub as unknown as DocCanvasPopManagerService }]);
        injector.add([DocHyperLinkPopupService]);
        injector.add([DocHyperLinkSelectionController]);

        const popupService = injector.get(DocHyperLinkPopupService);
        injector.get(DocHyperLinkSelectionController);

        expect(await commandService.executeCommand(SetTextSelectionsOperation.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            segmentId: '',
            isEditing: false,
            style: null,
            ranges: [{
                startOffset: 7,
                endOffset: 7,
                collapsed: true,
                segmentId: '',
            }],
        })).toBe(true);

        expect(popupService.showing).toMatchObject({
            unitId: 'test-doc',
            linkId: 'link-1',
            segmentId: '',
            startIndex: 6,
            endIndex: 10,
        });
        expect(popupManagerStub.attachPopupToRange).toHaveBeenCalledWith({
            collapsed: false,
            startOffset: 6,
            endOffset: 11,
            segmentId: '',
            segmentPage: undefined,
        }, expect.objectContaining({
            componentKey: 'univer.doc.link-info-popup',
        }), 'test-doc');

        expect(await commandService.executeCommand(SetTextSelectionsOperation.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            segmentId: '',
            isEditing: false,
            style: null,
            ranges: [{
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId: '',
            }],
        })).toBe(true);

        expect(popupService.showing).toBeNull();
        expect(popupManagerStub.disposables[0]?.dispose).toHaveBeenCalled();
    });

    it('opens the hyperlink URL when the click operation is executed', async () => {
        const openSpy = vi.fn();
        vi.stubGlobal('window', { open: openSpy });

        expect(await commandService.executeCommand(ClickDocHyperLinkOperation.id, {
            unitId: 'test-doc',
            linkId: 'link-1',
            segmentId: '',
        })).toBe(true);

        expect(openSpy).toHaveBeenCalledWith('https://before.invalid', '_blank', 'noopener noreferrer');
    });
});
