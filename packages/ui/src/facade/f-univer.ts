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
import type { IMessageProps } from '@univerjs/design';
import type { BuiltInUIPart, ComponentType, IComponentOptions, IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { IFacadeMenuItem, IFacadeSubmenuItem } from './f-menu-builder';
import { FUniver } from '@univerjs/core/facade';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, connectInjector, CopyCommand, IDialogService, IMessageService, ISidebarService, IUIPartsService, PasteCommand } from '@univerjs/ui';
import { FMenu, FSubmenu } from './f-menu-builder';
import { FShortcut } from './f-shortcut';

/**
 * @ignore
 */
export interface IFUniverUIMixin {
    /**
     * Return the URL of the current page.
     * @returns {URL} the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object
     * @example
     * ```ts
     * console.log(univerAPI.getURL());
     * ```
     */
    getURL(): URL;

    /**
     * Get the Shortcut handler to interact with Univer's shortcut functionalities.
     * @returns the {@link FShortcut} object
     * @example
     * ```ts
     * const fShortcut = univerAPI.getShortcut();
     *
     * // Disable shortcuts of Univer
     * fShortcut.disableShortcut();
     *
     * // Enable shortcuts of Univer
     * fShortcut.enableShortcut();
     *
     * // Trigger a shortcut
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1');
     * fRange.activate();
     * fRange.setValue('Hello Univer');
     * console.log(fRange.getCellStyle().bold); // false
     * const pseudoEvent = new KeyboardEvent('keydown', {
     *   key: 'b',
     *   ctrlKey: true,
     *   keyCode: univerAPI.Enum.KeyCode.B
     * });
     * const ifShortcutItem = fShortcut.triggerShortcut(pseudoEvent);
     * if (ifShortcutItem) {
     *   const commandId = ifShortcutItem.id;
     *   console.log(fRange.getCellStyle().bold); // true
     * }
     * ```
     */
    getShortcut(): FShortcut;

    /**
     * Copy the current selected content of the currently focused unit into your system clipboard.
     * @returns {Promise<boolean>} whether the copy operation is successful
     * @example
     * ```ts
     * // Prevent failure due to loss of focus when executing copy and paste code in the console,
     * // this example listens for the cell click event and executes the copy and paste code.
     * univerAPI.addEvent(univerAPI.Event.CellClicked, async (params) => {
     *   const fWorkbook = univerAPI.getActiveWorkbook();
     *   const fWorksheet = fWorkbook.getActiveSheet();
     *
     *   // Copy the range A1:B2 to the clipboard
     *   const fRange = fWorksheet.getRange('A1:B2');
     *   fRange.activate().setValues([
     *     [1, 2],
     *     [3, 4]
     *   ]);
     *   await univerAPI.copy();
     *
     *   // Paste the copied content to the range C1:D2
     *   const fRange2 = fWorksheet.getRange('C1');
     *   fRange2.activate();
     *   await univerAPI.paste();
     *
     *   // Check the pasted content
     *   console.log(fWorksheet.getRange('C1:D2').getValues()); // [[1, 2], [3, 4]]
     * });
     * ```
     */
    copy(): Promise<boolean>;

    /**
     * Paste into the current selected position of the currently focused unit from your system clipboard.
     * @returns {Promise<boolean>} whether the paste operation is successful
     * @example
     * ```ts
     * // Prevent failure due to loss of focus when executing copy and paste code in the console,
     * // this example listens for the cell click event and executes the copy and paste code.
     * univerAPI.addEvent(univerAPI.Event.CellClicked, async (params) => {
     *   const fWorkbook = univerAPI.getActiveWorkbook();
     *   const fWorksheet = fWorkbook.getActiveSheet();
     *
     *   // Copy the range A1:B2 to the clipboard
     *   const fRange = fWorksheet.getRange('A1:B2');
     *   fRange.activate().setValues([
     *     [1, 2],
     *     [3, 4]
     *   ]);
     *   await univerAPI.copy();
     *
     *   // Paste the copied content to the range C1:D2
     *   const fRange2 = fWorksheet.getRange('C1');
     *   fRange2.activate();
     *   await univerAPI.paste();
     *
     *   // Check the pasted content
     *   console.log(fWorksheet.getRange('C1:D2').getValues()); // [[1, 2], [3, 4]]
     * });
     * ```
     */
    paste(): Promise<boolean>;

    /**
     * Create a menu build object. You can insert new menus into the UI.
     * @param {IFacadeMenuItem} menuItem the menu item
     * @returns the {@link FMenu} object
     * @example
     * ```ts
     * // Univer Icon can be viewed at https://univer.ai/en-US/icons
     * import { SmileSingle } from '@univerjs/icons'
     *
     * // Create a custom menu with an univer icon
     * univerAPI.registerComponent('custom-menu-icon', SmileSingle);
     * univerAPI.createMenu({
     *   id: 'custom-menu',
     *   icon: 'custom-menu-icon',
     *   title: 'Custom Menu',
     *   tooltip: 'Custom Menu Tooltip',
     *   action: () => {
     *     console.log('Custom Menu Clicked');
     *   },
     * }).appendTo('ribbon.start.others');
     *
     * // Or
     * // Create a custom menu with an image icon
     * univerAPI.registerComponent('custom-menu-icon', () => {
     *   return <img src="https://avatars.githubusercontent.com/u/61444807?s=48&v=4" alt="" style={{ width: '16px', height: '16px' }} />;
     * });
     * univerAPI.createMenu({
     *   id: 'custom-menu',
     *   icon: 'custom-menu-icon',
     *   title: 'Custom Menu',
     *   tooltip: 'Custom Menu Tooltip',
     *   action: () => {
     *     console.log('Custom Menu Clicked');
     *   },
     * }).appendTo('ribbon.start.others');
     *
     * // Or
     * // Create a custom menu without an icon
     * univerAPI.createMenu({
     *   id: 'custom-menu',
     *   title: 'Custom Menu',
     *   tooltip: 'Custom Menu Tooltip',
     *   action: () => {
     *     console.log('Custom Menu Clicked');
     *   },
     * }).appendTo('ribbon.start.others');
     * ```
     */
    createMenu(menuItem: IFacadeMenuItem): FMenu;

    /**
     * Create a menu that contains submenus, and later you can append this menu and its submenus to the UI.
     * @param {IFacadeSubmenuItem} submenuItem the submenu item
     * @returns the {@link FSubmenu} object
     * @example
     * ```ts
     * // Create two leaf menus.
     * const menu1 = univerAPI.createMenu({
     *   id: 'submenu-nested-1',
     *   title: 'Item 1',
     *   action: () => {
     *     console.log('Item 1 clicked');
     *   }
     * });
     * const menu2 = univerAPI.createMenu({
     *   id: 'submenu-nested-2',
     *   title: 'Item 2',
     *   action: () => {
     *     console.log('Item 2 clicked');
     *   }
     * });
     *
     * // Add the leaf menus to a submenu.
     * const submenu = univerAPI.createSubmenu({ id: 'submenu-nested', title: 'Nested Submenu' })
     *   .addSubmenu(menu1)
     *   .addSeparator()
     *   .addSubmenu(menu2);
     *
     * // Create a root submenu append to the `contextMenu.others` section.
     * univerAPI.createSubmenu({ id: 'custom-submenu', title: 'Custom Submenu' })
     *   .addSubmenu(submenu)
     *   .appendTo('contextMenu.others');
     * ```
     */
    createSubmenu(submenuItem: IFacadeSubmenuItem): FSubmenu;

    /**
     * Open a sidebar.
     * @deprecated Please use `univerAPI.openSidebar` instead.
     * @param {ISidebarMethodOptions} params the sidebar options
     * @returns {IDisposable} the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a sidebar.
     * @param {ISidebarMethodOptions} params the sidebar options
     * @returns {IDisposable} the disposable object
     * @example
     * ```ts
     * univerAPI.openSidebar({
     *   id: 'mock-sidebar-id',
     *   width: 300,
     *   header: {
     *     label: 'Sidebar Header',
     *   },
     *   children: {
     *     label: 'Sidebar Content',
     *   },
     *   footer: {
     *     label: 'Sidebar Footer',
     *   },
     *   onClose: () => {
     *     console.log('Sidebar closed')
     *   },
     * });
     * ```
     */
    openSidebar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     * @param {IDialogPartMethodOptions} dialog the dialog options
     * @returns {IDisposable} the disposable object
     * @example
     * ```ts
     * import { Button } from '@univerjs/design';
     *
     * univerAPI.openDialog({
     *   id: 'mock-dialog-id',
     *   width: 500,
     *   title: {
     *     label: 'Dialog Title',
     *   },
     *   children: {
     *     label: 'Dialog Content',
     *   },
     *   footer: {
     *     title: (
     *       <>
     *         <Button onClick={() => { console.log('Cancel clicked') }}>Cancel</Button>
     *         <Button variant="primary" onClick={() => { console.log('Confirm clicked') }} style={{marginLeft: '10px'}}>Confirm</Button>
     *       </>
     *     )
     *   },
     *   draggable: true,
     *   mask: true,
     *   maskClosable: true,
     * });
     * ```
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * Get the component manager
     * @returns {ComponentManager} The component manager
     * @example
     * ```ts
     * const componentManager = univerAPI.getComponentManager();
     * console.log(componentManager);
     * ```
     */
    getComponentManager(): ComponentManager;

    /**
     * Show a message.
     * @returns {FUniver} the {@link FUniver} instance for chaining
     * @example
     * ```ts
     * univerAPI.showMessage({
     *   content: 'Success',
     *   type: 'success',
     *   duration: 3000,
     * });
     * ```
     */
    showMessage(options: IMessageProps): FUniver;

    /**
     * Set the visibility of a built-in UI part.
     * @param {BuiltInUIPart} key the built-in UI part
     * @param {boolean} visible the visibility
     * @returns the {@link FUniver} instance for chaining
     * example
     * ```ts
     * // Hide header, footer, and toolbar
     * univerAPI.setUIVisible(univerAPI.Enum.BuiltInUIPart.HEADER, false)
     *   .setUIVisible(univerAPI.Enum.BuiltInUIPart.FOOTER, false)
     *   .setUIVisible(univerAPI.Enum.BuiltInUIPart.TOOLBAR, false);
     *
     * // Show in 3 seconds
     * setTimeout(() => {
     *   univerAPI.setUIVisible(univerAPI.Enum.BuiltInUIPart.HEADER, true)
     *     .setUIVisible(univerAPI.Enum.BuiltInUIPart.FOOTER, true)
     *     .setUIVisible(univerAPI.Enum.BuiltInUIPart.TOOLBAR, true);
     * }, 3000);
     * ```
     */
    setUIVisible(key: BuiltInUIPart, visible: boolean): FUniver;

    /**
     * Get the visibility of a built-in UI part.
     * @param {BuiltInUIPart} key the built-in UI part
     * @returns {boolean} the visibility
     * @example
     * ```ts
     * // Hide header
     * univerAPI.setUIVisible(univerAPI.Enum.BuiltInUIPart.HEADER, false);
     * console.log(univerAPI.isUIVisible(univerAPI.Enum.BuiltInUIPart.HEADER)); // false
     * ```
     */
    isUIVisible(key: BuiltInUIPart): boolean;

    /**
     * Register an component to a built-in UI part
     * @param {BuiltInUIPart} key the built-in UI part
     * @param component the react component
     * @example
     * ```ts
     * univerAPI.registerUIPart(univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER, () => React.createElement('h1', null, 'Custom Header'));
     * ```
     */
    registerUIPart(key: BuiltInUIPart, component: any): IDisposable;

    /**
     * Register an component.
     * @param {string} name - The name of the component.
     * @param {ComponentType} component - The component.
     * @param {IComponentOptions} [options] - The options of the component.
     * @returns {IDisposable} The disposable object.
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getActiveSheet();
     *
     * // Register a range loading component
     * const RangeLoading = () => {
     *   const divStyle = {
     *     width: '100%',
     *     height: '100%',
     *     backgroundColor: '#fff',
     *     border: '1px solid #ccc',
     *     boxSizing: 'border-box' as const,
     *     display: 'flex',
     *     justifyContent: 'center',
     *     alignItems: 'center',
     *     textAlign: 'center' as const,
     *     transformOrigin: 'top left',
     *   };
     *
     *   return (
     *     <div style={divStyle}>
     *       Loading...
     *     </div>
     *   );
     * };
     * univerAPI.registerComponent('RangeLoading', RangeLoading);
     *
     * // Add the range loading component covering the range A1:C3
     * const range = fWorksheet.getRange('A1:C3');
     * const disposeable = fWorksheet.addFloatDomToRange(range, { componentKey: 'RangeLoading' }, {}, 'myRangeLoading');
     *
     * setTimeout(() => {
     *   disposeable?.dispose();
     * }, 2000);
     * ```
     */
    registerComponent(name: string, component: ComponentType, options?: IComponentOptions): IDisposable;

    /**
     * Set a unit as the current unit and render a unit in the workbench's main area. If you have multiple units in Univer,
     * you should call this method to render the unit.
     * @param {string} unitId Unit to be rendered.
     *
     * @example
     * Let's assume you have created two units, `unit1` and `unit2`. Univer is rendering `unit1` and you want to
     * render `unit2`.
     *
     * ```ts
     * univerAPI.setCurrent('unit2');
     * ```
     *
     * This will render `unit2` in the workbench's main area.
     */
    setCurrent(unitId: string): void;
}

/**
 * @ignore
 */
export class FUniverUIMixin extends FUniver implements IFUniverUIMixin {
    override getURL(): URL {
        return new URL(window.location.href);
    }

    override getShortcut(): FShortcut {
        return this._injector.createInstance(FShortcut);
    }

    override copy(): Promise<boolean> {
        return this._commandService.executeCommand(CopyCommand.id);
    }

    override paste(): Promise<boolean> {
        return this._commandService.executeCommand(PasteCommand.id);
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

    override setCurrent(unitId: string): void {
        const rendererManagerService = this._injector.get(IRenderManagerService);
        const renderUnit = rendererManagerService.getRenderById(unitId);
        if (!renderUnit) {
            throw new Error('Unit not found');
        }

        this._univerInstanceService.setCurrentUnitForType(unitId);
    }
}

FUniver.extend(FUniverUIMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverUIMixin { }
}
