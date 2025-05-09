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

import type { MenuRef } from '@univerjs/design';
import type {
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemDefaultValueType,
} from '../../../services/menu/menu';
import { isRealNum, LocaleService } from '@univerjs/core';
import {
    clsx,
    Menu as DesignMenu,
    MenuItem as DesignMenuItem,
    MenuItemGroup as DesignMenuItemGroup,
    SubMenu as DesignSubMenu,
} from '@univerjs/design';
import { CheckMarkSingle, MoreSingle } from '@univerjs/icons';
import { useEffect, useMemo, useState } from 'react';
import { combineLatest, isObservable, of } from 'rxjs';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { ContextMenuGroup } from '../../../services/menu/types';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';
import { useScrollYOverContainer } from '../../hooks/layout';
import { UITinyMenuGroup } from './TinyMenuGroup';

const contentClassName = 'univer-inline-flex univer-gap-2 univer-items-center';
const moreIconClassName = 'univer-size-3.5 univer-text-gray-900 dark:univer-text-white';

/** @deprecated */
export interface IBaseMenuProps {
    parentKey?: string | number;
    menuType?: string;

    value?: string | number;
    options?: IValueOption[];
    /**
     * The menu will show scroll on it over viewport height
     * Recommend that you use this prop when displaying menu overlays in Dropdown
     */
    overViewport?: 'scroll';
    onOptionSelect?: (option: IValueOption) => void;
    style?: React.CSSProperties;
}

/** @deprecated */
function MenuWrapper(props: IBaseMenuProps) {
    const { menuType, onOptionSelect } = props;
    const localeService = useDependency(LocaleService);
    const menuManagerService = useDependency(IMenuManagerService);

    const menuItems = useMemo(() => menuType ? menuManagerService.getMenuByPositionKey(menuType) : [], [menuType, menuManagerService]);

    const [hiddenStates, setHiddenStates] = useState<Record<string, boolean>>({});
    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            if (!item.children) return item;

            const itemKey = item.key?.toString() || '';
            return !hiddenStates[itemKey];
        });
    }, [menuItems, hiddenStates]);

    useEffect(() => {
        const subscriptions = menuItems.map((item) => {
            if (!item.children) return null;

            const hiddenObservables = item.children.map((subItem) => subItem.item?.hidden$ ?? of(false));

            return combineLatest(hiddenObservables).subscribe((hiddenValues) => {
                const isAllHidden = hiddenValues.every((hidden) => hidden === true);
                setHiddenStates((prev) => ({
                    ...prev,
                    [item.key]: isAllHidden,
                }));
            });
        });

        return () => {
            subscriptions.forEach((sub) => sub?.unsubscribe());
            setHiddenStates({});
        };
    }, [menuItems]);

    if (!menuType) {
        return null;
    };

    return filteredMenuItems && filteredMenuItems.map((item) => item.item
        ? (
            <MenuItem
                key={item.key}
                menuItem={item.item}
                onClick={(object: Partial<IValueOption>) => {
                    onOptionSelect?.({ value: '', label: item.key, ...object });
                }}
            />
        )
        : item.children?.length
            ? item.key === ContextMenuGroup.QUICK
                ? <UITinyMenuGroup key={item.key} item={item} onOptionSelect={onOptionSelect} />
                : (
                    <DesignMenuItemGroup key={item.key} eventKey={item.key} title={item.title ? localeService.t(item.title) : undefined}>
                        {item.children.map((child) => (
                            child.item && (
                                <MenuItem
                                    key={child.key}
                                    menuItem={child.item}
                                    onClick={(object: Partial<IValueOption>) => {
                                        onOptionSelect?.({ value: '', label: child.key, ...object });
                                    }}
                                />
                            )
                        ))}
                    </DesignMenuItemGroup>
                )
            : null);
}

/** @deprecated */
function MenuOptionsWrapper(props: IBaseMenuProps) {
    const { options, value, onOptionSelect, parentKey } = props;

    return options?.map((option: IValueOption, index: number) => {
        const key = `${parentKey}-${option.label ?? option.id}-${index}`;

        const onChange = (v: string | number) => {
            onOptionSelect?.({ value: v, label: option?.label, commandId: option?.commandId });
        };

        const handleClick = () => {
            if (typeof option.value === 'undefined') return;

            onOptionSelect?.({
                ...option,
            });
        };

        const _className = clsx({
            'univer-bg-none': typeof option.label !== 'string' && !option.label?.hoverable,
        });

        return (
            <DesignMenuItem disabled={option.disabled} key={key} eventKey={key} className={_className} onClick={handleClick}>
                <span
                    className={clsx(contentClassName, {
                        'univer-relative univer-pl-5': !(
                            typeof option.label !== 'string' && !option.label?.hoverable
                        ),
                    })}
                >
                    {typeof value !== 'undefined' && String(value) === String(option.value) && (
                        <span className="univer-absolute univer-left-0 univer-inline-flex univer-items-center">
                            <CheckMarkSingle className="univer-text-primary-600" />
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
    }) ?? null;
}

/** @deprecated */
export const Menu = (props: IBaseMenuProps) => {
    const { overViewport, style, ...restProps } = props;
    const [menuEl, setMenuEl] = useState<HTMLDListElement>();
    const layoutService = useDependency(ILayoutService);

    useScrollYOverContainer(overViewport === 'scroll' ? menuEl : null, layoutService.rootContainerElement);

    function handleSetMenuEl(ref: MenuRef | null) {
        if (ref) {
            setMenuEl(ref.list);
        }
    }
    return (
        <DesignMenu
            style={style}
            ref={handleSetMenuEl}
            selectable={false}
        >
            <MenuOptionsWrapper {...restProps} />
            <MenuWrapper {...restProps} />
        </DesignMenu>
    );
};

/** @deprecated */
interface IMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    onClick: (object: Partial<IValueOption>) => void;
}

/** @deprecated */
function MenuItem({ menuItem, onClick }: IMenuItemProps) {
    const menuManagerService = useDependency(IMenuManagerService);
    const disabled = useObservable<boolean>(menuItem.disabled$, false);
    const activated = useObservable<boolean>(menuItem.activated$, false);
    const hidden = useObservable(menuItem.hidden$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$);
    const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;
    const selectionsFromObservable = useObservable(isObservable(item.selections) ? item.selections : undefined);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    if (hidden) {
        return null;
    }
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
                    'univer-bg-gray-200': activated,
                })}
                onClick={() => {
                    onClick({ commandId: item.commandId, value: inputValue, id: item.id });
                }}
            >
                <span className={contentClassName}>
                    <CustomLabel
                        value={value}
                        title={title}
                        label={label}
                        icon={item.icon}
                        onChange={onChange}
                    />
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
                        <span className={contentClassName}>
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
                    expandIcon={<MoreSingle className={moreIconClassName} />}
                >
                    <DesignMenuItemGroup>
                        {selections.length > 0 && (
                            <MenuOptionsWrapper
                                parentKey={item.id}
                                menuType={item.id}
                                options={selections}
                                onOptionSelect={(v) => {
                                    onClick({ value: v.value, id: item.id, commandId: v.commandId });
                                }}
                            />
                        )}
                    </DesignMenuItemGroup>
                </DesignSubMenu>
            );
        }

        return (
            <DesignMenuItem key={item.id} eventKey={item.id}>
                <span className={contentClassName}>
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

    const subMenuItems = menuItem.id ? menuManagerService.getMenuByPositionKey(menuItem.id) : [];

    const renderSubItemsType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <DesignSubMenu
                key={item.id}
                eventKey={item.id}
                popupOffset={[18, 0]}
                title={(
                    <span className={contentClassName}>
                        <CustomLabel title={item.title} icon={item.icon} label={item.label} onChange={onChange} />
                    </span>
                )}
                expandIcon={<MoreSingle className={moreIconClassName} />}
            >
                <DesignMenuItemGroup>
                    {subMenuItems.length && <MenuWrapper menuType={item.id} parentKey={item.id} onOptionSelect={onClick} />}
                </DesignMenuItemGroup>
            </DesignSubMenu>
        );
    };

    return (
        <>
            {menuItem.type === MenuItemType.SELECTOR && renderSelectorType()}
            {menuItem.type === MenuItemType.SUBITEMS && renderSubItemsType()}
            {menuItem.type === MenuItemType.BUTTON && renderButtonType()}
        </>
    );
}
