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

import {
    CommandType,
    ICommandService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LogLevel,
    Univer,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { MessageType } from '@univerjs/design';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    BuiltInUIPart,
    ComponentManager,
    CopyCommand,
    DesktopDialogService,
    DesktopMessageService,
    DesktopSidebarService,
    FontService,
    IDialogService,
    IFontService,
    IMenuManagerService,
    IMessageService,
    IPlatformService,
    IShortcutService,
    ISidebarService,
    IUIPartsService,
    KeyCode,
    MenuManagerService,
    PasteCommand,
    PlatformService,
    ShortcutService,
    UIPartsService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FShortcut } from '../f-shortcut';
import '@univerjs/ui/facade';

class FakeShortcutService {
    static dispatched: KeyboardEvent[] = [];

    forceDisable() {
        return { dispose: () => {} };
    }

    dispatch(event: KeyboardEvent) {
        FakeShortcutService.dispatched.push(event);
        return { id: 'fake.shortcut', binding: event.keyCode };
    }
}

class FakeRenderManagerService {
    static renderUnit: unknown;

    getRenderById(_unitId: string) {
        return FakeRenderManagerService.renderUnit;
    }
}

class FakeUniverInstanceService {
    static workbook: unknown;

    getCurrentUnitOfType() {
        return FakeUniverInstanceService.workbook;
    }
}

describe('ui facade', () => {
    let univer: Univer;
    let univerAPI: FUniver;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.add([ComponentManager]);
        injector.add([IDialogService, { useClass: DesktopDialogService }]);
        injector.add([IFontService, { useClass: FontService }]);
        injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IShortcutService, { useClass: ShortcutService }]);
        injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);

        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds custom menus and executes their user action through command service', async () => {
        const injector = univer.__getInjector();
        const menuManagerService = injector.get(IMenuManagerService);
        const commandService = injector.get(ICommandService);
        const actionCalls: string[] = [];

        univerAPI.createMenu({
            id: 'custom-menu',
            title: 'Custom Menu',
            action: () => actionCalls.push('clicked'),
            order: 1,
        }).appendTo('contextMenu.others');

        const menuItem = menuManagerService.getFlatMenuByPositionKey('contextMenu').find((item) => item.item?.id === 'custom-menu')?.item;

        expect(menuItem?.title).toBe('Custom Menu');
        expect(menuItem?.commandId).toBeDefined();
        await commandService.executeCommand(menuItem!.commandId!);
        expect(actionCalls).toEqual(['clicked']);
    });

    it('adds grouped submenu entries into menu positions', () => {
        const menuManagerService = univer.__getInjector().get(IMenuManagerService);

        const first = univerAPI.createMenu({ id: 'first-action', title: 'First', action: 'first.command' });
        const second = univerAPI.createMenu({ id: 'second-action', title: 'Second', action: 'second.command' });
        univerAPI.createSubmenu({ id: 'custom-submenu', title: 'Actions' })
            .addSubmenu(first)
            .addSeparator()
            .addSubmenu(second)
            .appendTo('contextMenu.others');

        const menuKeys = menuManagerService.getFlatMenuByPositionKey('contextMenu').map((item) => item.key);

        expect(menuKeys).toContain('custom-submenu');
        expect(menuKeys).toContain('first-action');
        expect(menuKeys).toContain('second-action');
    });

    it('registers UI parts, toggles visibility, and exposes UI enums from the facade', () => {
        const component = () => null;
        const disposable = univerAPI.registerUIPart(BuiltInUIPart.CUSTOM_HEADER, component);
        const uiPartsService = univer.__getInjector().get(IUIPartsService);

        expect(univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER).toBe(BuiltInUIPart.CUSTOM_HEADER);
        expect(univerAPI.setUIVisible(BuiltInUIPart.CUSTOM_HEADER, false)).toBe(univerAPI);
        expect(univerAPI.isUIVisible(BuiltInUIPart.CUSTOM_HEADER)).toBe(false);
        expect(uiPartsService.getComponents(BuiltInUIPart.CUSTOM_HEADER).size).toBe(1);

        disposable.dispose();
        expect(uiPartsService.getComponents(BuiltInUIPart.CUSTOM_HEADER).size).toBe(0);
    });

    it('dispatches shortcut events unless the shortcut facade is disabled', () => {
        const shortcutService = univer.__getInjector().get(IShortcutService);
        const shortcut = univerAPI.getShortcut();
        shortcutService.registerShortcut({
            id: 'custom.shortcut',
            binding: KeyCode.B,
        });

        const event = new KeyboardEvent('keydown', { key: 'b', keyCode: KeyCode.B });

        expect(shortcut.disableShortcut().dispatchShortcutEvent(event)).toBeUndefined();
        expect(shortcut.enableShortcut().dispatchShortcutEvent(event)?.id).toBe('custom.shortcut');
    });

    it('fires clipboard hooks around copy commands', async () => {
        const commandService = univer.__getInjector().get(ICommandService);
        commandService.registerCommand({
            id: CopyCommand.id,
            type: CommandType.COMMAND,
            handler: () => true,
        });
        commandService.registerCommand({
            id: PasteCommand.id,
            type: CommandType.COMMAND,
            handler: () => true,
        });

        const events: string[] = [];
        const hooks = univerAPI.getHooks();
        const beforeDisposable = hooks.onBeforeCopy(() => events.push('before-copy'));
        const afterDisposable = hooks.onCopy(() => events.push('copy'));
        const beforePasteDisposable = hooks.onBeforePaste(() => events.push('before-paste'));
        const afterPasteDisposable = hooks.onPaste(() => events.push('paste'));

        await expect(univerAPI.copy()).resolves.toBe(true);
        await expect(univerAPI.paste()).resolves.toBe(true);

        expect(events).toEqual(['before-copy', 'copy', 'before-paste', 'paste']);
        beforeDisposable.dispose();
        afterDisposable.dispose();
        beforePasteDisposable.dispose();
        afterPasteDisposable.dispose();
    });

    it('opens and disposes UI surfaces through facade services', () => {
        const injector = univer.__getInjector();
        const sidebarService = injector.get(ISidebarService);
        const dialogService = injector.get(IDialogService);
        const dialogs: string[][] = [];
        const subscription = dialogService.getDialogs$().subscribe((items) => dialogs.push(items.map((item) => item.id)));

        const sidebarDisposable = univerAPI.openSidebar({ id: 'inspector', width: 320 });
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.id).toBe('inspector');
        sidebarDisposable.dispose();
        expect(sidebarService.visible).toBe(false);

        const dialogDisposable = univerAPI.openDialog({ id: 'confirm-dialog', title: { label: 'Confirm' } });
        expect(dialogs.at(-1)).toEqual(['confirm-dialog']);
        dialogDisposable.dispose();
        expect(dialogs.at(-1)).toEqual([]);

        expect(univerAPI.showMessage({ content: 'Saved', type: MessageType.Success, id: 'saved-message' })).toBe(univerAPI);

        subscription.unsubscribe();
    });

    it('registers components and appends custom fonts through facade APIs', () => {
        const injector = univer.__getInjector();
        const componentManager = injector.get(ComponentManager);
        const fontService = injector.get(IFontService);
        const component = () => null;

        const disposable = univerAPI.registerComponent('custom-component', component);
        univerAPI.addFonts([{ value: 'CustomSans', label: 'Custom Sans', category: 'sans-serif' }]);

        expect(univerAPI.getURL().href).toBe(window.location.href);
        expect(univerAPI.getComponentManager()).toBe(componentManager);
        expect(componentManager.get('custom-component')).toBe(component);
        expect(fontService.getFontByValue('CustomSans')).toMatchObject({ label: 'Custom Sans' });

        disposable.dispose();
        expect(componentManager.get('custom-component')).toBeUndefined();
    });

    it('triggers shortcuts through the active workbook render canvas', () => {
        const injector = new Injector();
        injector.add([IShortcutService, { useClass: FakeShortcutService as never }]);
        injector.add([IRenderManagerService, { useClass: FakeRenderManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: FakeUniverInstanceService as never }]);
        const shortcut = injector.createInstance(FShortcut);
        const event = new KeyboardEvent('keydown', { key: 'k', keyCode: KeyCode.K });
        const canvasEvents: KeyboardEvent[] = [];

        FakeShortcutService.dispatched = [];
        FakeUniverInstanceService.workbook = undefined;
        FakeRenderManagerService.renderUnit = undefined;
        expect(shortcut.triggerShortcut(event)).toBeUndefined();

        FakeUniverInstanceService.workbook = { getUnitId: () => 'sheet-1' };
        expect(shortcut.triggerShortcut(event)).toBeUndefined();

        FakeRenderManagerService.renderUnit = {
            engine: {
                getCanvasElement: () => ({
                    dispatchEvent: (dispatchedEvent: KeyboardEvent) => canvasEvents.push(dispatchedEvent),
                }),
            },
        };

        expect(shortcut.triggerShortcut(event)?.id).toBe('fake.shortcut');
        expect(canvasEvents).toEqual([event]);
        expect(FakeShortcutService.dispatched).toEqual([event]);
    });
});
