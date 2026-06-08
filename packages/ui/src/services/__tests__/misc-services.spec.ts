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

import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { supportClipboardAPI } from '../clipboard/clipboard-utils';
import { ContextMenuHostService } from '../contextmenu/contextmenu-host.service';
import { ContextMenuService } from '../contextmenu/contextmenu.service';
import { CanvasFloatDomService } from '../dom/canvas-dom-layer.service';
import { isMenuButtonSelectorItem, isMenuSelectorItem, MenuItemType } from '../menu/menu';
import { CanvasPopupService } from '../popup/canvas-popup.service';
import { DesktopSidebarService } from '../sidebar/desktop-sidebar.service';
import { ThemeSwitcherService } from '../theme-switcher/theme-switcher.service';

describe('clipboard capability detection', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should report clipboard as unsupported when navigator.clipboard is missing', () => {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
        expect(supportClipboardAPI()).toBe(false);
    });

    it('should report clipboard as supported when navigator.clipboard.readText is available', () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { readText: vi.fn() },
        });
        expect(supportClipboardAPI()).toBe(true);
    });
});

describe('menu item type guards', () => {
    it('should recognize selector and subitems as menu selector items', () => {
        expect(isMenuSelectorItem({ type: MenuItemType.SELECTOR } as any)).toBe(true);
        expect(isMenuSelectorItem({ type: MenuItemType.SUBITEMS } as any)).toBe(true);
    });

    it('should not recognize button or button-selector as menu selector items', () => {
        expect(isMenuSelectorItem({ type: MenuItemType.BUTTON } as any)).toBe(false);
        expect(isMenuSelectorItem({ type: MenuItemType.BUTTON_SELECTOR } as any)).toBe(false);
    });

    it('should recognize button-selector as menu button-selector item', () => {
        expect(isMenuButtonSelectorItem({ type: MenuItemType.BUTTON_SELECTOR } as any)).toBe(true);
    });

    it('should not recognize plain button as menu button-selector item', () => {
        expect(isMenuButtonSelectorItem({ type: MenuItemType.BUTTON } as any)).toBe(false);
    });
});

describe('context menu service', () => {
    it('should forward context menu events to the registered handler', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        service.registerContextMenuHandler(handler);

        const event = { stopPropagation: vi.fn() } as any;
        service.triggerContextMenu(event, 'main');

        expect(service.visible).toBe(true);
        expect(handler.handleContextMenu).toHaveBeenCalledWith(event, 'main');
    });

    it('should suppress context menu events while disabled', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        service.registerContextMenuHandler(handler);
        service.disable();

        const event = { stopPropagation: vi.fn() } as any;
        service.triggerContextMenu(event, 'main');

        expect(service.disabled).toBe(true);
        expect(handler.handleContextMenu).not.toHaveBeenCalled();
    });

    it('should resume forwarding after re-enabling', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        service.registerContextMenuHandler(handler);
        service.disable();
        service.enable();

        const event = { stopPropagation: vi.fn() } as any;
        service.triggerContextMenu(event, 'main');

        expect(handler.handleContextMenu).toHaveBeenCalledTimes(1);
    });

    it('should hide the context menu through the handler', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        service.registerContextMenuHandler(handler);
        service.hideContextMenu();
        expect(handler.hideContextMenu).toHaveBeenCalledTimes(1);
    });

    it('should throw when registering a handler twice', () => {
        const service = new ContextMenuService();
        const handler = { visible: true, handleContextMenu: vi.fn(), hideContextMenu: vi.fn() };

        service.registerContextMenuHandler(handler);
        expect(() => service.registerContextMenuHandler(handler)).toThrow();
    });

    it('should clean up visibility when the handler is disposed', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        const disposable = service.registerContextMenuHandler(handler);
        service.triggerContextMenu({ stopPropagation: vi.fn() } as any, 'main');
        expect(service.visible).toBe(true);

        disposable.dispose();
        expect(service.visible).toBe(false);
    });
});

describe('context menu host service', () => {
    it('should activate a registered menu and track it as the active menu', () => {
        const service = new ContextMenuHostService();
        const hide = vi.fn();

        service.registerMenu('menu-a', hide);
        service.activateMenu('menu-a');

        expect(service.activeMenuId).toBe('menu-a');
    });

    it('should hide the previous menu when activating a different one', () => {
        const service = new ContextMenuHostService();
        const hideA = vi.fn();
        const hideB = vi.fn();

        service.registerMenu('menu-a', hideA);
        service.registerMenu('menu-b', hideB);

        service.activateMenu('menu-a');
        service.activateMenu('menu-b');

        expect(hideA).toHaveBeenCalledTimes(1);
        expect(service.activeMenuId).toBe('menu-b');
    });

    it('should hide the active menu when requested', () => {
        const service = new ContextMenuHostService();
        const hide = vi.fn();

        service.registerMenu('menu-a', hide);
        service.activateMenu('menu-a');
        service.hideActiveMenu();

        expect(hide).toHaveBeenCalledTimes(1);
        expect(service.activeMenuId).toBeNull();
    });

    it('should skip hiding when the active menu matches the excepted id', () => {
        const service = new ContextMenuHostService();
        const hide = vi.fn();

        service.registerMenu('menu-a', hide);
        service.activateMenu('menu-a');
        service.hideActiveMenu('menu-a');

        expect(hide).not.toHaveBeenCalled();
        expect(service.activeMenuId).toBe('menu-a');
    });

    it('should clear active state when a menu is deactivated', () => {
        const service = new ContextMenuHostService();

        service.registerMenu('menu-a', vi.fn());
        service.activateMenu('menu-a');
        service.deactivateMenu('menu-a');

        expect(service.activeMenuId).toBeNull();
    });

    it('should allow re-activating a menu after it was deactivated', () => {
        const service = new ContextMenuHostService();

        service.registerMenu('menu-a', vi.fn());
        service.activateMenu('menu-a');
        service.deactivateMenu('menu-a');
        service.activateMenu('menu-a');

        expect(service.activeMenuId).toBe('menu-a');
    });
});

describe('canvas float DOM service', () => {
    function createFloatDom(id: string): any {
        return {
            id,
            componentKey: 'test-component',
            unitId: 'unit-1',
            onPointerMove: vi.fn(),
            onPointerDown: vi.fn(),
            onPointerUp: vi.fn(),
            onWheel: vi.fn(),
            position$: new BehaviorSubject({
                left: 0,
                top: 0,
                rotate: 0,
                width: 100,
                height: 100,
                absolute: { left: true, top: true },
            }),
        };
    }

    it('should reflect newly added float DOM in the domLayers list', () => {
        const service = new CanvasFloatDomService();
        service.addFloatDom(createFloatDom('dom-1'));

        expect(service.domLayers).toHaveLength(1);
        expect(service.domLayers[0][0]).toBe('dom-1');
    });

    it('should update an existing float DOM by id', () => {
        const service = new CanvasFloatDomService();
        service.addFloatDom(createFloatDom('dom-1'));
        service.updateFloatDom('dom-1', { componentKey: 'updated-component' } as any);

        expect(service.domLayers[0][1].componentKey).toBe('updated-component');
    });

    it('should silently ignore updates to non-existent float DOM ids', () => {
        const service = new CanvasFloatDomService();
        service.addFloatDom(createFloatDom('dom-1'));

        expect(() => service.updateFloatDom('missing', { componentKey: 'x' } as any)).not.toThrow();
        expect(service.domLayers).toHaveLength(1);
    });

    it('should remove a float DOM by id', () => {
        const service = new CanvasFloatDomService();
        service.addFloatDom(createFloatDom('dom-1'));
        service.addFloatDom(createFloatDom('dom-2'));
        service.removeFloatDom('dom-1');

        expect(service.domLayers).toHaveLength(1);
        expect(service.domLayers[0][0]).toBe('dom-2');
    });

    it('should clear all float DOMs when removeAll is called', () => {
        const service = new CanvasFloatDomService();
        service.addFloatDom(createFloatDom('dom-1'));
        service.addFloatDom(createFloatDom('dom-2'));
        service.removeAll();

        expect(service.domLayers).toHaveLength(0);
    });

    it('should emit domLayers changes through the observable', () => {
        const service = new CanvasFloatDomService();
        const emissions: any[] = [];
        service.domLayers$.subscribe((layers) => emissions.push(layers.length));

        service.addFloatDom(createFloatDom('dom-1'));
        service.addFloatDom(createFloatDom('dom-2'));
        service.removeFloatDom('dom-1');

        expect(emissions.at(-1)).toBe(1);
    });
});

describe('canvas popup service', () => {
    function createPopup(overrides: Partial<any> = {}): any {
        return {
            componentKey: 'test-popup',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            canvasElement: document.createElement('canvas'),
            anchorRect$: new BehaviorSubject({}),
            ...overrides,
        };
    }

    it('should assign a unique id when adding a popup', () => {
        const service = new CanvasPopupService();
        const id = service.addPopup(createPopup());

        expect(id).toBeTruthy();
        expect(service.popups).toHaveLength(1);
    });

    it('should track the active popup id when onActiveChange is triggered', () => {
        const service = new CanvasPopupService();
        const id = service.addPopup(createPopup());

        const popup = service.popups[0][1];
        popup.onActiveChange?.(true);
        expect(service.activePopupId).toBe(id);

        popup.onActiveChange?.(false);
        expect(service.activePopupId).toBeNull();
    });

    it('should remove a popup by id and clear the activePopupId if it was active', () => {
        const service = new CanvasPopupService();
        const id = service.addPopup(createPopup());

        service.popups[0][1].onActiveChange?.(true);
        expect(service.activePopupId).toBe(id);

        service.removePopup(id);
        expect(service.popups).toHaveLength(0);
    });

    it('should ignore removal of non-existent popup ids', () => {
        const service = new CanvasPopupService();
        service.addPopup(createPopup());

        expect(() => service.removePopup('non-existent')).not.toThrow();
        expect(service.popups).toHaveLength(1);
    });

    it('should remove all popups and reset state', () => {
        const service = new CanvasPopupService();
        service.addPopup(createPopup());
        service.addPopup(createPopup());
        service.removeAll();

        expect(service.popups).toHaveLength(0);
        expect(service.activePopupId).toBeNull();
    });

    it('should clear all popups on dispose', () => {
        const service = new CanvasPopupService();
        service.addPopup(createPopup());
        service.dispose();

        expect(service.popups).toHaveLength(0);
    });
});

describe('sidebar service', () => {
    it('should become visible after opening a sidebar panel', () => {
        const service = new DesktopSidebarService();
        service.open({ id: 'panel-1' });

        expect(service.visible).toBe(true);
        expect(service.options.id).toBe('panel-1');
    });

    it('should ignore close requests with a mismatched panel id', () => {
        const service = new DesktopSidebarService();
        service.open({ id: 'panel-1' });
        service.close('panel-2');

        expect(service.visible).toBe(true);
    });

    it('should hide the sidebar and invoke onClose when the correct id is closed', () => {
        const service = new DesktopSidebarService();
        const onClose = vi.fn();
        service.open({ id: 'panel-1', onClose });
        service.close('panel-1');

        expect(service.visible).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should invoke onClose when the open disposable is disposed', () => {
        const service = new DesktopSidebarService();
        const onClose = vi.fn();
        const disposable = service.open({ id: 'panel-1', onClose });

        disposable.dispose();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(service.visible).toBe(false);
    });

    it('should replace the current panel when opening a different one', () => {
        const service = new DesktopSidebarService();
        service.open({ id: 'panel-1' });
        service.open({ id: 'panel-2' });

        expect(service.options.id).toBe('panel-2');
        expect(service.visible).toBe(true);
    });

    it('should allow setting and retrieving the sidebar container element', () => {
        const service = new DesktopSidebarService();
        const container = document.createElement('div');

        service.setContainer(container);
        expect(service.getContainer()).toBe(container);
    });

    it('should notify subscribers when the sidebar state changes', () => {
        const service = new DesktopSidebarService();
        const states: any[] = [];
        service.sidebarOptions$.subscribe((opts) => states.push(opts));

        service.open({ id: 'panel-1' });
        service.close('panel-1');

        expect(states.length).toBeGreaterThanOrEqual(2);
    });
});

describe('theme switcher service', () => {
    afterEach(() => {
        const existing = document.getElementById('univer-theme-css-variables');
        if (existing) {
            existing.remove();
        }
    });

    it('should inject theme CSS variables into the document head', () => {
        const service = new ThemeSwitcherService();
        service.injectThemeToHead({
            color: { primary: '#ffffff' },
            spacing: 8,
        } as any);

        const style = document.getElementById('univer-theme-css-variables');
        expect(style).toBeTruthy();
        expect(style?.textContent).toContain('--univer-color-primary: #ffffff');
        expect(style?.textContent).toContain('--univer-spacing: 8');
    });

    it('should replace the existing style element instead of creating duplicates', () => {
        const service = new ThemeSwitcherService();
        service.injectThemeToHead({ color: { primary: '#fff' } } as any);
        service.injectThemeToHead({ color: { primary: '#000' } } as any);

        const styles = document.querySelectorAll('#univer-theme-css-variables');
        expect(styles.length).toBe(1);
        expect(styles[0]?.textContent).toContain('#000');
    });
});
