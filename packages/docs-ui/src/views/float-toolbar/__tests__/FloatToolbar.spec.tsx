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

import type { IDisposable } from '@univerjs/core';
import type { IMenuSchema } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    CommandService,
    ConfigService,
    ICommandService,
    IConfigService,
    ILogService,
    Injector,
    LocaleService,
    toDisposable,
} from '@univerjs/core';
import {
    ComponentManager,
    IconManager,
    ILayoutService,
    IMenuManagerService,
    IShortcutService,
    MenuItemType,
    MenuManagerPosition,
    RediContext,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { SetInlineFormatBoldCommand } from '../../../commands/commands/inline-format.command';
import { FLOAT_TEXT_STYLE_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION } from '../../../menu/menu';
import { FloatToolbar, resolveFloatToolbarMenus } from '../FloatToolbar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const HYPERLINK_MENU_ID = 'doc.operation.show-hyper-link-edit-popup';
const COMMENT_MENU_ID = 'docs.operation.start-add-comment';

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();
    private _floatToolbarMenus: IMenuSchema[] = [];
    private _ribbonMenus: IMenuSchema[] = [];

    setMenus(floatToolbarMenus: IMenuSchema[], ribbonMenus: IMenuSchema[] = []): void {
        this._floatToolbarMenus = floatToolbarMenus;
        this._ribbonMenus = ribbonMenus;
        this.menuChanged$.next();
    }

    mergeMenu(): void {}
    appendRootMenu(): void {}

    getMenuByPositionKey(position: string): IMenuSchema[] {
        return position === FLOAT_TOOLBAR_MENU_POSITION ? this._floatToolbarMenus : [];
    }

    getFlatMenuByPositionKey(position: string): IMenuSchema[] {
        if (position === FLOAT_TOOLBAR_MENU_POSITION) {
            return this._floatToolbarMenus;
        }
        if (position === MenuManagerPosition.RIBBON) {
            return this._ribbonMenus;
        }
        return [];
    }
}

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class TestLayoutService {
    readonly rootContainerElement = document.body;
    private _focused = false;

    get isFocused() {
        return this._focused;
    }

    focus(): void {
        this._focused = true;
    }

    registerFocusHandler(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerRootContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContentElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    getContentElement(): HTMLElement {
        return document.body;
    }

    checkElementInCurrentContainers(): boolean {
        return true;
    }

    checkContentIsFocused(): boolean {
        return this._focused;
    }
}

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();

    forceEscape(): IDisposable {
        return toDisposable(() => undefined);
    }

    forceDisable(): IDisposable {
        return toDisposable(() => undefined);
    }

    dispatch(): undefined {
        return undefined;
    }

    registerShortcut(): IDisposable {
        return toDisposable(() => undefined);
    }

    getShortcutDisplay(): string | null {
        return null;
    }

    getShortcutDisplayOfCommand(): string | null {
        return null;
    }

    getAllShortcuts() {
        return [];
    }
}

class TestLogService {
    warn(): void {}
}

function createToolbarTestBed() {
    const injector = new Injector();
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    return {
        injector,
        menuManagerService: injector.get(IMenuManagerService) as unknown as TestMenuManagerService,
    };
}

function renderToolbar(injector: Injector, avaliableMenus: string[]) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <FloatToolbar avaliableMenus={avaliableMenus} />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function createMenuItem(key: string, title = key): IMenuSchema {
    return {
        key,
        order: 0,
        item: {
            id: key,
            title,
            type: MenuItemType.BUTTON,
        },
    };
}

describe('FloatToolbar', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('keeps whitelisted toolbar menus ordered and separates direct extension menus', () => {
        const textStyleItem = createMenuItem(FLOAT_TEXT_STYLE_MENU_ID);
        const boldItem = createMenuItem(SetInlineFormatBoldCommand.id);
        const hyperlinkItem = createMenuItem(HYPERLINK_MENU_ID);
        const commentItem = createMenuItem(COMMENT_MENU_ID);
        const menuManagerService = new TestMenuManagerService();
        menuManagerService.setMenus([textStyleItem, hyperlinkItem, commentItem], [boldItem]);

        const { menus, extraMenus } = resolveFloatToolbarMenus(menuManagerService as never, [
            FLOAT_TEXT_STYLE_MENU_ID,
            SetInlineFormatBoldCommand.id,
        ]);

        expect(menus.map((item) => item.key)).toEqual([
            FLOAT_TEXT_STYLE_MENU_ID,
            SetInlineFormatBoldCommand.id,
        ]);
        expect(extraMenus.map((item) => item.key)).toEqual([
            HYPERLINK_MENU_ID,
            COMMENT_MENU_ID,
        ]);
    });

    it('renders available menus and refreshes when the menu service changes', async () => {
        const testBed = createToolbarTestBed();
        const textStyleItem = createMenuItem(FLOAT_TEXT_STYLE_MENU_ID, 'Text style');
        const boldItem = createMenuItem(SetInlineFormatBoldCommand.id, 'Bold');
        const hyperlinkItem = createMenuItem(HYPERLINK_MENU_ID, 'Link');
        const commentItem = createMenuItem(COMMENT_MENU_ID, 'Comment');
        testBed.menuManagerService.setMenus([textStyleItem, hyperlinkItem], [boldItem]);

        const rendered = renderToolbar(testBed.injector, [
            FLOAT_TEXT_STYLE_MENU_ID,
            SetInlineFormatBoldCommand.id,
        ]);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('Text style');
        expect(container.textContent).toContain('Bold');
        expect(container.textContent).toContain('Link');
        expect(container.textContent).not.toContain('Comment');

        await act(async () => {
            testBed.menuManagerService.setMenus([textStyleItem, hyperlinkItem, commentItem], [boldItem]);
        });

        expect(container.textContent).toContain('Comment');
    });
});
