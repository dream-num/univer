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
import { IDialogService } from '../dialog/dialog.service';
import { CanvasFloatDomService } from '../dom/canvas-dom-layer.service';
import { IGalleryService } from '../gallery/gallery.service';
import { DesktopGlobalZoneService } from '../global-zone/desktop-global-zone.service';
import { IGlobalZoneService } from '../global-zone/global-zone.service';
import { ILocalFileService } from '../local-file/local-file.service';
import { isMenuButtonSelectorItem, isMenuSelectorItem, MenuItemType } from '../menu/menu';
import { IMessageService } from '../message/message.service';
import { INotificationService } from '../notification/notification.service';
import { CanvasPopupService } from '../popup/canvas-popup.service';
import { DesktopSidebarService } from '../sidebar/desktop-sidebar.service';
import { ILeftSidebarService, ISidebarService } from '../sidebar/sidebar.service';
import { ThemeSwitcherService } from '../theme-switcher/theme-switcher.service';
import { DesktopZenZoneService } from '../zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from '../zen-zone/zen-zone.service';

describe('simple exported identifiers and helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should expose identifier tokens', () => {
        expect(IGalleryService).toBeDefined();
        expect(IGlobalZoneService).toBeDefined();
        expect(IDialogService).toBeDefined();
        expect(ILocalFileService).toBeDefined();
        expect(IMessageService).toBeDefined();
        expect(INotificationService).toBeDefined();
        expect(ISidebarService).toBeDefined();
        expect(ILeftSidebarService).toBeDefined();
        expect(IZenZoneService).toBeDefined();
    });

    it('should detect clipboard api support', () => {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
        expect(supportClipboardAPI()).toBe(false);

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                readText: vi.fn(),
            },
        });
        expect(supportClipboardAPI()).toBe(true);
    });

    it('should detect menu selector item types', () => {
        expect(isMenuSelectorItem({ type: MenuItemType.SELECTOR } as any)).toBe(true);
        expect(isMenuSelectorItem({ type: MenuItemType.SUBITEMS } as any)).toBe(true);
        expect(isMenuSelectorItem({ type: MenuItemType.BUTTON_SELECTOR } as any)).toBe(false);

        expect(isMenuButtonSelectorItem({ type: MenuItemType.BUTTON_SELECTOR } as any)).toBe(true);
        expect(isMenuButtonSelectorItem({ type: MenuItemType.BUTTON } as any)).toBe(false);
    });
});

describe('context menu services', () => {
    it('should delegate context menu events to current handler', () => {
        const service = new ContextMenuService();
        const handler = {
            visible: true,
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
        };

        const dis = service.registerContextMenuHandler(handler);
        expect(() => service.registerContextMenuHandler(handler)).toThrow();

        const event = {
            stopPropagation: vi.fn(),
        } as any;
        service.triggerContextMenu(event, 'main');
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(handler.handleContextMenu).toHaveBeenCalledWith(event, 'main');
        expect(service.visible).toBe(true);

        service.disable();
        service.triggerContextMenu(event, 'disabled');
        expect(handler.handleContextMenu).toHaveBeenCalledTimes(1);

        service.enable();
        service.hideContextMenu();
        expect(handler.hideContextMenu).toHaveBeenCalledTimes(1);

        dis.dispose();
        expect(service.visible).toBe(false);
    });

    it('should manage active host menu', () => {
        const service = new ContextMenuHostService();
        const hideA = vi.fn();
        const hideB = vi.fn();

        const disA = service.registerMenu('a', hideA);
        const disB = service.registerMenu('b', hideB);

        service.activateMenu('a');
        expect(service.activeMenuId).toBe('a');

        service.activateMenu('b');
        expect(hideA).toHaveBeenCalledTimes(1);
        expect(service.activeMenuId).toBe('b');

        service.hideActiveMenu('b');
        expect(hideB).toHaveBeenCalledTimes(0);

        service.hideActiveMenu();
        expect(hideB).toHaveBeenCalledTimes(1);
        expect(service.activeMenuId).toBeNull();

        service.deactivateMenu('b');
        disA.dispose();
        disB.dispose();
        expect(service.activeMenuId).toBeNull();
    });
});

describe('CanvasFloatDomService', () => {
    it('should add, update, remove and clear float dom items', () => {
        const service = new CanvasFloatDomService();
        const events: any[] = [];
        service.domLayers$.subscribe((value) => events.push(value));

        service.addFloatDom({
            id: 'dom-1',
            componentKey: 'comp',
            onPointerMove: vi.fn(),
            onPointerDown: vi.fn(),
            onPointerUp: vi.fn(),
            onWheel: vi.fn(),
            unitId: 'u1',
            position$: new BehaviorSubject({
                left: 0,
                top: 0,
                rotate: 0,
                width: 10,
                height: 10,
                absolute: { left: true, top: true },
            }),
        } as any);

        expect(service.domLayers.length).toBe(1);

        service.updateFloatDom('dom-1', { componentKey: 'comp2' } as any);
        expect(service.domLayers[0][1].componentKey).toBe('comp2');

        service.updateFloatDom('not-found', { componentKey: 'x' } as any);

        service.removeFloatDom('dom-1');
        expect(service.domLayers.length).toBe(0);

        service.removeFloatDom('dom-1');
        service.removeAll();
        expect(events.length).toBeGreaterThanOrEqual(4);
    });
});

describe('CanvasPopupService', () => {
    it('should add/remove popups and track active popup id', () => {
        const service = new CanvasPopupService();

        const id = service.addPopup({
            componentKey: 'popup',
            unitId: 'u',
            subUnitId: 's',
            canvasElement: document.createElement('canvas'),
            anchorRect$: new BehaviorSubject({} as any),
        } as any);

        expect(id).toBeTruthy();
        expect(service.popups.length).toBe(1);

        const popup = service.popups[0][1];
        popup.onActiveChange?.(true);
        expect(service.activePopupId).toBe(id);

        popup.onActiveChange?.(false);
        expect(service.activePopupId).toBeNull();

        service.removePopup('not-found');
        service.removePopup(id);
        expect(service.popups.length).toBe(0);

        service.addPopup({
            componentKey: 'popup-2',
            unitId: 'u2',
            subUnitId: 's2',
            canvasElement: document.createElement('canvas'),
            anchorRect$: new BehaviorSubject({} as any),
        } as any);

        service.removeAll();
        expect(service.popups).toEqual([]);

        service.dispose();
        expect(service.popups).toEqual([]);
    });
});

describe('DesktopSidebarService', () => {
    it('should open and close sidebar with id checks and container', () => {
        const service = new DesktopSidebarService();
        const onClose = vi.fn();
        const emitted: any[] = [];
        service.sidebarOptions$.subscribe((v) => emitted.push(v));

        const dis = service.open({ id: 'side-1', title: 'A', onClose } as any);
        expect(service.visible).toBe(true);
        expect(service.options.id).toBe('side-1');

        service.close('other-id');
        expect(service.visible).toBe(true);

        service.close('side-1');
        expect(service.visible).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);

        const container = document.createElement('div');
        service.setContainer(container);
        expect(service.getContainer()).toBe(container);

        dis.dispose();
        expect(service.visible).toBe(false);
        expect(emitted.length).toBeGreaterThanOrEqual(2);
    });
});

describe('ThemeSwitcherService', () => {
    it('should inject and replace theme css variables in document head', () => {
        const service = new ThemeSwitcherService();
        service.injectThemeToHead({
            color: {
                primary: '#fff',
            },
            spacing: 8,
        } as any);

        const style = document.getElementById('univer-theme-css-variables');
        expect(style).toBeTruthy();
        expect(style?.innerHTML).toContain('--univer-color-primary');

        service.injectThemeToHead({
            color: {
                primary: '#000',
            },
        } as any);

        const styles = document.querySelectorAll('#univer-theme-css-variables');
        expect(styles.length).toBe(1);

        service.dispose();
    });
});

describe('zone services', () => {
    it('should handle DesktopGlobalZoneService lifecycle', () => {
        const manager = {
            register: vi.fn(),
            delete: vi.fn(),
        };
        const service = new DesktopGlobalZoneService(manager as any);

        const visibleValues: boolean[] = [];
        const keyValues: string[] = [];
        service.visible$.subscribe((v) => visibleValues.push(v));
        service.componentKey$.subscribe((v) => keyValues.push(v));

        const dis = service.set('zone-key', (() => null) as any);
        expect(manager.register).toHaveBeenCalledWith('zone-key', expect.any(Function));
        expect(service.componentKey).toBe('zone-key');
        expect(keyValues).toEqual(['zone-key']);

        service.open();
        service.close();
        expect(visibleValues).toEqual([true, false]);

        dis.dispose();
        expect(manager.delete).toHaveBeenCalledWith('zone-key');
    });

    it('should handle DesktopZenZoneService lifecycle', () => {
        const manager = {
            register: vi.fn(),
            delete: vi.fn(),
        };
        const service = new DesktopZenZoneService(manager as any);

        const visibleValues: boolean[] = [];
        const hiddenValues: boolean[] = [];
        service.visible$.subscribe((v) => visibleValues.push(v));
        service.temporaryHidden$.subscribe((v) => hiddenValues.push(v));

        const dis = service.set('zen-key', (() => null) as any);
        expect(manager.register).toHaveBeenCalledWith('zen-key', expect.any(Function));

        service.hide();
        service.show();
        expect(service.temporaryHidden).toBe(false);

        service.open();
        expect(service.visible).toBe(true);
        service.close();
        expect(service.visible).toBe(false);

        dis.dispose();
        expect(manager.delete).toHaveBeenCalledWith('zen-key');

        service.dispose();
        expect(visibleValues.at(-1)).toBe(false);
        expect(hiddenValues).toContain(true);
    });
});
