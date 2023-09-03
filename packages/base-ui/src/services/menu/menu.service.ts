import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { ComponentChildren } from 'preact';

import { Disposable, toDisposable } from '@univerjs/core';

import { IShortcutService } from '../shortcut/shortcut.service';
import { ICustomLabelType } from '../../Interfaces/CustomLabel';
import { DisplayTypes, SelectTypes } from '../../Components/Select/Select';

export type OneOrMany<T> = T | T[];

export const enum MenuPosition {
    VOID,
    TOOLBAR,
    CONTEXT_MENU,
    TAB_CONTEXT_MENU,
    ROW_HEADER_CONTEXT_MENU,
    COL_HEADER_CONTEXT_MENU,
}

export const enum MenuItemType {
    /** Button style menu item. */
    BUTTON,
    /** Menu item with submenus. Submenus could be other IMenuItem or an ID of a registered component. */
    SELECTOR,
}

interface IMenuItemBase {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tooltip?: string;

    type: MenuItemType;

    /** In what menu should the item display. */
    positions: OneOrMany<MenuPosition>;

    /** @deprecated this parameter would be removed after refactoring */
    label?: string | ICustomLabelType | ComponentChildren;

    /** @deprecated this parameter would be removed after refactoring */
    className?: string;

    parentId?: string; // if it is submenu

    hidden$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
}

export interface IMenuButtonItem extends IMenuItemBase {
    type: MenuItemType.BUTTON;

    activated$?: Observable<boolean>;
}

export interface IValueOption {
    value: string | number;
    label: string;
    icon?: string;
    tooltip?: string;
    style?: object;
}

export interface ICustomComponentOption {
    id: string;
}

export interface IMenuSelectorItem<V> extends IMenuItemBase {
    type: MenuItemType.SELECTOR;

    /** Determines how the label of the selector should display. */
    display?: DisplayTypes;
    /** @deprecated this parameter would be removed after we complete refactoring */
    selectType: SelectTypes;

    // selections 子菜单可以为三种类型
    // 一个是当前 menu 的 options，选中后直接使用其 value 触发 command
    // 一个是一个特殊组件，比如 color picker，选中后直接使用其 value 触发 command
    // 一个是其他 menu 的 id，直接渲染成其他的 menu
    /** Options or IDs of registered components. */
    selections?: Array<IValueOption | ICustomComponentOption>; // TODO: we should probably change this to an observable value
    /** @deprecated use parentId instead. */
    submenus?: string[];

    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<V>;

    /** @deprecated */
    label?: {
        name: string;
        props: any; // TODO@wzhudev: fix later
    };
}

export type IMenuItem = IMenuButtonItem | IMenuSelectorItem<unknown>;

/**
 * @internal
 */
export type IDisplayMenuItem<T extends IMenuItem> = T & {
    /** MenuService get responsible shortcut and display on the UI. */
    shortcut?: string;

    /** Composed menu structure by the menu service. */
    subMenuItems?: Array<IDisplayMenuItem<IMenuItem>>; // TODO@wzhudev: related mechanism is not implemented yet
};

export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

export interface IMenuService {
    addMenuItem(item: IMenuItem): IDisposable;

    /** Get menu items for display at a given position. */
    getMenuItems(position: MenuPosition): Array<IDisplayMenuItem<IMenuItem>>;
    getSubMenuItems(parentId: string): Array<IDisplayMenuItem<IMenuItem>>;
    getMenuItem(id: string): IMenuItem | null;
}

export class DesktopMenuService extends Disposable implements IMenuService {
    private readonly _menuItemMap = new Map<string, IMenuItem>();

    private readonly _menuByPositions = new Map<MenuPosition, Map<string, IMenuItem>>();

    // TODO@wzhudev: add map to parent menu item & child menu item
    private readonly _menuByParentId = new Map<string, string[]>();

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

        if (Array.isArray(item.positions)) {
            item.positions.forEach((menu) => this.appendMenuToPosition(item, menu));
        } else {
            this.appendMenuToPosition(item, item.positions);
        }

        if (item.parentId) {
            this._menuByParentId.set(item.parentId, [...(this._menuByParentId.get(item.parentId) ?? []), item.id]);
        }

        return toDisposable(() => {
            this._menuItemMap.delete(item.id);

            if (Array.isArray(item.positions)) {
                item.positions.forEach((menu) => this._menuByPositions.get(menu)?.delete(item.id));
            } else {
                this._menuByPositions.get(item.positions)?.delete(item.id);
            }

            if (item.parentId) {
                const children = this._menuByParentId.get(item.parentId);
                if (children) {
                    const index = children.findIndex((id) => id === item.id);
                    if (index > -1) {
                        children.splice(index, 1);
                    }
                }
            }
        });
    }

    getMenuItems(positions: MenuPosition): Array<IDisplayMenuItem<IMenuItem>> {
        if (this._menuByPositions.has(positions)) {
            return [...this._menuByPositions.get(positions)!.values()].filter((menu) => !menu.parentId).map((menu) => this.getDisplayMenuItems(menu));
        }

        return [] as Array<IDisplayMenuItem<any>>;
    }

    getSubMenuItems(parentId: string): Array<IDisplayMenuItem<IMenuItem>> {
        const subMenuIds = this._menuByParentId.get(parentId);
        if (!subMenuIds) {
            return [];
        }

        return subMenuIds.map((id) => this.getDisplayMenuItems(this._menuItemMap.get(id)!));
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
