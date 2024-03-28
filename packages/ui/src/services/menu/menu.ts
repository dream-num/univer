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

import type { IAccessor } from '@wendellhu/redi';
import type { Observable } from 'rxjs';

export type OneOrMany<T> = T | T[];

export enum MenuPosition {
    VOID = 'void',
    TOOLBAR_START = 'uiToolbar.start',
    TOOLBAR_INSERT = 'uiToolbar.insert',
    TOOLBAR_FORMULAS = 'uiToolbar.formulas',
    TOOLBAR_DATA = 'uiToolbar.data',
    TOOLBAR_VIEW = 'uiToolbar.view',
    TOOLBAR_OTHERS = 'uiToolbar.others',
    CONTEXT_MENU = 'contextMenu',
}

export enum MenuGroup {
    TOOLBAR_HISTORY,
    TOOLBAR_FORMAT,
    TOOLBAR_LAYOUT,
    TOOLBAR_FORMULAS_INSERT,
    TOOLBAR_FORMULAS_VIEW,
    TOOLBAR_FILE,
    TOOLBAR_OTHERS,

    CONTEXT_MENU_FORMAT,
    CONTEXT_MENU_LAYOUT,
    CONTEXT_MENU_DATA,
    CONTEXT_MENU_OTHERS,
}

export enum MenuItemType {
    /** Button style menu item. */
    BUTTON,
    /** Menu item with submenus. Submenus could be other IMenuItem or an ID of a registered component. */
    SELECTOR,
    /** Button style menu item with a dropdown menu. */
    BUTTON_SELECTOR,
    /** Submenus have to specific features and do not invoke commands. */
    SUBITEMS,
}

interface IMenuItemBase<V> {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;
    subId?: string;
    title?: string;
    description?: string;
    icon?: string | Observable<string>;
    tooltip?: string;

    /** The group that the item belongs to. */
    group?: MenuGroup;

    /** In what menu should the item display. */
    positions: OneOrMany<MenuPosition | string>;

    type: MenuItemType;

    /**
     * Custom label component id.
     */
    label?:
        | string
        | {
            name: string;
            hoverable?: boolean;
            props?: Record<string, any>;
        }; // custom component, send to CustomLabel label property

    hidden$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<V>;
}

export interface IMenuButtonItem<V = undefined> extends IMenuItemBase<V> {
    type: MenuItemType.BUTTON;

    activated$?: Observable<boolean>;
}

export interface IValueOption<T = undefined> {
    value?: string | number;
    value$?: Observable<T>;
    label?:
        | string
        | {
            name: string;
            hoverable?: boolean;
            props?: Record<string, string | number | Array<{ [x: string | number]: string }>>;
        }; // custom component, send to CustomLabel label property
    icon?: string;
    tooltip?: string;
    style?: object;
    disabled?: boolean;
    id?: string; // command id
}

export interface ICustomComponentProps<T> {
    value: T;
    onChange: (v: T) => void;
}

export interface IMenuSelectorItem<V = MenuItemDefaultValueType, T = undefined> extends IMenuItemBase<V> {
    type: MenuItemType.SELECTOR | MenuItemType.BUTTON_SELECTOR | MenuItemType.SUBITEMS;

    // selections 子菜单可以为三种类型
    // 一个是当前 menu 的 options，选中后直接使用其 value 触发 command
    // 一个是一个特殊组件，比如 color picker，选中后直接使用其 value 触发 command
    // 一个是其他 menu 的 id，直接渲染成其他的 menu
    /** Options or IDs of registered components. */
    selections?: Array<IValueOption<T>> | Observable<Array<IValueOption<T>>>;

    /** If `type` is `MenuItemType.BUTTON_SELECTOR`, this determines if the button is activated. */
    activated$?: Observable<boolean>;
}

export function isMenuSelectorItem<T extends MenuItemDefaultValueType>(v: IMenuItem): v is IMenuSelectorItem<T> {
    return v.type === MenuItemType.SELECTOR || v.type === MenuItemType.SUBITEMS;
}

export type MenuItemDefaultValueType = string | number | undefined;

export type IMenuItem = IMenuButtonItem | IMenuSelectorItem<MenuItemDefaultValueType>;

export type IDisplayMenuItem<T extends IMenuItem> = T & {
    shortcut?: string;
};

export type IMenuItemFactory = (accessor: IAccessor) => IMenuItem;
