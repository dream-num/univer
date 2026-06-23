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

type MenuLabel = string | {
    name: string;
    hoverable?: boolean;
    selectable?: boolean;
    props?: Record<string, any>;
};

interface IMenuItemBase<TLocaleKey extends string, TValue> {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;

    /**
     * If two menus reuse the same command (e.g. copy & paste command). They should have the same command
     * id and different ids.
     */
    commandId?: string;

    subId?: string;
    title?: TLocaleKey;
    description?: string;
    icon?: string | Observable<string>;
    tooltip?: TLocaleKey;
    slot?: boolean;
    type: MenuItemType;
    /**
     * Custom label component id.
     */
    label?: MenuLabel; // custom component, send to CustomLabel label property

    hidden$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
    params?: any | Function;
    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<TValue>;
}

export interface IMenuButtonItem<TLocaleKey extends string = string, TValue = undefined> extends IMenuItemBase<TLocaleKey, TValue> {
    type: MenuItemType.BUTTON;

    activated$?: Observable<boolean>;
}

export interface IValueOption<TLocaleKey extends string = string, TValue = undefined> {
    id?: string;
    value?: string | number;
    value$?: Observable<TValue>;
    params?: any;
    slot?: boolean;
    label?: MenuLabel; // custom component, send to CustomLabel label property
    icon?: string;
    tooltip?: TLocaleKey;
    style?: object;
    disabled?: boolean;
    commandId?: string;
}

export interface ICustomComponentProps<T> {
    value: T;
    onChange: (v: T) => void;
}

export interface IMenuSelectorItem<
    TLocaleKey extends string = string,
    TValue = MenuItemDefaultValueType,
    TOptionValue = undefined
> extends IMenuItemBase<TLocaleKey, TValue> {
    type: MenuItemType.SELECTOR | MenuItemType.BUTTON_SELECTOR | MenuItemType.SUBITEMS;

    /**
     * If this property is set, changing the value of the selection will trigger the command with this id,
     * instead of {@link IMenuItemBase.id} or {@link IMenuItemBase.commandId}. At the same title,
     * clicking the button will trigger IMenuItemBase.id or IMenuItemBase.commandId.
     */
    selectionsCommandId?: string;

    // selections submenu can be of three types
    // One is the current menu's options, after selection directly use its value to trigger command
    // One is a special component, such as color picker, after selection directly use its value to trigger command
    // One is another menu's id, directly rendered as another menu
    /** Options or IDs of registered components. */
    selections?: Array<IValueOption<TLocaleKey, TOptionValue>> | Observable<Array<IValueOption<TLocaleKey, TOptionValue>>>;

    /** If `type` is `MenuItemType.BUTTON_SELECTOR`, this determines if the button is activated. */
    activated$?: Observable<boolean>;
}

export type MenuItemDefaultValueType = string | number | undefined;

export type IMenuItem<TLocaleKey extends string = string> =
    | IMenuButtonItem<TLocaleKey, MenuItemDefaultValueType>
    | IMenuSelectorItem<TLocaleKey, MenuItemDefaultValueType, any>;

export function isMenuSelectorItem<T extends MenuItemDefaultValueType, TLocaleKey extends string = string>(
    v: IMenuItem<TLocaleKey>
): v is IMenuSelectorItem<TLocaleKey, T, any> {
    return v.type === MenuItemType.SELECTOR || v.type === MenuItemType.SUBITEMS;
}

export function isMenuButtonSelectorItem<T extends MenuItemDefaultValueType, TLocaleKey extends string = string>(
    v: IMenuItem<TLocaleKey>
): v is IMenuSelectorItem<TLocaleKey, T, any> {
    return v.type === MenuItemType.BUTTON_SELECTOR;
}

export type IDisplayMenuItem<T extends IMenuItem = IMenuItem> = T & {
    shortcut?: string;
};

export type MenuItemConfig<TLocaleKey extends string = string> = Partial<Omit<IMenuItem<TLocaleKey>, 'id' | 'subId' | 'value$' | 'hidden$' | 'disabled$' | 'activated$' | 'icon$'> & {
    hidden?: boolean;
    disabled?: boolean;
    activated?: boolean;
}>;
export type MenuConfig<TLocaleKey extends string = string> = Record<string, MenuItemConfig<TLocaleKey>>;
export type IMenuItemFactory<TLocaleKey extends string = string> = (accessor: IAccessor, menuConfig?: MenuConfig<TLocaleKey>) => IMenuItem<TLocaleKey>;
