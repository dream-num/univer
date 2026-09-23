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

import { ICommandService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, DropdownMenu } from '@univerjs/design';
import { AutofillDoubleIcon, MoreDownIcon } from '@univerjs/icons';
import { AUTO_FILL_APPLY_TYPE, IAutoFillService, RefillCommand } from '@univerjs/sheets';
import { ILayoutService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { map } from 'rxjs';

export interface IAutoFillPopupMenuItem {
    label: string;
    value: AUTO_FILL_APPLY_TYPE;
    index: number;
    disable: boolean;
}

export interface IAutoFillPopupMenuProps {
    DropdownMenuComponent?: typeof DropdownMenu;
}

export function AutoFillPopupMenu({ DropdownMenuComponent = DropdownMenu }: IAutoFillPopupMenuProps = {}) {
    const commandService = useDependency(ICommandService);
    const autoFillService = useDependency(IAutoFillService);
    const layoutService = useDependency(ILayoutService);
    const localeService = useDependency(LocaleService);
    const menu = useObservable(
        () => autoFillService.menu$.pipe(map((items) => items.map((item) => ({
            ...item,
            index: items.indexOf(item),
        })))),
        [],
        false,
        [autoFillService]
    );
    const [visible, setVisible] = useState(false);
    const selected = useObservable(autoFillService.applyType$, AUTO_FILL_APPLY_TYPE.SERIES);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        function handleClose() {
            setVisible(false);
        }

        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('wheel', handleClose);
        };
    }, []);

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const handleClick = (item: IAutoFillPopupMenuItem) => {
        commandService.executeCommand(RefillCommand.id, { type: item.value });
    };

    const showMore = visible || isHovered;

    const availableMenu = menu.filter((item) => !item.disable);

    return (
        <div className="univer-relative univer-size-0">
            <div className="univer-absolute univer-left-0 univer-top-0">
                <DropdownMenuComponent
                    align="start"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        layoutService.focus();
                    }}
                    items={availableMenu.map((item) => ({
                        type: 'radio',
                        value: selected,
                        options: [{ label: localeService.t(item.label), value: item.value }],
                        onSelect: () => handleClick(item),
                    }))}
                    open={visible}
                    onOpenChange={onVisibleChange}
                >
                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className={clsx(`
                          univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1
                          hover:univer-bg-gray-100
                          dark:hover:!univer-bg-gray-800
                        `, borderClassName, {
                            'univer-bg-gray-100 dark:!univer-bg-gray-800': visible,
                            'univer-bg-gray-0 dark:!univer-bg-gray-900': !visible,
                        })}
                    >
                        <AutofillDoubleIcon
                            className={`
                              univer-fill-primary-600 univer-text-gray-900
                              dark:!univer-text-gray-0
                            `}
                        />
                        {showMore && <MoreDownIcon className="dark:!univer-text-gray-0" />}
                    </div>
                </DropdownMenuComponent>
            </div>
        </div>
    );
};
