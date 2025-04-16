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

import type { IAccessor } from '@univerjs/core';
import type { Observable } from 'rxjs';

export type OneOrMany<T> = T | T[];

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

    /**
     * If two menus reuse the same command (e.g. copy & paste command). They should have the same command
     * id and different ids.
     */
    commandId?: string;

    subId?: string;
    title?: string;
    description?: string;
    icon?: string | Observable<string>;
    tooltip?: string;
    slot?: boolean;
    type: MenuItemType;
    /**
     * Custom label component id.
     */
    label?:
    | string
    | {
        name: string;
        hoverable?: boolean;
        selectable?: boolean;
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
    id?: string;
    value?: string | number;
    value$?: Observable<T>;
    slot?: boolean;
    label?:
    | string
    | {
        name: string;
        hoverable?: boolean;
        selectable?: boolean;
        props?: Record<string, string | number | Array<{ [x: string | number]: string }>>;
    }; // custom component, send to CustomLabel label property
    icon?: string;
    tooltip?: string;
    style?: object;
    disabled?: boolean;
    commandId?: string;
}

export interface ICustomComponentProps<T> {
    value: T;
    onChange: (v: T) => void;
}

export interface IMenuSelectorItem<V = MenuItemDefaultValueType, T = undefined> extends IMenuItemBase<V> {
    type: MenuItemType.SELECTOR | MenuItemType.BUTTON_SELECTOR | MenuItemType.SUBITEMS;

    /**
     * If this property is set, changing the value of the selection will trigger the command with this id,
     * instead of {@link IMenuItemBase.id} or {@link IMenuItemBase.commandId}. At the same title,
     * clicking the button will trigger IMenuItemBase.id or IMenuItemBase.commandId.
     */
    selectionsCommandId?: string;

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

export type IMenuItem = IMenuButtonItem<MenuItemDefaultValueType> | IMenuSelectorItem<MenuItemDefaultValueType, any>;

export type IDisplayMenuItem<T extends IMenuItem> = T & {
    shortcut?: string;
};

export type MenuItemConfig = Partial<Omit<IMenuItem, 'id' | 'subId' | 'value$' | 'hidden$' | 'disabled$' | 'activated$' | 'icon$'> & {
    hidden?: boolean;
    disabled?: boolean;
    activated?: boolean;
}>;
export type MenuConfig = Record<string, MenuItemConfig>;
export type IMenuItemFactory = (accessor: IAccessor, menuConfig?: MenuConfig) => IMenuItem;
