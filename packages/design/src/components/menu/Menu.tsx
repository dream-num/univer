import type { MenuItemGroupProps, MenuItemProps, MenuProps, SubMenuProps } from 'rc-menu';
import RcMenu, { MenuItem as RcMenuItem, MenuItemGroup as RcMenuItemGroup, SubMenu as RcSubMenu } from 'rc-menu';
import React, { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export function Menu(props: MenuProps) {
    const { mountContainer } = useContext(ConfigContext);

    return React.cloneElement(<RcMenu prefixCls={styles.menu} getPopupContainer={() => mountContainer} />, {
        ...props,
    });
}

export function MenuItem(props: MenuItemProps) {
    return React.cloneElement(<RcMenuItem />, { ...props });
}

export function SubMenu(props: SubMenuProps) {
    return React.cloneElement(<RcSubMenu />, { ...props });
}

export function MenuItemGroup(props: MenuItemGroupProps) {
    return React.cloneElement(<RcMenuItemGroup />, { ...props });
}
