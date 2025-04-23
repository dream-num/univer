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

import type { MenuItemGroupProps, MenuItemProps, MenuProps, MenuRef, SubMenuProps } from 'rc-menu';
import RcMenu, { MenuItem as RcMenuItem, MenuItemGroup as RcMenuItemGroup, SubMenu as RcSubMenu } from 'rc-menu';
import React, { useContext } from 'react';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Tooltip } from '../tooltip';
import styles from './index.module.less';

export const Menu = React.forwardRef<MenuRef, MenuProps & { wrapperClass?: string }>((props, ref) => {
    const { mountContainer } = useContext(ConfigContext);
    const { wrapperClass, ...rest } = props;
    return mountContainer && (
        <RcMenu
            ref={ref}
            prefixCls={clsx(styles.menu, props.className)}
            getPopupContainer={() => mountContainer}
            {...rest}
            className={wrapperClass}
        />
    );
});

export function MenuItem(props: MenuItemProps) {
    return <RcMenuItem {...props} />;
}

export function SubMenu(props: SubMenuProps) {
    return <RcSubMenu {...props} />;
}

export function MenuItemGroup(props: MenuItemGroupProps) {
    return <RcMenuItemGroup {...props} />;
}

export interface ITinyMenuItem {
    onClick: () => void;
    className: string;
    Icon: React.ComponentType<{ className?: string }>;
    key: string;
    active?: boolean;
    tooltip?: string;
}

export interface ITinyMenuGroupProps {
    items: ITinyMenuItem[];
}

export function TinyMenuGroup({ items }: ITinyMenuGroupProps) {
    return (
        <div
            className={`
              univer-flex univer-flex-wrap univer-gap-2.5 univer-menu-item-group univer-p-1 univer-pl-0 univer-pr-0
            `}
        >
            {items.map((item) => {
                const ele = (
                    <div
                        key={item.key}
                        onClick={() => item.onClick()}
                        className={`
                          univer-flex univer-h-6 univer-w-6 univer-cursor-pointer univer-items-center
                          univer-justify-center univer-rounded-md
                          hover:univer-bg-[#EEEFF1]
                          ${item.active ? 'univer-bg-[#EEEFF1]' : ''}
                          ${item.className}
                        `}
                    >
                        <item.Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                    </div>
                );
                return item.tooltip
                    ? (
                        <Tooltip key={item.key} title={item.tooltip}>
                            {ele}
                        </Tooltip>
                    )
                    : (
                        ele
                    );
            })}
        </div>
    );
}
