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

import type { IDrawingSearch } from '@univerjs/core';
import { ICommandService, LocaleService, useDependency } from '@univerjs/core';
import { DropdownLegacy } from '@univerjs/design';
import { Autofill, MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useState } from 'react';
import styles from './index.module.less';

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

export const SlideImagePopupMenu: React.FC<IImagePopupMenuProps> = (props: IImagePopupMenuProps) => {
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
            <DropdownLegacy
                placement="bottomLeft"
                trigger={['click']}
                overlay={(
                    <ul className={styles.imagePopupMenu}>
                        {availableMenu.map((item) => (
                            <li
                                key={item.index}
                                onClick={() => handleClick(item)}
                                className={styles.imagePopupMenuItem}
                            >
                                <span className={styles.imagePopupMenuItemTitle}>{localeService.t(item.label)}</span>
                            </li>
                        ))}
                    </ul>
                )}
                visible={visible}
                onVisibleChange={onVisibleChange}
            >
                <div
                    className={clsx(styles.btnContainer, {
                        [styles.btnContainerExpand]: visible,
                    })}
                >
                    <Autofill
                        style={{ color: '#35322B' }}
                        extend={{ colorChannel1: 'rgb(var(--green-700, #409f11))' }}
                    />
                    {showMore && <MoreDownSingle style={{ color: '#CCCCCC', fontSize: '8px', marginLeft: '8px' }} />}
                </div>
            </DropdownLegacy>
        </div>
    );
};
