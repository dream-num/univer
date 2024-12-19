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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, MenuSchemaType } from '@univerjs/ui';
import { CommandType, FBase, ICommandService, Inject, Injector, Tools } from '@univerjs/core';
import { IMenuManagerService, MenuItemType, MenuManagerPosition, RibbonPosition, RibbonStartGroup } from '@univerjs/ui';

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

type FAllMenu = FMenu | FSubmenu;

/**
 * This is a build for adding a menu to Univer. Please notice that until the `appendTo` method is called,
 * the menu item is not added to the UI. Please note that this menu cannot have submenus. If you want to
 * have submenus, please use `FSubmenu`.
 */
export class FMenu extends FBase {
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

    /** @ignore */
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

    /**
     * Append the menu to any menu position on Univer UI.
     * @param path Some predefined path to append the menu.
     */
    appendTo(path: string): void {
        const schema = this.__getSchema();
        this._menuManagerService.mergeMenu({
            [path]: schema,
        });
    }
}

export class FSubmenu extends FBase {
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
     * @param submenu Menu to add to the submenu.
     * @returns The FSubmenu itself for chaining calls.
     */
    addSubmenu(submenu: FMenu | FSubmenu): this {
        this._submenus.push(submenu);
        return this;
    }

    /**
     * Add a separator to the submenu.
     * @returns The FSubmenu itself for chaining calls.
     */
    addSeparator(): this {
        this._menuByGroups.push(this._submenus);
        this._submenus = [];
        return this;
    }

    /**
     * Append the menu to any menu position on Univer UI.
     * @param path Some predefined path to append the menu.
     */
    appendTo(path: string): void {
        const schema = this.__getSchema();
        this._menuManagerService.mergeMenu({
            [path]: schema,
        });
    }

    /** @ignore */
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
