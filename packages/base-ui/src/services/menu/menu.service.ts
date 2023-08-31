import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { IShortcutService } from '../shortcut/shorcut.service';
import { CustomLabelType } from '../../Interfaces/CustomLabel';
import { ComponentChildren } from 'preact';

export type OneOrMany<T> = T | T[];

export const enum MenuPosition {
    TOOLBAR,
    CONTEXT_MENU,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IMenuItemState {
    id: string;

    disabled?: boolean;
    hidden?: boolean;
    checked?: boolean;
}

export interface IMenuItem {
    id: string;
    menu: OneOrMany<MenuPosition>;
    subMenus?: string[]; // submenu id list
    parentId?: string; // if it is submenu
    label?: string | CustomLabelType | ComponentChildren;

    title: string;
    icon?: string;
    tooltip?: string;
    description?: string;

    hidden$?: Observable<boolean>;
    activated$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
}

export interface IDisplayMenuItem extends IMenuItem {
    /** MenuService should get responsible shortcut and display on the UI. */
    shortcut?: string;
    subMenuItems?: IDisplayMenuItem[];
}

export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

export interface IMenuService {
    addMenuItem(item: IMenuItem): IDisposable;
    /** Get menu items at a given position. */
    getMenuItems(position: MenuPosition): IMenuItem[];
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

    getMenuItems(positions: MenuPosition): IDisplayMenuItem[] {
        if (this._menuByPositions.has(positions)) {
            return [...this._menuByPositions.get(positions)!.values()].map((menu) => this.getDisplayMenuItems(menu));
        }

        return [] as IDisplayMenuItem[];
    }

    getMenuItem(id: string): IMenuItem | null {
        if (this._menuItemMap.has(id)) {
            return this._menuItemMap.get(id)!;
        }

        return null;
    }

    private getDisplayMenuItems(menuItem: IMenuItem): IDisplayMenuItem {
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
