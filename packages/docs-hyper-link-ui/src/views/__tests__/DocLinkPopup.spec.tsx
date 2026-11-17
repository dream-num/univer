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
    DocumentFlavor,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation, setDocumentPermissionValue } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { BrowserClipboardService, DesktopLayoutService, IClipboardInterfaceService, IDialogService, ILayoutService, IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import { ClickDocHyperLinkOperation, ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { DocHyperLinkEdit } from '../DocHyperLinkEdit';
import { DocLinkPopup } from '../DocLinkPopup';
import { MobileDocHyperLinkEdit } from '../MobileDocHyperLinkEdit';
import { MobileDocLinkPopup } from '../MobileDocLinkPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'doc-link-popup-doc';
const execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');

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

function createPopupTestBed(documentData = createDocData()) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocCanvasPopManagerService, { useClass: TestDocCanvasPopManagerService as never }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService }]);
    injector.add([IDialogService, {
        useValue: {
            close: () => {},
            closeAll: () => {},
            getDialogs$: () => of([]),
            open: () => toDisposable(() => {}),
        },
    }]);
    injector.add([DocHyperLinkPopupService]);

    const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, documentData);
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
    injector.get(LocaleService).setDirection('ltr');

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(AddDocHyperLinkCommand);
    commandService.registerCommand(UpdateDocHyperLinkCommand);
    commandService.registerCommand(DeleteDocHyperLinkCommand);
    commandService.registerCommand(ShowDocHyperLinkEditPopupOperation);
    commandService.registerCommand(ClickDocHyperLinkOperation);
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

    return {
        edit: container.querySelector<HTMLButtonElement>('button[aria-label="Edit"]')!,
        remove: container.querySelector<HTMLButtonElement>('button[aria-label="Remove link"]')!,
    };
}

function renderEditPopup(root: Root, testBed: ReturnType<typeof createPopupTestBed>, mobile = false) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                {mobile ? <MobileDocHyperLinkEdit /> : <DocHyperLinkEdit />}
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
        vi.restoreAllMocks();
        if (execCommandDescriptor) {
            Object.defineProperty(document, 'execCommand', execCommandDescriptor);
        } else {
            Reflect.deleteProperty(document, 'execCommand');
        }
        vi.useRealTimers();
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

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('displays and edits the newly hovered link (document flavor %s)', async (documentFlavor) => {
        vi.useFakeTimers();
        const documentData = createDocData();
        documentData.documentStyle = { ...documentData.documentStyle, documentFlavor };
        documentData.body?.customRanges?.unshift({
            startIndex: 0,
            endIndex: 4,
            rangeId: 'first-link',
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://example.com/first' },
        });
        currentTestBed = createPopupTestBed(documentData);
        currentTestBed.popupService.showInfoPopupFromHover({
            unitId: UNIT_ID,
            linkId: 'first-link',
            startIndex: 0,
            endIndex: 4,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const actions = renderPopup(root, container, currentTestBed);
        expect(container.textContent).toContain('https://example.com/first');
        expect(container.textContent).not.toContain('https://univer.ai');
        const secondLink = { unitId: UNIT_ID, linkId: 'existing-link', startIndex: 6, endIndex: 10 };
        const executedCommands: Array<{ id: string; params: unknown }> = [];
        currentTestBed.commandService.onCommandExecuted((command) => {
            executedCommands.push({ id: command.id, params: command.params });
        });

        await act(async () => {
            currentTestBed?.popupService.showInfoPopupFromHover(secondLink);
            vi.advanceTimersByTime(200);
        });
        expect(container.textContent).toContain('https://univer.ai');
        expect(container.textContent).not.toContain('https://example.com/first');
        expect(container.contains(actions.edit)).toBe(true);

        await act(async () => {
            actions.edit.click();
        });

        expect(executedCommands).toContainEqual({
            id: ShowDocHyperLinkEditPopupOperation.id,
            params: { link: { ...secondLink, segmentId: undefined, segmentPage: undefined } },
        });
        expect(currentTestBed.popupService.editing).toEqual(secondLink);
        expect(currentTestBed.popupService.showing).toBeNull();
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('keeps the current URL clickable while crossing an adjacent link into its popup (document flavor %s)', async (documentFlavor) => {
        vi.useFakeTimers();
        const documentData = createDocData();
        documentData.documentStyle = { ...documentData.documentStyle, documentFlavor };
        documentData.body?.customRanges?.unshift({
            startIndex: 0,
            endIndex: 4,
            rangeId: 'first-link',
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://example.com/first' },
        });
        currentTestBed = createPopupTestBed(documentData);
        const popupService = currentTestBed.popupService;
        const secondLink = { unitId: UNIT_ID, linkId: 'existing-link', startIndex: 6, endIndex: 10 };
        popupService.showInfoPopupFromHover(secondLink);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderPopup(root, container, currentTestBed);
        const open = vi.spyOn(window, 'open').mockReturnValue(null);
        const popup = container.firstElementChild;
        expect(popup).toBeInstanceOf(HTMLElement);

        await act(async () => {
            popupService.showInfoPopupFromHover({ unitId: UNIT_ID, linkId: 'first-link', startIndex: 0, endIndex: 4 });
            vi.advanceTimersByTime(100);
            popup?.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
            vi.advanceTimersByTime(30);
            popupService.showInfoPopupFromHover({ unitId: UNIT_ID, linkId: 'first-link', startIndex: 0, endIndex: 4 });
            popupService.scheduleHideInfoPopup();
            vi.advanceTimersByTime(200);
        });
        expect(popupService.showing).toEqual(secondLink);
        expect(container.firstElementChild).toBe(popup);
        expect(container.textContent).toContain('https://univer.ai');
        expect(container.textContent).not.toContain('https://example.com/first');

        const url = Array.from(container.querySelectorAll('span')).find((span) => span.textContent === 'https://univer.ai');
        expect(url).toBeDefined();
        await act(async () => {
            url?.click();
        });
        expect(open).toHaveBeenCalledExactlyOnceWith('https://univer.ai', '_blank', 'noopener noreferrer');
        expect(popupService.showing).toBeNull();
    });

    it('disables the copy action when document copy permission is denied', () => {
        currentTestBed = createPopupTestBed();
        setDocumentPermissionValue(
            currentTestBed.injector.get(IPermissionService),
            UNIT_ID,
            UNIT_ID,
            UnitAction.Copy,
            false
        );
        showExistingLink(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        renderPopup(root, container, currentTestBed);

        const copy = container.querySelector<HTMLButtonElement>('button[aria-label="Copy"]');
        expect(copy).toBeInstanceOf(HTMLButtonElement);
        expect(copy?.disabled).toBe(true);
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

    it.each([false, true])('updates an existing document hyperlink from the edit form (mobile: %s)', async (mobile) => {
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

        const focusedInputs: EventTarget[] = [];
        container.addEventListener('focusin', (event) => {
            if (event.target instanceof HTMLInputElement) {
                focusedInputs.push(event.target);
            }
        });
        renderEditPopup(root, currentTestBed, mobile);

        const [labelInput, linkInput] = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        expect(labelInput.value).toBe('world');
        expect(linkInput.value).toBe('https://univer.ai');
        if (mobile) {
            expect(focusedInputs).toEqual([labelInput]);
        }

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

    it.each(['TOC', 'REF', 'PAGEREF', 'NOTEREF'])('keeps %s generated link targets visible without generic edit/unlink actions', (fieldType) => {
        const data = createDocData();
        data.body!.dataStream = '\u001FHello world\u001E\r\n';
        data.body!.customRanges = [
            { startIndex: 0, endIndex: 12, rangeId: 'field', rangeType: CustomRangeType.FIELD, properties: { fieldType, instruction: fieldType } },
            { startIndex: 7, endIndex: 11, rangeId: 'existing-link', rangeType: CustomRangeType.HYPERLINK, properties: { bookmarkId: '_TocExample' } },
        ];
        currentTestBed = createPopupTestBed(data);
        const info = { unitId: UNIT_ID, linkId: 'existing-link', startIndex: 7, endIndex: 11 };
        currentTestBed.popupService.showInfoPopup(info);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const actions = renderPopup(root, container, currentTestBed);
        expect(container.textContent).toContain('#_TocExample');
        expect(container.querySelector<HTMLButtonElement>('button[aria-label="Copy"]')?.disabled).toBe(false);
        expect(actions.edit).toBeNull();
        expect(actions.remove).toBeNull();
        expect(currentTestBed.popupService.showEditPopup(UNIT_ID, info)).toBeNull();
        expect(currentTestBed.popupService.editing).toBeNull();
    });

    it.each([false, true])('copies the original internal target without the native clipboard API (mobile: %s)', async (mobile) => {
        const data = createDocData();
        data.body!.customRanges![0].properties = { bookmarkId: '_TocExample' };
        data.body!.customRanges!.push({ startIndex: 0, endIndex: 4, rangeId: 'target', rangeType: CustomRangeType.BOOKMARK, properties: { bookmarkId: '_TocExample' } });
        currentTestBed = createPopupTestBed(data);
        showExistingLink(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => root!.render(<RediContext.Provider value={{ injector: currentTestBed!.injector }}>{mobile ? <MobileDocLinkPopup /> : <DocLinkPopup />}</RediContext.Provider>));

        vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as never);
        const snapshot = structuredClone(currentTestBed.doc.getSnapshot());
        const copied: string[] = [];
        const execCommand = vi.fn((command: string) => {
            expect(command).toBe('copy');
            copied.push(document.querySelector('textarea')!.value);
            return true;
        });
        Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
        expect(container.querySelector('button[aria-label="Hello"]')).toBeTruthy();
        const copy = container.querySelector<HTMLButtonElement>('button[aria-label="Copy"]')!;
        container.tabIndex = 0;
        container.focus();
        await act(async () => {
            copy.click();
            await Promise.resolve();
        });
        expect(copied).toEqual(['#_TocExample']);
        expect(document.activeElement).toBe(container);
        expect(document.querySelector('textarea')).toBeNull();
        expect(currentTestBed.doc.getSnapshot()).toEqual(snapshot);
    });

    it('navigates a mobile internal link within the document', async () => {
        const data = createDocData();
        data.body!.customRanges![0].properties = { bookmarkId: '_TocExample' };
        data.body!.customRanges!.push({ startIndex: 0, endIndex: 4, rangeId: 'target', rangeType: CustomRangeType.BOOKMARK, properties: { bookmarkId: '_TocExample' } });
        currentTestBed = createPopupTestBed(data);
        const selection = currentTestBed.injector.get(DocSelectionManagerService);
        selection.__TEST_ONLY_setCurrentSelection({ unitId: UNIT_ID, subUnitId: UNIT_ID });
        selection.__TEST_ONLY_add([{ startOffset: 6, endOffset: 6, collapsed: true, isActive: true, segmentId: '', style: null as never }]);
        showExistingLink(currentTestBed);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => root!.render(<RediContext.Provider value={{ injector: currentTestBed!.injector }}><MobileDocLinkPopup /></RediContext.Provider>));
        const open = vi.spyOn(window, 'open').mockReturnValue(null);
        const target = container.querySelector<HTMLButtonElement>('button[aria-label="Hello"]');
        const destinations: number[] = [];
        const navigation = selection.refreshSelection$.subscribe((event) => {
            if (event) {
                destinations.push(event.docRanges[0].startOffset);
            }
        });
        expect(target).toBeTruthy();
        await act(async () => {
            target!.click();
            await Promise.resolve();
        });
        expect(destinations).toContain(0);
        expect(open).not.toHaveBeenCalled();
        navigation.unsubscribe();
    });

    it.each([false, true])('retains an internal target when confirming its hyperlink editor (mobile: %s)', async (mobile) => {
        const data = createDocData();
        data.body!.customRanges![0].properties = { bookmarkId: '_TocExample', textStyleMode: 'text' };
        data.body!.customRanges!.push({ startIndex: 0, endIndex: 4, rangeId: 'target', rangeType: CustomRangeType.BOOKMARK, properties: { bookmarkId: '_TocExample' } });
        currentTestBed = createPopupTestBed(data);
        const selection = currentTestBed.injector.get(DocSelectionManagerService);
        selection.__TEST_ONLY_setCurrentSelection({ unitId: UNIT_ID, subUnitId: UNIT_ID });
        selection.__TEST_ONLY_add([{ startOffset: 6, endOffset: 11, collapsed: false, isActive: true, segmentId: '', style: null as never }]);
        currentTestBed.popupService.showEditPopup(UNIT_ID, { unitId: UNIT_ID, linkId: 'existing-link', startIndex: 6, endIndex: 10, segmentId: '' });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        renderEditPopup(root, currentTestBed, mobile);
        const inputs = Array.from(container.querySelectorAll('input'));
        expect(inputs[1].value).toBe('#_TocExample');
        const confirm = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Confirm')!;
        await act(async () => {
            confirm.click();
            await Promise.resolve();
        });
        expect(currentTestBed.doc.getBody()?.customRanges?.find((range) => range.rangeId === 'existing-link')?.properties)
            .toEqual({ bookmarkId: '_TocExample', textStyleMode: 'text' });
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
