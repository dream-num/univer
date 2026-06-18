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

import type { Root } from 'react-dom/client';
import type { DocPopupMenu } from '../../services/doc-quick-insert-popup.service';
import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { CutContentCommand, DocCanvasPopManagerService, DocEventManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    ComponentManager,
    IconManager,
    IPlatformService,
    IShortcutService,
    KeyCode,
    PlatformService,
    RediContext,
    ShortcutService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DeleteSearchKeyCommand } from '../../commands/commands/doc-quick-insert.command';
import { CloseQuickInsertPopupOperation } from '../../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../../services/doc-quick-insert-popup.service';
import { QuickInsertPlaceholder } from '../QuickInsertPlaceholder';
import { QuickInsertPopup } from '../QuickInsertPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const TEST_DOC_UNIT_ID = 'doc-quick-insert-test';

class TestUniverInstanceService {
    dataStream = '/ta\r\n';

    private readonly _doc = {
        getUnitId: () => TEST_DOC_UNIT_ID,
        getBody: () => ({
            dataStream: this.dataStream,
            paragraphs: [{ startIndex: 3, paragraphId: 'para_quick_insert_popup_test' }],
        }),
    };

    getCurrentUnitOfType() {
        return this._doc;
    }

    getUnit() {
        return this._doc;
    }
}

class TestDocCanvasPopManagerService {
    readonly attachedPopups: Array<{
        componentKey?: string;
        disposed: boolean;
    }> = [];

    attachPopupToRect(_rect: unknown, popup: { componentKey?: string }) {
        const entry = {
            componentKey: popup.componentKey,
            disposed: false,
        };

        this.attachedPopups.push(entry);

        return {
            dispose: () => {
                entry.disposed = true;
            },
        };
    }
}

class TestRenderManagerService {
    getRenderById() {
        return {
            with(token: unknown) {
                if (token === DocEventManagerService) {
                    return {
                        findParagraphBoundByIndex: () => ({
                            firstLine: {
                                left: 0,
                                top: 0,
                                right: 120,
                                bottom: 24,
                            },
                        }),
                    };
                }

                return undefined;
            },
            mainComponent: {
                getOffsetConfig: () => ({ docsLeft: 0, docsTop: 0 }),
            },
        };
    }
}

class TestDocSelectionManagerService {
    getActiveTextRange() {
        return null;
    }
}

function createQuickInsertPopupTestBed(options?: {
    dataStream?: string;
    inputOffset?: { start: number; end: number };
}) {
    const injector = new Injector();
    let cutContentParams: unknown;
    let selectedMenu: unknown;

    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([ComponentManager, { useClass: ComponentManager }]);
    injector.add([IconManager, { useClass: IconManager }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([DocCanvasPopManagerService, { useClass: TestDocCanvasPopManagerService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([DocSelectionManagerService, { useClass: TestDocSelectionManagerService as never }]);
    injector.add([DocQuickInsertPopupService, { useClass: DocQuickInsertPopupService }]);

    const univerInstanceService = injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService;
    univerInstanceService.dataStream = options?.dataStream ?? '/ta\r\n';

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

    const componentManager = injector.get(ComponentManager);
    componentManager.register(QuickInsertPlaceholder.componentKey, QuickInsertPlaceholder);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(CloseQuickInsertPopupOperation);
    commandService.registerCommand(DeleteSearchKeyCommand);
    commandService.registerCommand({
        id: CutContentCommand.id,
        type: CommandType.COMMAND,
        handler: (_accessor, params) => {
            cutContentParams = params;
            return true;
        },
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
        popupManagerService: injector.get(DocCanvasPopManagerService) as unknown as TestDocCanvasPopManagerService,
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
        const { getCutContentParams, getSelectedMenu, injector, popupManagerService, popupService } = createQuickInsertPopupTestBed();

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

        const tableMenuItem = Array.from(container.querySelectorAll('[role="button"]'))
            .find((node) => node.textContent === 'Table') as HTMLElement | undefined;

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
        expect(popupManagerService.attachedPopups.find((popup) => popup.componentKey === QuickInsertPopup.componentKey)?.disposed).toBe(true);
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
