import { isRealNum } from '@univerjs/core';
import { MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import RcMenu, { MenuItem, SubMenu } from 'rc-menu';
import React, { useState } from 'react';
import { isObservable, of } from 'rxjs';

import { ComponentManager } from '../../Common';
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
import { DisplayTypes } from '../Select/Select';
import styles from './index.module.less';

export interface IBaseMenuProps {
    menuType?: string | string[];

    // used for selector
    display?: DisplayTypes;
    value?: string | number;
    options?: Array<IValueOption | ICustomComponentOption>;

    onOptionSelect?: (option: IValueOption) => void;
    onClose?: () => void;
}

function Menu2Wrapper(props: IBaseMenuProps) {
    const { menuType, onOptionSelect } = props;
    const menuService = useDependency(IMenuService);

    if (!menuType) return;

    if (Array.isArray(menuType)) {
        const menuTypes = menuType.map((type) => menuService.getMenuItems(type));

        return (
            <>
                {menuTypes.map((menuItems) =>
                    menuItems.map((item: IDisplayMenuItem<IMenuItem>) => (
                        <Menu2Item
                            key={item.id}
                            menuItem={item}
                            onClick={(object: Partial<IValueOption>) => {
                                onOptionSelect?.({ value: '', label: item.id, ...object });
                            }}
                        />
                    ))
                )}
            </>
        );
    }

    const menuItems = menuService.getMenuItems(menuType);

    return menuItems.map((item: IDisplayMenuItem<IMenuItem>) => (
        <Menu2Item
            key={item.id}
            menuItem={item}
            onClick={(object: Partial<IValueOption>) => {
                onOptionSelect?.({ value: '', label: item.id, ...object });
            }}
        />
    ));
}

function Menu2OptionsWrapper(props: IBaseMenuProps) {
    const { options, value, display, onOptionSelect } = props;

    const componentManager = useDependency(ComponentManager);

    return options?.map((option: IValueOption | ICustomComponentOption, index: number) => {
        const isValueOption = isValueOptions(option);
        const key = (isValueOption ? option.label : option.id).toString();

        if (isValueOption) {
            return (
                <MenuItem
                    key={key}
                    eventKey={key}
                    className={joinClassNames(
                        styles.menu2Item,
                        option.disabled ? styles.colsMenuitemDisabled : ''
                        // String(value) === String(option.value) ? styles.selectItemSelected : '' // Set the background color of Item
                    )}
                    onClick={() => {
                        onOptionSelect?.({
                            ...option,
                        });
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
                </MenuItem>
            );
        }

        const CustomComponent = componentManager.get(option.id) as React.ComponentType<any>;
        return (
            <MenuItem
                key={key}
                eventKey={key}
                className={joinClassNames(
                    styles.menu2Item,
                    styles.menu2ItemCustom,
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
            </MenuItem>
        );
    });
}

export const Menu2 = (props: IBaseMenuProps) => (
    <RcMenu prefixCls={styles.menu2} selectable={false}>
        <Menu2OptionsWrapper {...props} />
        <Menu2Wrapper {...props} />
    </RcMenu>
);

export interface IMenu2ItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    onClick: (params: Partial<IValueOption>) => void;
}

export function Menu2Item({ menuItem, onClick }: IMenu2ItemProps) {
    const menuService = useDependency(IMenuService);

    const menuItems = menuItem.id ? menuService.getMenuItems(menuItem.id) : [];

    const disabled = useObservable<boolean>(menuItem.disabled$ || of(false), false, true);
    const hidden = useObservable(menuItem.hidden$ || of(false), false, true);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$ || of(undefined), undefined, true);
    const [inputValue, setInputValue] = useState(value);

    /**
     * user input change value from CustomLabel
     * @param v
     */
    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? parseInt(v) : v;
        setInputValue(newValue);
    };

    const renderButtonType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
        const { title, display, label } = item;

        return (
            <MenuItem
                key={item.id}
                eventKey={item.id}
                className={joinClassNames(styles.menu2Item, disabled ? styles.menu2ItemDisabled : '')}
                // disabled={disabled} // FIXME disabled is not working
                onClick={() => {
                    onClick({ value: inputValue, id: item.id }); // merge cell
                }}
            >
                <NeoCustomLabel
                    display={display}
                    value={inputValue}
                    title={title}
                    label={label}
                    icon={item.icon}
                    onChange={onChange}
                    onValueChange={() => {
                        // Right-click the menu for the title bar, and the Enter key triggers after entering the row height
                        onClick({ value: inputValue, id: item.id });
                    }}
                />
            </MenuItem>
        );
    };

    const renderSelectorType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        let selections: Array<IValueOption | ICustomComponentOption>;
        if (isObservable(item.selections)) {
            selections = useObservable<Array<IValueOption | ICustomComponentOption>>(
                item.selections || of([]),
                [],
                true
            );
        } else {
            selections = item.selections || [];
        }

        if (selections.length > 0) {
            return (
                <SubMenu
                    key={item.id}
                    eventKey={item.id}
                    className={joinClassNames(styles.menu2Item, disabled ? styles.menu2ItemDisabled : '')}
                    popupOffset={[18, 0]}
                    title={
                        <>
                            <NeoCustomLabel
                                title={item.title}
                                value={inputValue}
                                onChange={onChange}
                                icon={item.icon}
                                display={item.display}
                                label={item.label}
                                max={item.max}
                                min={item.min}
                            />
                            {item.shortcut && ` (${item.shortcut})`}
                        </>
                    }
                    expandIcon={
                        <MoreSingle style={{ color: styles.textColorSecondary, fontSize: styles.fontSizeXs }} />
                    }
                >
                    {selections.length > 0 && (
                        <Menu2OptionsWrapper
                            menuType={item.id}
                            options={selections}
                            display={item.display}
                            onOptionSelect={(v) => {
                                onClick({ value: v.value, id: item.id }); // border style don't trigger hide menu, set show true
                            }}
                        />
                    )}
                </SubMenu>
            );
        }

        return (
            <MenuItem
                key={item.id}
                eventKey={item.id}
                className={joinClassNames(styles.menu2Item, disabled ? styles.menu2ItemDisabled : '')}
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
                />
                {item.shortcut && ` (${item.shortcut})`}
            </MenuItem>
        );
    };

    const renderSubItemsType = () => {
        const item = menuItem as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <SubMenu
                key={item.id}
                eventKey={item.id}
                className={joinClassNames(styles.menu2Item, disabled ? styles.menu2ItemDisabled : '')}
                popupOffset={[18, 0]}
                title={
                    <>
                        <NeoCustomLabel
                            title={item.title}
                            value={item.title}
                            icon={item.icon}
                            display={item.display}
                            label={item.label}
                        />
                    </>
                }
                expandIcon={<MoreSingle style={{ color: styles.textColorSecondary, fontSize: styles.fontSizeXs }} />}
            >
                {menuItems.length && <Menu2Wrapper menuType={item.id} onOptionSelect={onClick} />}
            </SubMenu>
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
