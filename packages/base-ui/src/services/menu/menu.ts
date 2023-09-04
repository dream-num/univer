import { Observable } from 'rxjs';
import { ComponentChildren } from 'preact';

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
    DROPDOWN,
}

interface IMenuItemBase {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tooltip?: string;

    /** @deprecated this type seems unnecessary */
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
    disabled?: boolean;
}

export function isValueOptions(v: IValueOption | ICustomComponentOption): v is IValueOption {
    return typeof (v as IValueOption).value !== 'undefined';
}

export interface ICustomComponentOption {
    id: string;
}

export interface ICustomComponentProps<T> {
    value: T;
    onValueChange: (v: T) => void;
}

export function isCustomComponentOption(v: IValueOption | ICustomComponentOption): v is ICustomComponentOption {
    return typeof (v as ICustomComponentOption).id !== 'undefined';
}

export interface IMenuSelectorItem<V> extends IMenuItemBase {
    type: MenuItemType.SELECTOR | MenuItemType.DROPDOWN;

    /** Determines how the label of the selector should display. */
    display?: DisplayTypes;

    /** @deprecated this parameter would be removed after we complete refactoring */
    selectType: SelectTypes;

    // selections 子菜单可以为三种类型
    // 一个是当前 menu 的 options，选中后直接使用其 value 触发 command
    // 一个是一个特殊组件，比如 color picker，选中后直接使用其 value 触发 command
    // 一个是其他 menu 的 id，直接渲染成其他的 menu
    /** Options or IDs of registered components. */
    selections?: Array<IValueOption | ICustomComponentOption>;

    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<V>;
}

export type IMenuItem = IMenuButtonItem | IMenuSelectorItem<unknown>;

export type IDisplayMenuItem<T extends IMenuItem> = T & {
    shortcut?: string;
};
