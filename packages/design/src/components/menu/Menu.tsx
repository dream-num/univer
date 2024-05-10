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

import type { MenuItemGroupProps, MenuItemProps, MenuProps, MenuRef, SubMenuProps } from 'rc-menu';
import RcMenu, { MenuItem as RcMenuItem, MenuItemGroup as RcMenuItemGroup, SubMenu as RcSubMenu } from 'rc-menu';
import React, { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export const Menu = React.forwardRef<MenuRef, MenuProps>((props, ref) => {
    const { mountContainer } = useContext(ConfigContext);
    return mountContainer && React.cloneElement(<RcMenu ref={ref} prefixCls={styles.menu} getPopupContainer={() => mountContainer} />, {
        ...props,
    });
});

export function MenuItem(props: MenuItemProps) {
    return React.cloneElement(<RcMenuItem />, { ...props });
}

export function SubMenu(props: SubMenuProps) {
    return React.cloneElement(<RcSubMenu />, { ...props });
}

export function MenuItemGroup(props: MenuItemGroupProps) {
    return React.cloneElement(<RcMenuItemGroup />, { ...props });
}
