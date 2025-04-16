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
import { clsx, DropdownMenu } from '@univerjs/design';
import { Autofill, MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import React, { useState } from 'react';

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

export const ImagePopupMenu: React.FC<IImagePopupMenuProps> = (props: IImagePopupMenuProps) => {
    const { popup } = props;

    const menuItems = popup?.extraProps?.menuItems;

    if (!menuItems) return null;

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
            <DropdownMenu
                align="start"
                items={availableMenu.map((item) => ({
                    type: 'item',
                    children: localeService.t(item.label),
                    onSelect: () => handleClick(item),
                }))}
                open={visible}
                onOpenChange={onVisibleChange}
            >
                <div
                    className={clsx(`
                      univer-flex univer-items-center univer-gap-2 univer-rounded univer-border univer-border-solid
                      univer-border-gray-200 univer-p-1
                      hover:univer-bg-gray-100
                    `, {
                        'univer-bg-gray-100': visible,
                        'univer-bg-white': !visible,
                    })}
                >
                    <Autofill
                        style={{ color: '#35322B' }}
                        extend={{ colorChannel1: 'rgb(var(--green-700, #409f11))' }}
                    />
                    {showMore && <MoreDownSingle className="univer-text-[10px] univer-text-gray-400" />}
                </div>
            </DropdownMenu>
        </div>
    );
};
