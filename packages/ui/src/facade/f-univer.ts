/**
 * Copyright 2023-present DreamNum Inc.
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
import type { IMessageProps } from '@univerjs/design';
import type { BuiltInUIPart, ComponentType, IComponentOptions, IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { IFacadeMenuItem, IFacadeSubmenuItem } from './f-menu-builder';
import { connectInjector, FUniver } from '@univerjs/core';
import { ComponentManager, CopyCommand, IDialogService, IMessageService, ISidebarService, IUIPartsService, PasteCommand } from '@univerjs/ui';
import { FMenu, FSubmenu } from './f-menu-builder';
import { FShortcut } from './f-shortcut';

export interface IFUniverUIMixin {
    /**
     * Return the URL of the current page.
     * @returns the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object
     */
    getURL(): URL;
    /**
     * Get the Shortcut handler to interact with Univer's shortcut functionalities.
     */
    getShortcut(): FShortcut;
    /**
     * Copy the current selected content of the currently focused unit into your system clipboard.
     */
    copy(): Promise<boolean>;
    /**
     * Paste into the current selected position of the currently focused unit from your system clipboard.
     */
    paste(): Promise<boolean>;
    /**
     * Create a menu build object. You can insert new menus into the UI.
     * @param {IFacadeMenuItem} menuItem the menu item
     * @example
     * ```ts
     * univerAPI.createMenu({
     *   id: 'custom-menu',
     *   title: 'Custom Menu',
     *   action: () => {},
     * }).appendTo('ribbon.start.others');
     * ```
     * @returns the {@link FMenu} object
     */
    createMenu(menuItem: IFacadeMenuItem): FMenu;
    /**
     * Create a menu that contains submenus, and later you can append this menu and its submenus to the UI.
     * @param submenuItem the submenu item
     * @example
     * ```ts
     * univerAPI.createSubmenu({ id: 'custom-submenu', title: 'Custom Submenu' })
     *   .addSubmenu(univerAPI.createSubmenu({ id: 'submenu-nested', title: 'Nested Submenu' })
     *     .addSubmenu(univerAPI.createMenu({ id: 'submenu-nested-1', title: 'Item 1', action: () => {} }))
     *     .addSeparator()
     *     .addSubmenu(univerAPI.createMenu({ id: 'submenu-nested-2', title: 'Item 2', action: () => {} }))
     *   )
     *   .appendTo('contextMenu.others');
     * ```
     * @returns the {@link FSubmenu} object
     */
    createSubmenu(submenuItem: IFacadeSubmenuItem): FSubmenu;
    /**
     * Open a sidebar.
     * @deprecated Please use `openSidebar` instead.
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;
    /**
     * Open a sidebar.
     * @deprecated Please use `openSidebar` instead.
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSidebar(params: ISidebarMethodOptions): IDisposable;
    /**
     * Open a dialog.
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;
    /**
     * Get the component manager
     * @returns The component manager
     */
    getComponentManager(): ComponentManager;
    /**
     * Show a message.
     * @example
     * ```ts
     * const message = univerAPI.showMessage({ key: 'my-message', content: 'Warning', duration: 0 });
     *
     * someAction().then(() => message.dispose());
     * ```
     */
    showMessage(options: IMessageProps): void;

    /**
     * Set the visibility of a built-in UI part.
     * @param key the built-in UI part
     * @param visible the visibility
     * @returns the {@link FUniver} object
     * example
     * ```ts
     * univerAPI.setUIVisible(BuiltInUIPart.HEADER, false);
     * ```
     */
    setUIVisible(key: BuiltInUIPart, visible: boolean): FUniver;

    /**
     * Get the visibility of a built-in UI part.
     * @param key the built-in UI part
     * @returns the visibility
     * example
     * ```ts
     * univerAPI.isUIVisible(BuiltInUIPart.HEADER);
     * ```
     */
    isUIVisible(key: BuiltInUIPart): boolean;

    /**
     * register an component to a built-in UI part
     * @param key the built-in UI part
     * @param component the react component
     * @example
     * ```ts
     * univerAPI.registerUIPart(BuiltInUIPart.CUSTOM_HEADER, () => React.createElement('h1', null, 'Custom Header'));
     * ```
     */
    registerUIPart(key: BuiltInUIPart, component: any): IDisposable;

    /**
     * register an component.
     * @param component
     * @example
     * ```ts
     * univerAPI.registerComponent(() => React.createElement('h1', null, 'Custom Header'));
     * ```
     */
    registerComponent(name: string, component: ComponentType, options?: IComponentOptions): IDisposable;
}

export class FUniverUIMixin extends FUniver implements IFUniverUIMixin {
    override getURL(): URL {
        return new URL(window.location.href);
    }

    override getShortcut(): FShortcut {
        return this._injector.createInstance(FShortcut);
    }

    override copy(): Promise<boolean> {
        return this._commandService.syncExecuteCommand(CopyCommand.id);
    }

    override paste(): Promise<boolean> {
        return this._commandService.syncExecuteCommand(PasteCommand.id);
    }

    override createMenu(menuItem: IFacadeMenuItem): FMenu {
        return this._injector.createInstance(FMenu, menuItem);
    }

    override createSubmenu(submenuItem: IFacadeSubmenuItem): FSubmenu {
        return this._injector.createInstance(FSubmenu, submenuItem);
    }

    override openSiderbar(params: ISidebarMethodOptions): IDisposable {
        const sideBarService = this._injector.get(ISidebarService);
        return sideBarService.open(params);
    }

    override openSidebar(params: ISidebarMethodOptions): IDisposable {
        return this.openSiderbar(params);
    }

    override openDialog(dialog: IDialogPartMethodOptions): IDisposable {
        const dialogService = this._injector.get(IDialogService);
        const disposable = dialogService.open({
            ...dialog,
            onClose: () => {
                disposable.dispose();
            },
        });
        return disposable;
    }

    override getComponentManager(): ComponentManager {
        return this._injector.get(ComponentManager);
    }

    override showMessage(options: IMessageProps): FUniver {
        const messageService = this._injector.get(IMessageService);
        messageService.show(options);
        return this;
    }

    override setUIVisible(ui: BuiltInUIPart, visible: boolean): FUniver {
        const uiPartService = this._injector.get(IUIPartsService);
        uiPartService.setUIVisible(ui, visible);
        return this;
    }

    override isUIVisible(ui: BuiltInUIPart): boolean {
        const uiPartService = this._injector.get(IUIPartsService);
        return uiPartService.isUIVisible(ui);
    }

    override registerUIPart(key: BuiltInUIPart, component: any): IDisposable {
        const uiPartService = this._injector.get(IUIPartsService);
        return uiPartService.registerComponent(key, () => connectInjector(component, this._injector));
    }

    override registerComponent(name: string, component: any, options?: IComponentOptions): IDisposable {
        const componentManager = this._injector.get(ComponentManager);
        return this.disposeWithMe(componentManager.register(name, component, options));
    }
}

FUniver.extend(FUniverUIMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverUIMixin { }
}
