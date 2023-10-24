import { isRealNum } from '@univerjs/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { isObservable, of } from 'rxjs';

import { AppContext } from '../../Common/AppContext';
import {
    ICustomComponentOption,
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    isValueOptions,
    IValueOption,
    MenuItemDefaultValueType,
    MenuItemType,
} from '../../services/menu/menu';
import { IMenuService } from '../../services/menu/menu.service';
import { joinClassNames } from '../../Utils';
import { NeoCustomLabel } from '../CustomLabel/CustomLabel';
import { useObservable } from '../hooks/observable';
import { BaseMenuItem } from '../Item/Item';
import { DisplayTypes } from '../Select/Select';
import styles from './index.module.less';

/** @deprecated */
export interface BaseMenuProps {
    /** @deprecated */
    onClick?: (...arg: any) => void;
    /** @deprecated */
    className?: string;
    /** @deprecated */
    style?: React.CSSProperties;
    /** @deprecated */
    parent?: boolean;
    /** @deprecated */
    deep?: number;
    /** @deprecated this is legacy menu mechanism. Do not use it. Use `menuItems` instead. */
    menu?: BaseMenuItem[]; // TODO: should be renamed to `items`

    // NOTE: options above are legacy. They are going to be removed after we complete refactoring.

    display?: DisplayTypes;
    menuId?: string;
    value?: string | number;
    options?: Array<IValueOption | ICustomComponentOption>;
    onOptionSelect?: (option: IValueOption) => void;
    onClose?: () => void;
    show?: boolean;
    clientPosition?: {
        clientX: number;
        clientY: number;
    }; //Right-click menu adaptive position, send the location of the mouse click
}

/** @deprecated */
export type BaseMenuStyle = {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
};

// export interface IBaseMenuState {
//     show: boolean;
//     posStyle: BaseMenuStyle;
//     menuItems: Array<IDisplayMenuItem<IMenuItem>>;
// } // Replace with your utility function import

// interface IValueOption {
//     value: string | number;
//     label: string;
//     icon?: string;
//     disabled?: boolean;
// }

// interface ICustomComponentOption {
//     id: string;
//     disabled?: boolean;
// }

// interface BaseMenuItem {
//     show?: boolean;
//     className?: string;
//     style?: React.CSSProperties;
//     label: string;
//     children?: BaseMenuItem[];
//     border?: boolean;
//     disabled?: boolean;
//     onClick?: (e: MouseEvent, value: string | number, index: number, deep: number) => void;
// }

// type DisplayTypes = 'block' | 'inline' | 'none';

// type BaseMenuStyle = React.CSSProperties;

// interface BaseMenuProps {
//     display?: DisplayTypes;
//     menuId?: string;
//     value?: string | number;
//     options?: Array<IValueOption | ICustomComponentOption>;
//     onOptionSelect?: (option: IValueOption) => void;
// }

/** @deprecated */
export const Menu = (props: BaseMenuProps) => {
    const {
        display,
        menuId,
        value,
        options,
        onOptionSelect,
        parent,
        onClick,
        deep = 0,
        menu = [],
        className = '',
        style = {},
        show = false,
        clientPosition,
    } = props;
    const context = useContext(AppContext);
    const [isShow, setIsShow] = useState(show);
    const [posStyle, setPosStyle] = useState<BaseMenuStyle>({});
    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);
    const MenuRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        getSubMenus();
    }, [menuId]);

    useEffect(() => {
        const { show = false } = props;

        showMenu(show);
    }, [props.show]);

    useEffect(() => {
        const { clientPosition } = props;
        if (!clientPosition) return;
        const { clientX = 0, clientY = 0 } = clientPosition;
        setAutoPosition(clientX, clientY);
    }, [props.clientPosition]);

    const showMenu = (show: boolean) => {
        if (!show) {
            props.onClose?.();
        }
        setIsShow(show);
        getStyle();
    };

    const getStyle = () => {
        const current = MenuRef.current;
        if (!current) return;
        const style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        const docPosition = {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight,
        };

        // Nested submenus
        if (parent) {
            current.style.position = 'fixed';
            const parPosition = current.parentElement?.getBoundingClientRect();
            if (!parPosition) return;
            if (parPosition.right + curPosition.width > docPosition.right) {
                style.left = `${parPosition.left - curPosition.width}px`;
                style.top = `${parPosition.top}px`;
            } else {
                style.left = `${parPosition.right}px`;
                style.top = `${parPosition.top}px`;
            }
            if (curPosition.bottom > docPosition.bottom) {
                style.top = 'auto';
                style.bottom = `5px`;
            }
            setPosStyle(style);
        }
    };

    const setAutoPosition = (clientX: number, clientY: number) => {
        const current = MenuRef.current;
        if (!current) return;
        const style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        const docPosition = {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight,
        };

        const screenW = docPosition.right;
        const screenH = docPosition.bottom;
        const clickX = clientX;
        const clickY = clientY;
        const rootW = curPosition.width;
        const rootH = curPosition.height;

        // right is true, which means that the width from the mouse click position to the right border of the browser can be used to place the menu. Otherwise, the menu is moved to the left.
        // bottom is true, which means that the menu can be dropped from the height of the mouse click position to the lower border of the browser. Otherwise, the menu is placed above.
        const right = screenW - clickX > rootW;
        const left = !right;
        const bottom = screenH - clickY > rootH;
        const top = !bottom;

        if (right) {
            style.left = `${clickX}px`;
        }

        if (left) {
            style.left = `${clickX - rootW}px`;
        }

        if (bottom) {
            style.top = `${clickY}px`;
        }
        if (top) {
            style.top = `${clickY - rootH}px`;
        }

        setPosStyle(style);
    };

    const getSubMenus = () => {
        if (menuId) {
            const menuService = context.injector?.get(IMenuService); // Assuming context is available
            if (!menuService) {
                throw new Error('menuService is not defined');
            }
            setMenuItems(menuService.getMenuItems(menuId));
        }
    };

    return (
        <ul
            className={joinClassNames(styles.colsMenu, className)}
            style={{ ...style, ...posStyle, display: isShow ? 'block' : 'none' }}
            ref={MenuRef}
        >
            {/* legacy: render selections */}
            {options?.map((option: IValueOption | ICustomComponentOption, index: number) => {
                const isValueOption = isValueOptions(option);
                if (isValueOption) {
                    return (
                        <li
                            key={index}
                            className={joinClassNames(
                                styles.colsMenuitem,
                                option.disabled ? styles.colsMenuitemDisabled : ''
                                // String(value) === String(option.value) ? styles.selectItemSelected : '' // Set the background color of Item
                            )}
                            onClick={() => {
                                // Execute the callback function
                                // if (option.value) { // color picker cancel use ''
                                onOptionSelect?.({
                                    ...option,
                                    show: option.showAfterClick,
                                });
                                // }
                            }}
                        >
                            <NeoCustomLabel
                                selected={String(value) === String(option.value)} // use √ for select
                                value={String(option.value)}
                                display={display}
                                label={option.label}
                                title={typeof option.label === 'string' ? option.label : ''}
                                icon={option.icon}
                            />
                        </li>
                    );
                }

                const CustomComponent = context.componentManager?.get(option.id) as React.ComponentType<any>;
                return (
                    <li
                        key={index}
                        className={joinClassNames(
                            styles.colsMenuitem,
                            option.disabled ? styles.colsMenuitemDisabled : ''
                        )}
                    >
                        <CustomComponent
                            onValueChange={(v: string | number) => {
                                onOptionSelect?.({
                                    value: v,
                                    label: option.id,
                                });
                            }}
                        />
                    </li>
                );
            })}
            {/* render submenus */}
            {menuItems?.map((item: IDisplayMenuItem<IMenuItem>, index) => (
                <MenuItem
                    menuItem={item}
                    key={index}
                    index={index}
                    onClick={(object: Partial<IValueOption>) => {
                        onOptionSelect?.({ value: '', label: item.id, ...object });
                    }}
                />
            ))}
        </ul>
    );
};

export interface IMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    index: number;
    onClick: (params: Partial<IValueOption>) => void;
}

export interface IMenuItemState {
    disabled: boolean;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    value: any;
}

export function MenuItem({ menuItem, index, onClick }: IMenuItemProps) {
    const context = useContext(AppContext);
    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);
    const [itemShow, setItemShow] = useState<boolean>(false);

    const mouseEnter = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        setItemShow(true);
    };

    const mouseLeave = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        setItemShow(false);
    };

    const getSubMenus = () => {
        const { id } = menuItem;

        if (id) {
            const menuService = context.injector?.get(IMenuService);
            menuService && setMenuItems(menuService.getMenuItems(id));
        }
    };

    useEffect(() => {
        getSubMenus();

        return () => {};
    }, [menuItem]);

    const disabled = useObservable<boolean>(menuItem.disabled$ || of(false), false, true);
    const hidden = useObservable(menuItem.hidden$ || of(false), false, true);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$ || of(undefined), undefined, true);
    const [inputValue, setInputValue] = useState(value);

    /**
     * user input change value from CustomLabel
     * @param e
     */
    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? parseInt(v) : v;
        setInputValue(newValue);
    };

    let selections: Array<IValueOption | ICustomComponentOption>;
    if (menuItem.type === MenuItemType.SELECTOR) {
        if (isObservable(menuItem.selections)) {
            selections = useObservable<Array<IValueOption | ICustomComponentOption>>(
                menuItem.selections || of([]),
                [],
                true
            );
        } else {
            selections = menuItem.selections || [];
        }
    }
    const renderButtonType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
        const { title, display, label } = item;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                // disabled={disabled} // FIXME disabled is not working
                onClick={() => {
                    // commandService.executeCommand(item.id, { value });// move to business components
                    onClick({ value: inputValue, id: item.id }); // merge cell
                }}
            >
                <NeoCustomLabel
                    display={display}
                    value={inputValue}
                    title={title}
                    label={label}
                    onChange={onChange}
                    onValueChange={() => {
                        // Right-click the menu for the title bar, and the Enter key triggers after entering the row height
                        onClick({ value: inputValue, id: item.id });
                    }}
                ></NeoCustomLabel>
            </li>
        );
    };

    const renderSelectorType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => mouseEnter(e, index)}
                onMouseLeave={(e) => mouseLeave(e, index)}
                // onClick={(e) => handleClick(e, item, index)} // Nested select without click events, like border style
            >
                <NeoCustomLabel
                    title={item.title}
                    value={inputValue}
                    onChange={onChange}
                    icon={item.icon}
                    display={item.display}
                    label={item.label}
                    max={item.max}
                    min={item.min}
                ></NeoCustomLabel>
                {item.shortcut && ` (${item.shortcut})`}
                {(menuItems.length > 0 || selections?.length > 0) && (
                    <Menu
                        show={itemShow}
                        onOptionSelect={(v) => {
                            // commandService.executeCommand(item.id, { value: v.value });
                            onClick({ value: v.value, id: item.id, show: true }); // border style don't trigger hide menu, set show true
                            setItemShow(false); // hide current menu
                        }}
                        menuId={item.id}
                        options={selections}
                        display={item.display}
                        parent={true}
                    ></Menu>
                )}
            </li>
        );
    };

    const renderSubItemsType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <li
                className={joinClassNames(styles.colsMenuitem, disabled ? styles.colsMenuitemDisabled : '')}
                onMouseEnter={(e) => mouseEnter(e, index)}
                onMouseLeave={(e) => mouseLeave(e, index)}
                // onClick={(e) => handleClick(e, item, index)} // Nested menus without click events, like right menu delete cell
            >
                <NeoCustomLabel
                    title={item.title}
                    value={item.title}
                    icon={item.icon}
                    display={item.display}
                    label={item.label}
                ></NeoCustomLabel>
                {(menuItems.length > 0 || selections?.length) && (
                    <Menu
                        show={itemShow}
                        menuId={item.id}
                        display={item.display}
                        parent={true}
                        onOptionSelect={onClick}
                    ></Menu>
                )}
            </li>
        );
    };

    if (hidden) {
        return null;
    }

    return (
        <>
            {menuItem.type === MenuItemType.SELECTOR && renderSelectorType()}
            {menuItem.type === MenuItemType.SUBITEMS && renderSubItemsType()}
            {menuItem.type !== MenuItemType.SELECTOR && menuItem.type !== MenuItemType.SUBITEMS && renderButtonType()}
        </>
    );
}
