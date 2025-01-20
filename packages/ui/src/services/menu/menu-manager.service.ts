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
import type { Observable } from 'rxjs';
import type { IMenuItem } from '../menu/menu';
import { createIdentifier, Disposable, IConfigService, Inject, Injector, merge } from '@univerjs/core';
import { Subject } from 'rxjs';
import { mergeMenuConfigs } from '../../common/menu-merge-configs';
import { ContextMenuGroup, ContextMenuPosition, MenuManagerPosition, RibbonDataGroup, RibbonFormulasGroup, RibbonInsertGroup, RibbonOthersGroup, RibbonPosition, RibbonStartGroup, RibbonViewGroup } from './types';

export const IMenuManagerService = createIdentifier<IMenuManagerService>('univer.menu-manager-service');

export interface IMenuSchema {
    key: string;
    order: number;
    item?: IMenuItem;
    children?: IMenuSchema[];
}

export interface IMenuManagerService {
    readonly menuChanged$: Observable<void>;

    mergeMenu(source: MenuSchemaType, target?: MenuSchemaType): void;

    appendRootMenu(source: MenuSchemaType): void;

    getMenuByPositionKey(position: string): IMenuSchema[];
}

export type MenuSchemaType = {
    order?: number;
    menuItemFactory?: (accessor: IAccessor) => IMenuItem;
} | {
    [key: string]: MenuSchemaType;
};

export class MenuManagerService extends Disposable implements IMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    private _menu: MenuSchemaType = {
        [MenuManagerPosition.RIBBON]: {
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
        [MenuManagerPosition.CONTEXT_MENU]: {
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
    mergeMenu(source: MenuSchemaType, target?: MenuSchemaType): void {
        const _target = target ?? this._menu;

        for (const [key, value] of Object.entries(_target)) {
            if (key in source) {
                const _key = key as keyof MenuSchemaType;
                _target[_key] = merge({}, _target[_key], source[_key]);

                this.menuChanged$.next();
            } else {
                this.mergeMenu(source, value);
            }
        }
    }

    appendRootMenu(source: MenuSchemaType): void {
        this._menu = merge({}, this._menu, source);
        this.menuChanged$.next();
    }

    private _buildMenuSchema(data: MenuSchemaType): IMenuSchema[] {
        const result: IMenuSchema[] = [];

        for (const [key, value] of Object.entries(data)) {
            const menuItem: Partial<IMenuSchema> = {
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
                result.push(menuItem as IMenuSchema); // 使用类型断言补充缺失字段
            }
        }

        return result;
    }

    /**
     * Get menu schema by position key
     * @param key
     * @returns Menu schema array or empty array if not found
     */
    getMenuByPositionKey(key: string): IMenuSchema[] {
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
