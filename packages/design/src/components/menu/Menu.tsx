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
import { Tooltip } from '../tooltip/Tooltip';
import './index.css';

/** @deprecated */
export const Menu = React.forwardRef<MenuRef, MenuProps & { wrapperClass?: string }>((props, ref) => {
    const { mountContainer } = useContext(ConfigContext);
    const { wrapperClass, ...rest } = props;
    return mountContainer && (
        <RcMenu
            ref={ref}
            prefixCls={clsx('univer-menu', props.className)}
            getPopupContainer={() => mountContainer}
            {...rest}
            className={wrapperClass}
        />
    );
});

/** @deprecated */
export function MenuItem(props: MenuItemProps) {
    return <RcMenuItem {...props} />;
}

/** @deprecated */
export function SubMenu(props: SubMenuProps) {
    return <RcSubMenu {...props} />;
}

/** @deprecated */
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
                        className={clsx(`
                          univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center
                          univer-rounded-md
                          dark:hover:univer-bg-gray-900
                          hover:univer-bg-gray-50
                        `, {
                            'univer-bg-gray-50 dark:univer-bg-gray-900': item.active,
                        }, item.className)}
                        onClick={() => item.onClick()}
                    >
                        <item.Icon
                            className={`
                              univer-size-4 univer-text-gray-900
                              dark:univer-text-gray-200
                            `}
                        />
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
