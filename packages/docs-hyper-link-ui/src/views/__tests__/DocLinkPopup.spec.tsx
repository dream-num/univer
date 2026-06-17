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
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { DocLinkPopup } from '../DocLinkPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-link-popup-doc';

class TestDocCanvasPopManagerService {
    attachPopupToRange() {
        return toDisposable(() => undefined);
    }
}

class TestMessageService {
    readonly messages: unknown[] = [];

    show(message: unknown) {
        this.messages.push(message);
    }
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
            },
        },
    });

    const commandService = injector.get(ICommandService);
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
});
