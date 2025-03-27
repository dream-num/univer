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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, MenuSchemaType } from '@univerjs/ui';
import { CommandType, ICommandService, Inject, Injector, Tools } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { IMenuManagerService, MenuItemType, MenuManagerPosition, RibbonPosition, RibbonStartGroup } from '@univerjs/ui';

/**
 * @ignore
 */
export interface IFacadeMenuItem {
    /**
     * The unique identifier of the menu item.
     */
    id: string;
    /**
     * Icon of the menu item.
     */
    icon?: string;
    /**
     * Title of the menu item.
     */
    title: string;
    /**
     * The tooltip to show when the mouse hovers over the menu item.
     */
    tooltip?: string;
    /**
     * The command to execute when the menu item is clicked. It can also be a callback function to
     * execute any custom logic.
     */
    action: string | (() => void);
    /**
     * The order of the menu item in the submenu.
     */
    order?: number;
}

/**
 * @ignore
 */
export interface IFacadeSubmenuItem {
    /**
     * The unique identifier of the menu item.
     */
    id: string;
    /**
     * Icon of the menu item.
     */
    icon?: string;
    /**
     * Title of the menu item.
     */
    title: string;
    /**
     * The tooltip to show when the mouse hovers over the menu item.
     */
    tooltip?: string;
    /**
     * The order of the menu item in the submenu.
     */
    order?: number;
}

/**
 * @ignore
 */
type FAllMenu = FMenu | FSubmenu;

/**
 * @ignore
 */
abstract class FMenuBase extends FBase {
    protected abstract readonly _menuManagerService: IMenuManagerService;
    abstract __getSchema(): { [key: string]: MenuSchemaType };

    /**
     * Append the menu to any menu position on Univer UI.
     * @param {string | string[]} path - Some predefined path to append the menu. The paths can be an array,
     * or an array joined by `|` separator. Since lots of submenus reuse the same name,
     * you may need to specify their parent menus as well.
     *
     * @example
     * ```typescript
     * // This menu item will appear on every `contextMenu.others` section.
     * univerAPI.createMenu({
     *   id: 'custom-menu-id-1',
     *   title: 'Custom Menu 1',
     *   action: () => {
     *     console.log('Custom Menu 1 clicked');
     *   },
     * }).appendTo('contextMenu.others');
     *
     * // This menu item will only appear on the `contextMenu.others` section on the main area.
     * univerAPI.createMenu({
     *   id: 'custom-menu-id-2',
     *   title: 'Custom Menu 2',
     *   action: () => {
     *     console.log('Custom Menu 2 clicked');
     *   },
     * }).appendTo(['contextMenu.mainArea', 'contextMenu.others']);
     * ```
     */
    appendTo(path: string | string[]): void {
        const paths = typeof path === 'string' ? path.split('|') : path;
        const len = paths.length;

        // eslint-disable-next-line ts/no-explicit-any
        const menuConfig: Record<string, any> = {};
        let obj = menuConfig;

        const schema = this.__getSchema();
        paths.forEach((p, index) => {
            if (index === len - 1) {
                obj[p] = schema;
            } else {
                obj[p] = {};
            }
            obj = obj[p];
        });

        this._menuManagerService.mergeMenu(menuConfig);
    }
}

/**
 * This is the builder for adding a menu to Univer. You shall never construct this
 * class by yourself. Instead, call `createMenu` of {@link FUniver} to create a instance.
 *
 * Please notice that until the `appendTo` method is called, the menu item is not added to the UI.
 *
 * Please note that this menu cannot have submenus. If you want to
 * have submenus, please use {@link FSubmenu}.
 *
 * @hideconstructor
 */
export class FMenu extends FMenuBase {
    static RibbonStartGroup = RibbonStartGroup;
    static RibbonPosition = RibbonPosition;
    static MenuManagerPosition = MenuManagerPosition;

    private _commandToRegister = new Map<string, (accessor: IAccessor) => void>();
    private _buildingSchema: {
        order?: number;
        menuItemFactory?: (accessor: IAccessor) => IMenuItem;
    };

    constructor(
        private readonly _item: IFacadeMenuItem,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        const commandId = typeof _item.action === 'string' ? _item.action : Tools.generateRandomId(12);
        if (commandId !== _item.action) {
            this._commandToRegister.set(commandId, _item.action as unknown as () => void);
        }

        this._buildingSchema = {
            // eslint-disable-next-line ts/explicit-function-return-type
            menuItemFactory: () => ({
                id: _item.id,
                type: MenuItemType.BUTTON, // we only support button for now
                icon: _item.icon,
                title: _item.title,
                tooltip: _item.tooltip,
                commandId,
            } as IMenuButtonItem),
        };

        if (typeof _item.order !== 'undefined') {
            this._buildingSchema.order = _item.order;
        }
    }

    /**
     * @ignore
     */
    __getSchema(): { [key: string]: MenuSchemaType } {
        this._commandToRegister.forEach((command, id) => {
            if (!this._commandService.hasCommand(id)) {
                this._commandService.registerCommand({
                    id,
                    type: CommandType.COMMAND,
                    handler: command,
                });
            }
        });

        return { [this._item.id]: this._buildingSchema };
    }
}

/**
 * This is the builder for add a menu that can contains submenus to Univer. You shall
 * never construct this class by yourself. Instead, call `createSubmenu` of {@link FUniver} to
 * create a instance.
 *
 * Please notice that until the `appendTo` method is called, the menu item is not added to the UI.
 *
 * @hideconstructor
 */
export class FSubmenu extends FMenuBase {
    private _menuByGroups: FAllMenu[][] = [];
    private _submenus: FAllMenu[] = [];

    private _buildingSchema: {
        order?: number;
        menuItemFactory?: (accessor: IAccessor) => IMenuItem;
    };

    constructor(
        private readonly _item: IFacadeSubmenuItem,
        @Inject(Injector) protected readonly _injector: Injector,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        this._buildingSchema = {
            // eslint-disable-next-line ts/explicit-function-return-type
            menuItemFactory: () => ({
                id: _item.id,
                type: MenuItemType.SUBITEMS,
                icon: _item.icon,
                title: _item.title,
                tooltip: _item.tooltip,
            }),
        };

        if (typeof _item.order !== 'undefined') {
            this._buildingSchema.order = _item.order;
        }
    }

    /**
     * Add a menu to the submenu. It can be a {@link FMenu} or a {@link FSubmenu}.
     * @param {FMenu | FSubmenu} submenu - Menu to add to the submenu.
     * @returns {FSubmenu} The FSubmenu itself for chaining calls.
     * @example
     * ```typescript
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
    addSubmenu(submenu: FMenu | FSubmenu): this {
        this._submenus.push(submenu);
        return this;
    }

    /**
     * Add a separator to the submenu.
     * @returns {FSubmenu} The FSubmenu itself for chaining calls.
     * @example
     * ```typescript
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
     * // Add the leaf menus to a submenu and add a separator between them.
     * // Append the submenu to the `contextMenu.others` section.
     * univerAPI.createSubmenu({ id: 'submenu-nested', title: 'Nested Submenu' })
     *   .addSubmenu(menu1)
     *   .addSeparator()
     *   .addSubmenu(menu2)
     *   .appendTo('contextMenu.others');
     * ```
     */
    addSeparator(): this {
        this._menuByGroups.push(this._submenus);
        this._submenus = [];
        return this;
    }

    /**
     * @ignore
     */
    __getSchema(): { [key: string]: MenuSchemaType } {
        const schema: { [key: string]: MenuSchemaType } = {};
        this.addSeparator();
        this._menuByGroups.forEach((group, index) => {
            const groupSchema: MenuSchemaType = {};
            group.forEach((menu) => {
                Object.assign(groupSchema, menu.__getSchema());
            });

            schema[`${this._item.id}-group-${index}`] = groupSchema;
        });

        return { [this._item.id]: Object.assign(this._buildingSchema, schema) };
    }
}
