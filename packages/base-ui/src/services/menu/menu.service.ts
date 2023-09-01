import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { ComponentChildren } from 'preact';

import { Disposable, toDisposable } from '@univerjs/core';

import { IShortcutService } from '../shortcut/shortcut.service';
import { ICustomLabelType } from '../../Interfaces/CustomLabel';
import { BaseSelectProps, DisplayTypes, SelectTypes } from '../../Components/Select/Select';

export type OneOrMany<T> = T | T[];

export const enum MenuPosition {
    TOOLBAR,
    CONTEXT_MENU,
}

export const enum MenuItemType {
    /** default */
    BUTTON,
    SELECTOR,
}

interface IMenuItemBase {
    id: string;
    description?: string;
    icon?: string;
    label?: string | ICustomLabelType | ComponentChildren;
    menu: OneOrMany<MenuPosition>;
    title: string;
    tooltip?: string;
    type?: MenuItemType;

    /** @deprecated should avoid using this */
    className?: string;

    /** @deprecated */
    subMenus?: string[]; // submenu id list
    parentId?: string; // if it is submenu

    hidden$?: Observable<boolean>;
    activated$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
}

export interface IMenuButtonItem extends IMenuItemBase {}

export interface IMenuSelectorItem extends IMenuItemBase {
    type: MenuItemType.SELECTOR;
    display?: DisplayTypes;
    selectType: SelectTypes;
    selections?: Array<number | BaseSelectProps>;

    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<unknown>; // TODO@wzhudev: it could be a generic type. optional for now. But it should be required.

    /** @deprecated */
    label?: {
        name: string;
        props: any; // TODO@wzhudev: fix later
    };
}

export type IMenuItem = IMenuButtonItem | IMenuSelectorItem;

// TODO@wzhudev: maybe we should separate `IMenuItemState` to different types of menu items.

export type IDisplayMenuItem<T extends IMenuItem> = T & {
    /** MenuService should get responsible shortcut and display on the UI. */
    shortcut?: string;
    /** Composed menu structure by the menu service. */
    subMenuItems?: Array<IDisplayMenuItem<IMenuItem>>; // TODO@wzhudev: related mechanism is not implemented yet
};

export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

export interface IMenuService {
    addMenuItem(item: IMenuItem): IDisposable;

    /** Get menu items for display at a given position. */
    getMenuItems(position: MenuPosition): Array<IDisplayMenuItem<IMenuItem>>;
    getMenuItem(id: string): IMenuItem | null;
}

export class DesktopMenuService extends Disposable implements IMenuService {
    private readonly _menuItemMap = new Map<string, IMenuItem>();

    private readonly _menuByPositions = new Map<MenuPosition, Map<string, IMenuItem>>();

    constructor(@IShortcutService private readonly _shortcutService: IShortcutService) {
        super();
    }

    override dispose(): void {
        this._menuItemMap.clear();
    }

    addMenuItem(item: IMenuItem): IDisposable {
        if (this._menuItemMap.has(item.id)) {
            throw new Error(`Menu item with the same id ${item.id} has already been added!`);
        }

        this._menuItemMap.set(item.id, item);
        if (Array.isArray(item.menu)) {
            item.menu.forEach((menu) => this.appendMenuToPosition(item, menu));
        } else {
            this.appendMenuToPosition(item, item.menu);
        }

        return toDisposable(() => {
            this._menuItemMap.delete(item.id);
            if (Array.isArray(item.menu)) {
                item.menu.forEach((menu) => this._menuByPositions.get(menu)?.delete(item.id));
            } else {
                this._menuByPositions.get(item.menu)?.delete(item.id);
            }
        });
    }

    getMenuItems(positions: MenuPosition): Array<IDisplayMenuItem<IMenuItem>> {
        if (this._menuByPositions.has(positions)) {
            return [...this._menuByPositions.get(positions)!.values()].map((menu) => this.getDisplayMenuItems(menu));
        }

        return [] as Array<IDisplayMenuItem<any>>;
    }

    getMenuItem(id: string): IMenuItem | null {
        if (this._menuItemMap.has(id)) {
            return this._menuItemMap.get(id)!;
        }

        return null;
    }

    private getDisplayMenuItems(menuItem: IMenuItem): IDisplayMenuItem<IMenuItem> {
        const shortcut = this._shortcutService.getCommandShortcut(menuItem.id);
        if (!shortcut) {
            return menuItem;
        }

        return {
            ...menuItem,
            shortcut,
        };
    }

    private appendMenuToPosition(menu: IMenuItem, position: MenuPosition) {
        if (!this._menuByPositions.has(position)) {
            this._menuByPositions.set(position, new Map<string, IMenuItem>());
        }

        const menuSet = this._menuByPositions.get(position)!;
        if (menuSet.has(menu.id)) {
            throw new Error(`Menu item with the same id ${menu.id} has already been added!`);
        }

        menuSet.set(menu.id, menu);
    }
}
