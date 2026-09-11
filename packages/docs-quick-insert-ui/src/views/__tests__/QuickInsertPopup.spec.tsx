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
import type { DocPopupMenu } from '../../services/doc-quick-insert-popup.service';
import { createRequire } from 'node:module';
import { DocumentFlavor, ICommandService, LocaleService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { CutContentCommand, DocCanvasPopManagerService, DocEventManagerService, DocLayoutInteractionService } from '@univerjs/docs-ui';
import { CanvasColorService, Documents, ICanvasColorService, IRenderManagerService, RenderManagerService, RenderUnit } from '@univerjs/engine-render';
import {
    CanvasPopupService,
    ComponentManager,
    ICanvasPopupService,
    IconManager,
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    KeyCode,
    PlatformService,
    RediContext,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteSearchKeyCommand } from '../../commands/commands/doc-quick-insert.command';
import { CloseQuickInsertPopupOperation } from '../../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../../services/doc-quick-insert-popup.service';
import { QuickInsertPlaceholder } from '../QuickInsertPlaceholder';
import { QuickInsertPopup } from '../QuickInsertPopup';

const testUnivers: Univer[] = [];
beforeAll(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('jest', vi);
    createRequire(import.meta.url)('jest-canvas-mock');
});
afterAll(() => vi.unstubAllGlobals());

const TEST_DOC_UNIT_ID = 'doc-quick-insert-test';

function createQuickInsertPopupTestBed(options?: {
    dataStream?: string;
    inputOffset?: { start: number; end: number };
}) {
    const univer = new Univer();
    testUnivers.push(univer);
    const injector = univer.__getInjector();
    let cutContentParams: unknown;
    let selectedMenu: unknown;

    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([ComponentManager, { useClass: ComponentManager }]);
    injector.add([IconManager, { useClass: IconManager }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocCanvasPopManagerService]);
    injector.add([DocQuickInsertPopupService]);
    const dataStream = options?.dataStream ?? '/ta\r\n';
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: TEST_DOC_UNIT_ID,
        body: {
            dataStream,
            paragraphs: [{ startIndex: dataStream.length - 2, paragraphId: 'popup-paragraph' }],
            sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'body' }],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { width: 300, height: 400 },
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
        },
    });
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId());
    if (!(render instanceof RenderUnit)) {
        throw new TypeError('Expected a render unit');
    }
    render.deactivate();
    render.engine.resizeBySize(300, 400);
    render.addRenderDependencies([[DocSkeletonManagerService], [DocLayoutInteractionService]]);
    const documents = new Documents(TEST_DOC_UNIT_ID, render.with(DocSkeletonManagerService).getSkeleton());
    render.mainComponent = documents;
    render.scene.addObject(documents);
    render.addRenderDependencies([[DocEventManagerService]]);
    injector.get(DocSelectionManagerService).replaceDocRanges([{
        startOffset: dataStream.length - 2,
        endOffset: dataStream.length - 2,
        collapsed: true,
        segmentId: '',
    }]);

    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.ZH_CN]: {
            quick: {
                insert: {
                    group: 'Insert',
                    table: 'Table',
                    image: 'Image',
                },
            },
            'docs-quick-insert-ui': {
                placeholder: 'No result',
            },
        },
    });

    localeService.setLocale(LocaleType.ZH_CN);
    const componentManager = injector.get(ComponentManager);
    componentManager.register(QuickInsertPlaceholder.componentKey, QuickInsertPlaceholder);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(CloseQuickInsertPopupOperation);
    commandService.registerCommand(DeleteSearchKeyCommand);
    commandService.registerCommand(CutContentCommand);
    commandService.registerCommand(RichTextEditingMutation);
    commandService.onCommandExecuted((command) => {
        if (command.id === CutContentCommand.id) {
            cutContentParams = command.params;
        }
    });

    const menus$ = new BehaviorSubject<DocPopupMenu[]>([
        {
            id: 'insert-group',
            title: 'quick.insert.group',
            children: [
                {
                    id: 'insert-table',
                    title: 'quick.insert.table',
                    keywords: ['table', 'grid'],
                },
                {
                    id: 'insert-image',
                    title: 'quick.insert.image',
                    keywords: ['image', 'picture'],
                },
            ],
        },
    ]);
    const popupService = injector.get(DocQuickInsertPopupService);
    popupService.onMenuSelected((menu) => {
        selectedMenu = menu;
    });
    popupService.showPopup({
        popup: {
            keyword: '/',
            menus$,
        },
        index: 0,
        unitId: TEST_DOC_UNIT_ID,
    });
    popupService.setInputOffset(options?.inputOffset ?? { start: 0, end: 3 });

    return {
        getCutContentParams: () => cutContentParams,
        getSelectedMenu: () => selectedMenu,
        injector,
        popupService,
        popupManagerService: injector.get(ICanvasPopupService),
        model,
    };
}

describe('QuickInsertPopup', () => {
    let container: HTMLDivElement;
    let root: Root;
    let scrollIntoViewDescriptor: PropertyDescriptor | undefined;
    let requestIdleCallbackDescriptor: PropertyDescriptor | undefined;
    let cancelIdleCallbackDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
        requestIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestIdleCallback');
        cancelIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'cancelIdleCallback');
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value: () => {},
        });
        Object.defineProperty(globalThis, 'requestIdleCallback', {
            configurable: true,
            value: (callback: IdleRequestCallback) => {
                callback({ didTimeout: false, timeRemaining: () => 0 });
                return 1;
            },
        });
        Object.defineProperty(globalThis, 'cancelIdleCallback', {
            configurable: true,
            value: () => {},
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        testUnivers.splice(0).forEach((univer) => univer.dispose());
        if (scrollIntoViewDescriptor) {
            Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
        } else {
            delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
        }

        if (requestIdleCallbackDescriptor) {
            Object.defineProperty(globalThis, 'requestIdleCallback', requestIdleCallbackDescriptor);
        } else {
            delete (globalThis as { requestIdleCallback?: unknown }).requestIdleCallback;
        }

        if (cancelIdleCallbackDescriptor) {
            Object.defineProperty(globalThis, 'cancelIdleCallback', cancelIdleCallbackDescriptor);
        } else {
            delete (globalThis as { cancelIdleCallback?: unknown }).cancelIdleCallback;
        }
    });

    it('filters the popup menu by the typed keyword and closes the popup after selecting a business menu item', async () => {
        const { getCutContentParams, getSelectedMenu, injector, model, popupManagerService, popupService } = createQuickInsertPopupTestBed();

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <QuickInsertPopup />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Table');
        expect(container.textContent).not.toContain('Image');

        const tableMenuItem = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]'))
            .find((node) => node.textContent === 'Table');

        expect(tableMenuItem).toBeDefined();

        await act(async () => {
            tableMenuItem!.click();
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(getSelectedMenu()).toEqual({
            id: 'insert-table',
            title: 'Table',
            keywords: ['table', 'grid', 'table'],
        });
        expect(getCutContentParams()).toEqual(expect.objectContaining({
            selections: [expect.objectContaining({ startOffset: 0, endOffset: 3 })],
        }));
        expect(popupService.editPopup).toBeNull();
        expect(popupManagerService.popups).toHaveLength(0);
        expect(model.getBody()?.dataStream).toBe('\r\n');
    });

    it('uses popup keyboard commands to move focus and select the focused business menu item', async () => {
        const { getCutContentParams, getSelectedMenu, injector, popupService } = createQuickInsertPopupTestBed({
            dataStream: '/\r\n',
            inputOffset: { start: 0, end: 1 },
        });
        const commandService = injector.get(ICommandService);
        const shortcutService = injector.get(IShortcutService);

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <QuickInsertPopup />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const moveDownShortcut = shortcutService.getAllShortcuts().find((shortcut) => shortcut.binding === KeyCode.ARROW_DOWN);
        const enterShortcut = shortcutService.getAllShortcuts().find((shortcut) => shortcut.binding === KeyCode.ENTER);

        expect(moveDownShortcut).toBeDefined();
        expect(enterShortcut).toBeDefined();

        await act(async () => {
            await commandService.executeCommand(moveDownShortcut!.id, moveDownShortcut!.staticParameters);
            await Promise.resolve();
        });

        await act(async () => {
            await commandService.executeCommand(enterShortcut!.id);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(getSelectedMenu()).toEqual({
            id: 'insert-image',
            title: 'Image',
            keywords: ['image', 'picture', 'image'],
        });
        expect(getCutContentParams()).toEqual(expect.objectContaining({
            selections: [expect.objectContaining({ startOffset: 0, endOffset: 1 })],
        }));
        expect(popupService.editPopup).toBeNull();
    });

    it('temporarily disables document cursor shortcuts while the popup owns keyboard navigation', async () => {
        const { injector } = createQuickInsertPopupTestBed({
            dataStream: '/\r\n',
            inputOffset: { start: 0, end: 1 },
        });
        const shortcutService = injector.get(IShortcutService);
        const documentArrowDownShortcut = {
            id: 'doc.operation.move-cursor-down',
            binding: KeyCode.ARROW_DOWN,
            preconditions: () => true,
        };

        shortcutService.registerShortcut(documentArrowDownShortcut);

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <QuickInsertPopup />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(documentArrowDownShortcut.preconditions()).toBe(false);

        await act(async () => {
            root.render(<RediContext.Provider value={{ injector }} />);
            await Promise.resolve();
        });

        expect(documentArrowDownShortcut.preconditions()).toBe(true);
    });

    it('keeps the typed trigger intact when enter is pressed with no matching menu', async () => {
        const { getCutContentParams, getSelectedMenu, injector, popupService } = createQuickInsertPopupTestBed({
            dataStream: '/unknown\r\n',
            inputOffset: { start: 0, end: 8 },
        });
        const commandService = injector.get(ICommandService);
        const shortcutService = injector.get(IShortcutService);

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <QuickInsertPopup />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.textContent).toContain('No result');
        expect(container.textContent).not.toContain('Table');

        const enterShortcut = shortcutService.getAllShortcuts().find((shortcut) => shortcut.binding === KeyCode.ENTER);
        expect(enterShortcut).toBeDefined();

        await act(async () => {
            await commandService.executeCommand(enterShortcut!.id);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(getSelectedMenu()).toBeUndefined();
        expect(getCutContentParams()).toBeUndefined();
        expect(popupService.editPopup).not.toBeNull();
    });
});
