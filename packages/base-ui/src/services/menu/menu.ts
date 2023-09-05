import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { DisplayTypes, SelectTypes } from '../../Components/Select/Select';

export type OneOrMany<T> = T | T[];

export const enum MenuPosition {
    VOID = 'void',
    TOOLBAR = 'toolbar',
    CONTEXT_MENU = 'contextMenu',
    TAB_CONTEXT_MENU = 'tabContextMenu',
    ROW_HEADER_CONTEXT_MENU = 'rowHeaderContextMenu',
    COL_HEADER_CONTEXT_MENU = 'colHeaderContextMenu',
    SHEET_BAR = 'sheetBar',
}

export const enum MenuItemType {
    /** Button style menu item. */
    BUTTON,
    /** Menu item with submenus. Submenus could be other IMenuItem or an ID of a registered component. */
    SELECTOR,
    /** Submenus have to specific features and do not invoke commands. */
    SUBITEMS,
}

interface IMenuItemBase<V> {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tooltip?: string;

    /** In what menu should the item display. */
    positions: OneOrMany<MenuPosition | string>;

    /** @deprecated this type seems unnecessary */
    type: MenuItemType;
    /** Determines how the label of the selector should display. */
    display?: DisplayTypes;
    /**
     * Custom label component id.
     * */
    label?:
        | string
        | {
              name: string;
              props?: Record<string, string | number>;
          };

    hidden$?: Observable<boolean>;
    disabled$?: Observable<boolean>;
    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<V>;
}

export interface IMenuButtonItem<V = undefined> extends IMenuItemBase<V> {
    type: MenuItemType.BUTTON;

    activated$?: Observable<boolean>;

    // TODO@wzhudev: I may deprecate this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (...arg: any) => void; // menu button click callback, does not trigger command.  e.g. sheet bar rename
}

export function isMenuButtonItem(v: IMenuItem): v is IMenuButtonItem {
    return v.type === MenuItemType.BUTTON;
}

export interface IValueOption {
    value: string | number;
    label: string; // custom component, send to NeoCustomLabel label property
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
    props?: Record<string, string | number>; // custom property by component
}

export interface ICustomComponentProps<T> {
    value: T;
    onChange: (v: T) => void;
}

export function isCustomComponentOption(v: IValueOption | ICustomComponentOption): v is ICustomComponentOption {
    return typeof (v as ICustomComponentOption).id !== 'undefined';
}

export interface IMenuSelectorItem<V> extends IMenuItemBase<V> {
    type: MenuItemType.SELECTOR | MenuItemType.SUBITEMS;

    /** @deprecated this parameter would be removed after we complete refactoring, because they will be all NEO */
    selectType: SelectTypes;

    // selections 子菜单可以为三种类型
    // 一个是当前 menu 的 options，选中后直接使用其 value 触发 command
    // 一个是一个特殊组件，比如 color picker，选中后直接使用其 value 触发 command
    // 一个是其他 menu 的 id，直接渲染成其他的 menu
    /** Options or IDs of registered components. */
    selections?: Array<IValueOption | ICustomComponentOption>;
}

export function isMenuSelectorItem<T>(v: IMenuItem): v is IMenuSelectorItem<T> {
    return v.type === MenuItemType.SELECTOR || v.type === MenuItemType.SUBITEMS;
}

export type IMenuItem = IMenuButtonItem | IMenuSelectorItem<unknown>;

export type IDisplayMenuItem<T extends IMenuItem> = T & {
    shortcut?: string;
};

export type IMenuItemFactory = (accessor: IAccessor) => IMenuItem;
