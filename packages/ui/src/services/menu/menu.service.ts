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

import { Disposable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IShortcutService } from '../shortcut/shortcut.service';
import { mergeMenuConfigs } from '../../common/menu-merge-configs';
import type { IDisplayMenuItem, IMenuItem, MenuConfig, MenuPosition } from './menu';

export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

export interface IMenuService {
    menuChanged$: Observable<void>;

    addMenuItem(item: IMenuItem, config: MenuConfig): IDisposable;

    setMenuItem(item: IMenuItem): void;

    /** Get menu items for display at a given position or a submenu. */
    getMenuItems(position: MenuPosition | string): Array<IDisplayMenuItem<IMenuItem>>;
    getMenuItem(id: string): IMenuItem | null;
}

export class DesktopMenuService extends Disposable implements IMenuService {
    private readonly _menuItemMap = new Map<string, IMenuItem>();

    private readonly _menuByPositions = new Map<MenuPosition | string, Array<[string, IMenuItem]>>();

    private readonly _menuConfigs = new Map<string, MenuConfig>();

    private _menuChanged$ = new BehaviorSubject<void>(undefined);

    menuChanged$: Observable<void> = this._menuChanged$.asObservable();

    constructor(@IShortcutService private readonly _shortcutService: IShortcutService) {
        super();
    }

    override dispose(): void {
        this._menuItemMap.clear();
        this._menuChanged$.complete();
    }

    addMenuItem(item: IMenuItem, config: MenuConfig): IDisposable {
        if (this._menuItemMap.has(item.id)) {
            throw new Error(`Menu item with the same id ${item.id} has already been added!`);
        }

        const menuItemConfig = config?.[item.id];

        this._menuItemMap.set(item.id, mergeMenuConfigs(item, menuItemConfig));

        if (Array.isArray(item.positions)) {
            item.positions.forEach((menu) => this._appendMenuToPosition(item, menu));
        } else {
            this._appendMenuToPosition(item, item.positions);
        }

        this._menuChanged$.next();

        return toDisposable(() => {
            this._menuItemMap.delete(item.id);

            if (Array.isArray(item.positions)) {
                item.positions.forEach((menu) => {
                    const menus = this._menuByPositions.get(menu);
                    if (!menus) {
                        return;
                    }

                    const index = menus.findIndex((m) => m[0] === item.id);
                    if (index > -1) {
                        menus.splice(index, 1);
                    }
                });
            } else {
                const menus = this._menuByPositions.get(item.positions);
                if (!menus) {
                    return;
                }

                const index = menus.findIndex((m) => m[0] === item.id);
                if (index > -1) {
                    menus.splice(index, 1);
                }
            }

            this._menuChanged$.next();
        });
    }

    getMenuItems(positions: MenuPosition | string): Array<IDisplayMenuItem<IMenuItem>> {
        // TODO: @wzhudev: compose shortcut to returned menu items.
        if (this._menuByPositions.has(positions)) {
            const menuItems = this._menuByPositions.get(positions);

            if (menuItems) {
                return [...menuItems.values()].map((menu) => this._getDisplayMenuItems(menu[1]));
            }
        }

        return [] as Array<IDisplayMenuItem<IMenuItem>>;
    }

    setMenuItem(item: IMenuItem): void {
        this._menuItemMap.set(item.id, item);
        this._menuChanged$.next();
    }

    getMenuItem(id: string): IMenuItem | null {
        if (this._menuItemMap.has(id)) {
            return this._menuItemMap.get(id)!;
        }

        return null;
    }

    setMenuConfigs(id: string, config: MenuConfig): void {
        this._menuConfigs.set(id, config);
    }

    getMenuConfig(id: string): MenuConfig | null {
        if (this._menuConfigs.has(id)) {
            return this._menuConfigs.get(id)!;
        }

        return null;
    }

    private _getDisplayMenuItems(menuItem: IMenuItem): IDisplayMenuItem<IMenuItem> {
        const shortcut = this._shortcutService.getShortcutDisplayOfCommand(menuItem.id);
        if (!shortcut) {
            return menuItem;
        }

        return {
            ...menuItem,
            shortcut,
        };
    }

    private _appendMenuToPosition(menu: IMenuItem, position: MenuPosition | string) {
        if (!this._menuByPositions.has(position)) {
            this._menuByPositions.set(position, []);
        }

        const menuList = this._menuByPositions.get(position)!;
        if (menuList.findIndex((m) => m[0] === menu.id) > -1) {
            throw new Error(`Menu item with the same id ${menu.id} has already been added!`);
        }

        menuList.push([menu.id, menu]);
    }
}
