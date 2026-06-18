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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    CustomRangeType,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { DocHyperLinkEdit } from '../DocHyperLinkEdit';
import { DocLinkPopup } from '../DocLinkPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-link-popup-doc';

class TestDocCanvasPopManagerService {
    disposeCount = 0;

    attachPopupToRange() {
        return toDisposable(() => {
            this.disposeCount += 1;
        });
    }
}

class TestMessageService {
    readonly messages: unknown[] = [];

    show(message: unknown) {
        this.messages.push(message);
    }
}

function setInputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function createDocData(): IDocumentData {
    return {
        id: UNIT_ID,
        body: {
            dataStream: 'Hello world\r\n',
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'existing-link',
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: 'https://univer.ai',
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

function createPopupTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocCanvasPopManagerService, { useClass: TestDocCanvasPopManagerService as never }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([DocHyperLinkPopupService]);

    const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'docs-hyper-link-ui': {
                info: {
                    copy: 'Copy',
                    edit: 'Edit',
                    cancel: 'Remove link',
                    coped: 'Copied',
                },
                edit: {
                    label: 'Label',
                    labelError: 'Label is required',
                    address: 'Address',
                    addressError: 'Address is invalid',
                    cancel: 'Cancel',
                    confirm: 'Confirm',
                },
            },
        },
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(AddDocHyperLinkCommand);
    commandService.registerCommand(UpdateDocHyperLinkCommand);
    commandService.registerCommand(DeleteDocHyperLinkCommand);
    commandService.registerCommand(ShowDocHyperLinkEditPopupOperation);
    commandService.registerCommand(RichTextEditingMutation);

    return {
        univer,
        injector,
        commandService,
        popupService: injector.get(DocHyperLinkPopupService),
        doc,
    };
}

function showExistingLink(testBed: ReturnType<typeof createPopupTestBed>) {
    testBed.popupService.showInfoPopup({
        unitId: UNIT_ID,
        linkId: 'existing-link',
        startIndex: 6,
        endIndex: 10,
    });
}

function renderPopup(root: Root, container: HTMLDivElement, testBed: ReturnType<typeof createPopupTestBed>) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DocLinkPopup />
            </RediContext.Provider>
        );
    });

    const actions = Array.from(container.querySelectorAll('.univer-ml-2')) as HTMLElement[];

    return {
        edit: actions[1],
        remove: actions[2],
    };
}

function renderEditPopup(root: Root, testBed: ReturnType<typeof createPopupTestBed>) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DocHyperLinkEdit />
            </RediContext.Provider>
        );
    });
}

describe('DocLinkPopup', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('opens the hyperlink edit popup for the currently displayed document link', async () => {
        currentTestBed = createPopupTestBed();
        showExistingLink(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const executedCommands: Array<{ id: string; params: unknown }> = [];
        currentTestBed.commandService.onCommandExecuted((command) => {
            executedCommands.push({ id: command.id, params: command.params });
        });
        const actions = renderPopup(root, container, currentTestBed);

        await act(async () => {
            actions.edit.click();
            await Promise.resolve();
        });

        expect(executedCommands).toContainEqual({
            id: ShowDocHyperLinkEditPopupOperation.id,
            params: {
                link: {
                    unitId: UNIT_ID,
                    linkId: 'existing-link',
                    segmentId: undefined,
                    segmentPage: undefined,
                    startIndex: 6,
                    endIndex: 10,
                },
            },
        });
    });

    it('removes the displayed hyperlink while keeping the document text', async () => {
        currentTestBed = createPopupTestBed();
        showExistingLink(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const actions = renderPopup(root, container, currentTestBed);

        await act(async () => {
            actions.remove.click();
            await Promise.resolve();
        });

        const body = currentTestBed.doc.getBody();

        expect(body?.dataStream).toBe('Hello world\r\n');
        expect(body?.customRanges?.some((range) => range.rangeId === 'existing-link')).toBe(false);
    });

    it('updates an existing document hyperlink from the edit form', async () => {
        currentTestBed = createPopupTestBed();
        const selectionManager = currentTestBed.injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: UNIT_ID, subUnitId: UNIT_ID });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 6,
            endOffset: 11,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);
        currentTestBed.popupService.showEditPopup(UNIT_ID, {
            unitId: UNIT_ID,
            linkId: 'existing-link',
            segmentId: '',
            startIndex: 6,
            endIndex: 10,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderEditPopup(root, currentTestBed);

        const [labelInput, linkInput] = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        expect(labelInput.value).toBe('world');
        expect(linkInput.value).toBe('https://univer.ai');

        await act(async () => {
            setInputText(labelInput, 'docs');
            setInputText(linkInput, 'docs.univer.ai');
            await Promise.resolve();
        });

        const confirm = Array.from(container.querySelectorAll('button, [data-u-comp="button"]'))
            .find((button) => button.textContent === 'Confirm') as HTMLElement;
        expect(confirm).toBeTruthy();

        await act(async () => {
            confirm.click();
            await Promise.resolve();
        });

        const body = currentTestBed.doc.getBody();
        const updatedLink = body?.customRanges?.find((range) => range.rangeId === 'existing-link');

        expect(body?.dataStream).toBe('Hello docs\r\n');
        expect(updatedLink?.properties).toEqual({
            url: 'https://docs.univer.ai',
        });
        expect(currentTestBed.popupService.editing).toBeNull();
    });

    it('adds a document hyperlink from selected text and normalizes a bare URL', async () => {
        currentTestBed = createPopupTestBed();
        const selectionManager = currentTestBed.injector.get(DocSelectionManagerService);
        const popManager = currentTestBed.injector.get(DocCanvasPopManagerService) as unknown as TestDocCanvasPopManagerService;
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: UNIT_ID, subUnitId: UNIT_ID });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);
        currentTestBed.popupService.showEditPopup(UNIT_ID, null);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderEditPopup(root, currentTestBed);

        const [linkInput] = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        expect(linkInput.value).toBe('');

        await act(async () => {
            setInputText(linkInput, 'docs.univer.ai');
            await Promise.resolve();
        });

        const confirm = Array.from(container.querySelectorAll('button, [data-u-comp="button"]'))
            .find((button) => button.textContent === 'Confirm') as HTMLElement;

        await act(async () => {
            confirm.click();
            await Promise.resolve();
        });

        const body = currentTestBed.doc.getBody();
        const addedLink = body?.customRanges?.find((range) => range.properties?.url === 'https://docs.univer.ai');

        expect(body?.dataStream).toBe('Hello world\r\n');
        expect(addedLink?.startIndex).toBe(0);
        expect(addedLink?.endIndex).toBe(4);
        expect(currentTestBed.popupService.editing).toBeNull();
        expect(popManager.disposeCount).toBe(1);
    });
});
