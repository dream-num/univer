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

import { isRealNum } from '@univerjs/core';

import {
    Menu as DesignMenu,
    MenuItem as DesignMenuItem,
    MenuItemGroup as DesignMenuItemGroup,
    SubMenu as DesignSubMenu,
} from '@univerjs/design';
import { CheckMarkSingle, MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useState } from 'react';
import { isObservable } from 'rxjs';

import type {
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemDefaultValueType,
} from '../../services/menu/menu';
import { MenuGroup, MenuItemType } from '../../services/menu/menu';
import { IMenuService } from '../../services/menu/menu.service';
import { CustomLabel } from '../custom-label/CustomLabel';
import { useObservable } from '../hooks/observable';
import { useScrollYOverContainer } from '../hooks/layout.ts';
import { ILayoutService } from '../../services/layout/layout.service';
import styles from './index.module.less';

// TODO: @jikkai disabled and hidden are not working

export interface IBaseMenuProps {
    parentKey?: string | number;
    menuType?: string | string[];

    value?: string | number;
    options?: IValueOption[];
    /**
     * The menu will show scroll on it over viewport height
     * Recommend that you use this prop when displaying menu overlays in Dropdown
     */
    overViewport?: 'scroll';
    onOptionSelect?: (option: IValueOption) => void;
}

function MenuWrapper(props: IBaseMenuProps) {
    const { menuType, onOptionSelect } = props;
    const menuService = useDependency(IMenuService);

    if (!menuType) return;

    if (Array.isArray(menuType)) {
        const menuTypes = menuType.map((type) => menuService.getMenuItems(type));

        const group = menuTypes.map((menuItems) =>
            menuItems.reduce(
                (acc, item: IDisplayMenuItem<IMenuItem>) => {
                    if (item.group) {
                        acc[item.group] = acc[item.group] ?? [];
                        acc[item.group].push(item);
                    } else {
                        acc[MenuGroup.CONTEXT_MENU_OTHERS] = acc[MenuGroup.CONTEXT_MENU_OTHERS] ?? [];
                        acc[MenuGroup.CONTEXT_MENU_OTHERS].push(item);
                    }
                    return acc;
                },
                {} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>
            )
        );

        return (
            <>
                {group.map((groupItem) =>
                    Object.keys(groupItem).map((groupKey: string) => (
                        <DesignMenuItemGroup key={groupKey} eventKey={groupKey}>
                            {groupItem[groupKey as unknown as MenuGroup].map((item: IDisplayMenuItem<IMenuItem>) => (
                                <MenuItem
                                    key={item.id}
                                    menuItem={item}
                                    onClick={(object: Partial<IValueOption>) => {
                                        onOptionSelect?.({ value: '', label: item.id, ...object });
                                    }}
                                />
                            ))}
                        </DesignMenuItemGroup>
                    ))
                )}
            </>
        );
    }

    const menuItems = menuService.getMenuItems(menuType);

    return menuItems.map((item: IDisplayMenuItem<IMenuItem>) => (
        <MenuItem
            key={item.id}
            menuItem={item}
            onClick={(object: Partial<IValueOption>) => {
                onOptionSelect?.({ value: '', label: item.id, ...object });
            }}
        />
    ));
}

function MenuOptionsWrapper(props: IBaseMenuProps) {
    const { options, value, onOptionSelect, parentKey } = props;

    return (
        options?.map((option: IValueOption, index: number) => {
            const key = `${parentKey}-${option.label ?? option.id}-${index}`;

            const onChange = (v: string | number) => {
                onOptionSelect?.({ value: v, label: option?.label });
            };

            const handleClick = () => {
                if (typeof option.value === 'undefined') return;

                onOptionSelect?.({
                    ...option,
                });
            };

            const _className = clsx({
                [styles.menuItemNoHover]: typeof option.label !== 'string' && !option.label?.hoverable,
            });

            return (
                <DesignMenuItem disabled={option.disabled} key={key} eventKey={key} className={_className} onClick={handleClick}>
                    <span
                        className={clsx(styles.menuItemContent, {
                            [styles.menuItemSelectable]: !(
                                typeof option.label !== 'string' && !option.label?.hoverable
                            ),
                        })}
                    >
                        {typeof value !== 'undefined' && String(value) === String(option.value) && (
                            <span className={styles.menuItemSelectableIcon}>
                                <CheckMarkSingle style={{ color: 'rgb(var(--success-color))' }} />
                            </span>
                        )}
                        <CustomLabel
                            value$={option.value$}
                            value={option.value}
                            label={option.label}
                            icon={option.icon}
                            onChange={onChange}
                        />
                    </span>
                </DesignMenuItem>
            );
        }) ?? <></>
    );
}

export const Menu = (props: IBaseMenuProps) => {
    const { overViewport, ...restProps } = props;
    const [menuEl, setMenuEl] = useState<HTMLDListElement>();
    const layoutService = useDependency(ILayoutService);

    useScrollYOverContainer(overViewport === 'scroll' ? menuEl : null, layoutService.rootContainerElement);

    return (
        <DesignMenu
            ref={(ref) => ref?.list && setMenuEl(ref.list)}
            selectable={false}
        >
            <MenuOptionsWrapper {...restProps} />
            <MenuWrapper {...restProps} />
        </DesignMenu>
    );
};

interface IMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    onClick: (params: Partial<IValueOption>) => void;
}

function MenuItem({ menuItem, onClick }: IMenuItemProps) {
    const menuService = useDependency(IMenuService);

    const menuItems = menuItem.id ? menuService.getMenuItems(menuItem.id) : [];

    const disabled = useObservable<boolean>(menuItem.disabled$, false);
    const activated = useObservable<boolean>(menuItem.activated$, false);
    const hidden = useObservable(menuItem.hidden$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$);
    const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;
    const selectionsFromObservable = useObservable(isObservable(item.selections) ? item.selections : undefined);
    const [inputValue, setInputValue] = useState(value);

    /**
     * user input change value from CustomLabel
     * @param v
     */
    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? Number.parseInt(v) : v;
        setInputValue(newValue);
    };

    const renderButtonType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
        const { title, label } = item;

        return (
            <DesignMenuItem
                key={item.id}
                eventKey={item.id}
                disabled={disabled}
                className={clsx({
                    [styles.menuItemActivated]: activated,
                })}
                onClick={() => {
                    onClick({ value: inputValue, id: item.id }); // merge cell
                }}
            >
                <span className={styles.menuItemContent}>
                    <CustomLabel value={value} title={title} label={label} icon={item.icon} onChange={onChange} />
                </span>
            </DesignMenuItem>
        );
    };

    const renderSelectorType = () => {
        const selections = selectionsFromObservable ?? (item.selections as IValueOption[] | undefined) ?? [];

        if (selections.length > 0) {
            return (
                <DesignSubMenu
                    key={item.id}
                    eventKey={item.id}
                    popupOffset={[18, 0]}
                    title={(
                        <span className={styles.menuItemContent}>
                            <CustomLabel
                                title={item.title}
                                value={inputValue}
                                onChange={onChange}
                                icon={item.icon}
                                label={item.label}
                            />
                            {item.shortcut && ` (${item.shortcut})`}
                        </span>
                    )}
                    expandIcon={<MoreSingle className={styles.menuItemMoreIcon} />}
                >
                    {selections.length > 0 && (
                        <MenuOptionsWrapper
                            parentKey={item.id}
                            menuType={item.id}
                            options={selections}
                            onOptionSelect={(v) => {
                                onClick({ value: v.value, id: item.id });
                            }}
                        />
                    )}
                </DesignSubMenu>
            );
        }

        return (
            <DesignMenuItem key={item.id} eventKey={item.id}>
                <span className={styles.menuItemContent}>
                    <CustomLabel
                        title={item.title}
                        value={inputValue}
                        icon={item.icon}
                        label={item.label}
                        onChange={onChange}
                    />
                    {item.shortcut && ` (${item.shortcut})`}
                </span>
            </DesignMenuItem>
        );
    };

    const renderSubItemsType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <DesignSubMenu
                key={item.id}
                eventKey={item.id}
                popupOffset={[18, 0]}
                title={(
                    <span className={styles.menuItemContent}>
                        <CustomLabel title={item.title} icon={item.icon} label={item.label} onChange={onChange} />
                    </span>
                )}
                expandIcon={<MoreSingle className={styles.menuItemMoreIcon} />}
            >
                {menuItems.length && <MenuWrapper menuType={item.id} parentKey={item.id} onOptionSelect={onClick} />}
            </DesignSubMenu>
        );
    };

    if (hidden) {
        return null;
    }

    return (
        <>
            {menuItem.type === MenuItemType.SELECTOR && renderSelectorType()}
            {menuItem.type === MenuItemType.SUBITEMS && renderSubItemsType()}
            {menuItem.type === MenuItemType.BUTTON && renderButtonType()}
        </>
    );
}
