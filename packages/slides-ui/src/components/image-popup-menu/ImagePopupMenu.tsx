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

import type { IDrawingSearch } from '@univerjs/core';
import { ICommandService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, Dropdown } from '@univerjs/design';
import { Autofill, MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export interface IImagePopupMenuItem {
    label: string;
    index: number;
    commandId: string;
    commandParams?: IDrawingSearch[];
    disable: boolean;
}

export interface IImagePopupMenuExtraProps {
    menuItems: IImagePopupMenuItem[];
}

export interface IImagePopupMenuProps {
    popup: {
        extraProps?: IImagePopupMenuExtraProps;
    };
}

export function SlideImagePopupMenu(props: IImagePopupMenuProps) {
    const menuItems = props.popup?.extraProps?.menuItems;

    if (!menuItems) {
        return null;
    }

    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);

    const [visible, setVisible] = useState(false);
    const [isHovered, setHovered] = useState(false);

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const handleClick = (item: IImagePopupMenuItem) => {
        commandService.executeCommand(item.commandId, item.commandParams);
        setVisible(false);
    };

    const showMore = visible || isHovered;

    const availableMenu = menuItems.filter((item) => !item.disable);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Dropdown
                align="start"
                overlay={(
                    <ul
                        className={clsx(`
                          univer-m-0 univer-box-border univer-grid univer-list-none univer-items-center univer-gap-1
                          univer-rounded-lg univer-bg-white univer-p-1.5 univer-text-sm univer-shadow-lg
                        `, borderClassName)}
                    >
                        {availableMenu.map((item) => (
                            <li
                                key={item.index}
                                className={`
                                  univer-relative univer-box-border univer-flex univer-h-8 univer-cursor-pointer
                                  univer-items-center univer-rounded univer-text-sm univer-transition-colors
                                  hover:univer-bg-gray-100
                                `}
                                onClick={() => handleClick(item)}
                            >
                                <span className="univer-px-2 univer-py-1.5 univer-align-middle">
                                    {localeService.t(item.label)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                open={visible}
                onOpenChange={onVisibleChange}
            >
                <div
                    className={clsx(`
                      univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1
                      dark:hover:univer-bg-gray-800
                      hover:univer-bg-gray-100
                    `, borderClassName, {
                        'univer-bg-gray-100 dark:univer-bg-gray-800': visible,
                        'univer-bg-white dark:univer-bg-gray-900': !visible,
                    })}
                >
                    <Autofill
                        className={`
                          univer-fill-primary-600 univer-text-gray-900
                          dark:univer-text-white
                        `}
                    />
                    {showMore && <MoreDownSingle className="dark:univer-text-white" />}
                </div>
            </Dropdown>
        </div>
    );
};
