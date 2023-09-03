import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { Disposable, toDisposable } from '@univerjs/core';

import { IShortcutService } from '../shortcut/shortcut.service';
import { IMenuItem, MenuPosition } from './menu';

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

    private readonly _menuByParentId = new Map<string, string[]>(); // NOTE: this could actually be merged with _menuByPositions?

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
