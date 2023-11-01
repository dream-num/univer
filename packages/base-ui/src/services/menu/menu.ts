import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

export type OneOrMany<T> = T | T[];

export const enum MenuPosition {
    VOID = 'void',
    TOOLBAR_START = 'uiToolbar.start',
    TOOLBAR_INSERT = 'uiToolbar.insert',
    TOOLBAR_FORMULAS = 'uiToolbar.formulas',
    TOOLBAR_DATA = 'uiToolbar.data',
    TOOLBAR_VIEW = 'uiToolbar.view',
    TOOLBAR_OTHERS = 'uiToolbar.others',
    CONTEXT_MENU = 'contextMenu',
}

export const enum MenuGroup {
    TOOLBAR_HISTORY,
    TOOLBAR_OTHERS,
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
    subId?: string;
    title?: string;
    description?: string;
    icon?: string;
    tooltip?: string;

    /** The group that the item belongs to. */
    group?: MenuGroup;

    /** In what menu should the item display. */
    positions: OneOrMany<MenuPosition | string>;

    /** @deprecated this type seems unnecessary */
    type: MenuItemType;
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
    onClose?: () => void;

    // FIXME@wzhudev: this parameters should not appear here

    /**
     * e.g. set cell text size, rotation angle of the text
     */
    max?: number;

    /**
     * Set the minimum value of the digital input box
     */
    min?: number;
}

export interface IMenuButtonItem<V = undefined> extends IMenuItemBase<V> {
    type: MenuItemType.BUTTON;

    activated$?: Observable<boolean>;
}

export interface IValueOption {
    value: string | number;
    label:
        | string
        | {
              name: string;
              props?: Record<string, string | number>;
          }; // custom component, send to NeoCustomLabel label property
    icon?: string;
    tooltip?: string;
    style?: object;
    disabled?: boolean;
    id?: string; // command id
    show?: boolean; // show parent menu or not
    showAfterClick?: boolean; // show children when clicked or not,暂时性做法
}

export function isValueOptions(v: IValueOption | ICustomComponentOption): v is IValueOption {
    return typeof (v as IValueOption).value !== 'undefined';
}

export interface ICustomComponentOption {
    id: string;
    disabled?: boolean;
}

export interface ICustomComponentProps<T> {
    value: T;
    onChange: (v: T) => void;
}

export function isCustomComponentOption(v: IValueOption | ICustomComponentOption): v is ICustomComponentOption {
    return typeof (v as ICustomComponentOption).id !== 'undefined';
}

export interface IMenuSelectorItem<V = MenuItemDefaultValueType> extends IMenuItemBase<V> {
    type: MenuItemType.SELECTOR | MenuItemType.SUBITEMS;

    // selections 子菜单可以为三种类型
    // 一个是当前 menu 的 options，选中后直接使用其 value 触发 command
    // 一个是一个特殊组件，比如 color picker，选中后直接使用其 value 触发 command
    // 一个是其他 menu 的 id，直接渲染成其他的 menu
    /** Options or IDs of registered components. */
    selections?:
        | Array<IValueOption | ICustomComponentOption>
        | Observable<Array<IValueOption | ICustomComponentOption>>;
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
