import RcMenu, { MenuItem as RcMenuItem, MenuItemProps, MenuProps, SubMenu as RcSubMenu, SubMenuProps } from 'rc-menu';
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
    return React.cloneElement(<RcMenuItem className={styles.menuItem} />, { ...props });
}

export function SubMenu(props: SubMenuProps) {
    return React.cloneElement(<RcSubMenu className={styles.menuItem} />, { ...props });
}
