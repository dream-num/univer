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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { AiSingle, BarChartSingle, CommentSingle } from '@univerjs/icons';
import { ComponentManager, ContextMenuGroup, ContextMenuPosition, IMenuManagerService, MenuItemType, RibbonStartGroup } from '@univerjs/ui';
import { DropdownListFirstItemOperation, DropdownListSecondItemOperation } from '../commands/operations/dropdown-list.operation';
import { SingleButtonOperation } from '../commands/operations/single-button.operation';
import { CUSTOM_MENU_DROPDOWN_LIST_OPERATION_ID, CustomMenuItemDropdownListFirstItemFactory, CustomMenuItemDropdownListMainButtonFactory, CustomMenuItemDropdownListSecondItemFactory } from './menu/dropdown-list.menu';
import { CustomMenuItemSingleButtonFactory } from './menu/single-button.menu';

export class CustomMenuController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCommands();
        this._registerComponents();
        this._initMenus();
    }

  /**
   * register commands
   */
    private _initCommands(): void {
        [
            SingleButtonOperation,
            DropdownListFirstItemOperation,
            DropdownListSecondItemOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

  /**
   * register icon components
   */
    private _registerComponents(): void {
        this.disposeWithMe(this._componentManager.register('ButtonIcon', AiSingle));
        this.disposeWithMe(this._componentManager.register('ItemIcon', BarChartSingle));
        this.disposeWithMe(this._componentManager.register('MainButtonIcon', CommentSingle));
    }

  /**
   * register menu items
   */
    private _initMenus(): void {
        const largeDropdownList = Array.from({ length: 15 }, (_, i) => ({
            order: 20 + i,
            menuItemFactory: () => {
                return {
                    id: `${DropdownListSecondItemOperation.id}-${i}`,
                    type: MenuItemType.BUTTON,
                    title: 'customMenu.itemTwo',
                    icon: 'ItemIcon',
                };
            },
        }));
        this._menuManagerService.mergeMenu({
            [RibbonStartGroup.OTHERS]: {
                [SingleButtonOperation.id]: {
                    order: 9999,
                    menuItemFactory: CustomMenuItemSingleButtonFactory,
                },
                [CUSTOM_MENU_DROPDOWN_LIST_OPERATION_ID]: {
                    order: 9998.5,
                    menuItemFactory: CustomMenuItemDropdownListMainButtonFactory,
                    [DropdownListFirstItemOperation.id]: {
                        order: 0,
                        menuItemFactory: CustomMenuItemDropdownListFirstItemFactory,
                    },
                    [DropdownListSecondItemOperation.id]: {
                        order: 1,
                        menuItemFactory: CustomMenuItemDropdownListSecondItemFactory,
                    },
                    ...largeDropdownList,
                },
            },
            [ContextMenuPosition.MAIN_AREA]: {
                [ContextMenuGroup.OTHERS]: {
                    [SingleButtonOperation.id]: {
                        order: 9999,
                        menuItemFactory: CustomMenuItemSingleButtonFactory,
                    },
                    [CUSTOM_MENU_DROPDOWN_LIST_OPERATION_ID]: {
                        order: 9998,
                        menuItemFactory: CustomMenuItemDropdownListMainButtonFactory,
                        [DropdownListFirstItemOperation.id]: {
                            order: 0,
                            menuItemFactory: CustomMenuItemDropdownListFirstItemFactory,
                        },
                        [DropdownListSecondItemOperation.id]: {
                            order: 1,
                            menuItemFactory: CustomMenuItemDropdownListSecondItemFactory,
                        },
                    },
                },
            },
        });
    }
}
