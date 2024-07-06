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

import React from 'react';
import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import { makeArray } from '@univerjs/core';
import { clsx } from 'clsx';
import type { IBaseMenuProps } from '../desktop/Menu';
import { IMenuService } from '../../../services/menu/menu.service';
import type { IDisplayMenuItem, IMenuItem, IValueOption, MenuItemDefaultValueType } from '../../../services/menu/menu';
import { MenuItemType } from '../../../services/menu/menu';

import { CustomLabel } from '../../custom-label';
import styles from './index.module.less';

/**
 * The mobile context menu wrapper.
 */
export function MobileMenu(props: IBaseMenuProps) {
    const { menuType, onOptionSelect } = props;
    const menuService = useDependency(IMenuService);

    if (!menuType) {
        return null;
    }

    // There is no submenu on mobile devices, so if there are sub menu items, we should flat them.
    const flattedMenuItems = makeArray<string>(menuType).map(menuService.getMenuItems.bind(menuService)).flat();
    return (
        <div
            className={styles.mobileMenuContainer}
            style={{
                gridTemplateColumns: `repeat(${Math.min(2, flattedMenuItems.length)}, 48px)`,
            }}
        >
            {flattedMenuItems.map((item) => (
                <MobileMenuItem
                    key={item.id}
                    menuItem={item}
                    onClick={(object: Partial<IValueOption>) => onOptionSelect?.({ value: '', label: item.id, ...object })}
                />
            ))}
        </div>
    );
}

interface IMobileMenuItemProps {
    menuItem: IDisplayMenuItem<IMenuItem>;
    onClick: (object: Partial<IValueOption>) => void;
}

function MobileMenuItem(props: IMobileMenuItemProps) {
    const { menuItem, onClick } = props;
    const { id, type, title, label, icon } = menuItem;

    if (type !== MenuItemType.BUTTON) {
        throw new Error(`[MobileMenuItem]: on mobile devices only "BUTTON" type menu items are supported. Please check "${id}".`);
    }

    const disabled = useObservable<boolean>(menuItem.disabled$, false);
    const activated = useObservable<boolean>(menuItem.activated$, false);
    const hidden = useObservable(menuItem.hidden$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$);

    const className = clsx(styles.mobileMenuItem, {
        [styles.mobileMenuItemActivated]: activated,
        [styles.mobileMenuItemHidden]: hidden,
    });

    return (
        <button
            type="button"
            className={className}
            key={id}
            disabled={disabled}
            onClick={() => onClick({ id })}
        >
            <CustomLabel value={value} title={title} label={label} icon={icon} />
        </button>
    );
}
