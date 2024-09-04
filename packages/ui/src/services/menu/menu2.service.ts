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

import type { IAccessor, Nullable } from '@univerjs/core';
import { createIdentifier, Disposable, IConfigService, Inject, Injector, Tools } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IMenuItem } from '../menu/menu';
import { mergeMenuConfigs } from '../../common/menu-merge-configs';
import { ContextMenuGroup, ContextMenuPosition, Menu2Position, RibbonDataGroup, RibbonFormulasGroup, RibbonInsertGroup, RibbonOthersGroup, RibbonPosition, RibbonStartGroup, RibbonViewGroup } from './types';

export const IMenu2Service = createIdentifier<IMenu2Service>('univer.menu2-service');

export interface IMenu2Schema {
    key: string;
    order: number;
    item?: IMenuItem;
    children?: IMenu2Schema[];
}

export interface IMenu2Service {
    readonly menuChanged$: Observable<void>;

    mergeMenu(source: IMenu2Item, target?: IMenu2Item): void;

    appendRootMenu(source: IMenu2Item): void;

    getMenuByPositionKey(position: string): IMenu2Schema[];
}

export type IMenu2Item = {
    order?: number;
    menuItemFactory?: (accessor: IAccessor) => IMenuItem;
} | {
    [key: string]: IMenu2Item;
};

export class Menu2Service extends Disposable implements IMenu2Service {
    readonly menuChanged$ = new Subject<void>();

    private _menu: IMenu2Item = {
        [Menu2Position.RIBBON]: {
            [RibbonPosition.START]: {
                order: 0,
                [RibbonStartGroup.HISTORY]: {
                    order: 0,
                },
                [RibbonStartGroup.FORMAT]: {
                    order: 1,
                },
                [RibbonStartGroup.LAYOUT]: {
                    order: 2,
                },
                [RibbonStartGroup.FORMULAS_INSERT]: {
                    order: 3,
                },
                [RibbonStartGroup.FORMULAS_VIEW]: {
                    order: 4,
                },
                [RibbonStartGroup.FILE]: {
                    order: 5,
                },
                [RibbonStartGroup.OTHERS]: {
                    order: 6,
                },
            },
            [RibbonPosition.INSERT]: {
                order: 1,
                [RibbonInsertGroup.OTHERS]: {
                    order: 0,
                },
            },
            [RibbonPosition.FORMULAS]: {
                order: 2,
                [RibbonFormulasGroup.OTHERS]: {
                    order: 0,
                },
            },
            [RibbonPosition.DATA]: {
                order: 3,
                [RibbonDataGroup.OTHERS]: {
                    order: 0,
                },
            },
            [RibbonPosition.VIEW]: {
                order: 4,
                [RibbonViewGroup.OTHERS]: {
                    order: 0,
                },
            },
            [RibbonPosition.OTHERS]: {
                order: 5,
                [RibbonOthersGroup.OTHERS]: {
                    order: 0,
                },
            },
        },
        [Menu2Position.CONTEXT_MENU]: {
            [ContextMenuPosition.MAIN_AREA]: {
                order: 0,
                [ContextMenuGroup.FORMAT]: {
                    order: 0,
                },
                [ContextMenuGroup.LAYOUT]: {
                    order: 1,
                },
                [ContextMenuGroup.DATA]: {
                    order: 2,
                },
                [ContextMenuGroup.OTHERS]: {
                    order: 3,
                },
            },
            [ContextMenuPosition.COL_HEADER]: {
                order: 1,
                [ContextMenuGroup.FORMAT]: {
                    order: 0,
                },
                [ContextMenuGroup.LAYOUT]: {
                    order: 1,
                },
                [ContextMenuGroup.DATA]: {
                    order: 2,
                },
                [ContextMenuGroup.OTHERS]: {
                    order: 3,
                },
            },
            [ContextMenuPosition.ROW_HEADER]: {
                order: 2,
                [ContextMenuGroup.FORMAT]: {
                    order: 0,
                },
                [ContextMenuGroup.LAYOUT]: {
                    order: 1,
                },
                [ContextMenuGroup.DATA]: {
                    order: 2,
                },
                [ContextMenuGroup.OTHERS]: {
                    order: 3,
                },
            },
            [ContextMenuPosition.FOOTER_TABS]: {
                order: 3,
                [ContextMenuGroup.FORMAT]: {
                    order: 0,
                },
                [ContextMenuGroup.LAYOUT]: {
                    order: 1,
                },
                [ContextMenuGroup.DATA]: {
                    order: 2,
                },
                [ContextMenuGroup.OTHERS]: {
                    order: 3,
                },
            },
            [ContextMenuPosition.FOOTER_MENU]: {
                order: 4,
                [ContextMenuGroup.OTHERS]: {
                    order: 3,
                },
            },
        },
    };

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    override dispose(): void {
        this.menuChanged$.complete();
    }

    /**
     * Merge source menu to target menu recursively
     * @param source
     * @param target default is root menu
     */
    mergeMenu(source: IMenu2Item, target?: IMenu2Item): void {
        const _target = target ?? this._menu;

        for (const [key, value] of Object.entries(_target)) {
            if (key in source) {
                const _key = key as keyof IMenu2Item;
                Tools.deepMerge(_target[_key], source[_key]);

                this.menuChanged$.next();
            } else {
                this.mergeMenu(source, value);
            }
        }
    }

    appendRootMenu(source: IMenu2Item): void {
        Tools.deepMerge(this._menu, source);
        this.menuChanged$.next();
    }

    private _buildMenuSchema(data: IMenu2Item): IMenu2Schema[] {
        const result: IMenu2Schema[] = [];

        for (const [key, value] of Object.entries(data)) {
            const menuItem: Partial<IMenu2Schema> = {
                key,
                order: value.order,
            };

            if (value.menuItemFactory) {
                const item: IMenuItem = this._injector.invoke(value.menuItemFactory);

                if (item) {
                    const menuItemConfig: Nullable<IMenuItem> = this._configService.getConfig<IMenuItem>('menu');

                    if (menuItemConfig && item.id in menuItemConfig) {
                        const _key = item.id as keyof IMenuItem;
                        menuItem.item = mergeMenuConfigs(item, menuItemConfig[_key] as any);
                    } else {
                        menuItem.item = item;
                    }
                }
            }

            const children = this._buildMenuSchema(value);
            if (children.length > 0) {
                menuItem.children = children.sort((a, b) => a.order - b.order);
            }

            if (menuItem.item || menuItem.children) {
                result.push(menuItem as IMenu2Schema); // 使用类型断言补充缺失字段
            }
        }

        return result;
    }

    /**
     * Get menu schema by position key
     * @param key
     * @returns Menu schema array or empty array if not found
     */
    getMenuByPositionKey(key: string): IMenu2Schema[] {
        const findKey = (obj: any): any => {
            if (key in obj) {
                return this._buildMenuSchema(obj[key]);
            }

            for (const k in obj) {
                if (k === key) {
                    return this._buildMenuSchema(obj[k]);
                }
                if (typeof obj[k] === 'object') {
                    const result = findKey(obj[k]);
                    if (result) {
                        return result;
                    }
                }
            }
        };

        return findKey(this._menu);
    }
}
