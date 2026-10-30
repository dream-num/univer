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

import { LocaleService } from '@univerjs/core';
import { borderTopClassName, clsx, ConfigContext, Dropdown } from '@univerjs/design';
import { MoreDownIcon, MoreHorizontalIcon, MoreVerticalIcon } from '@univerjs/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { useDependency } from '../../../utils/di';
import { toolbarButtonClassName } from './ToolbarButton';
import { ToolbarItem } from './ToolbarItem';
import { ToolbarDropdownProvider } from './TooltipButtonWrapper';

interface IRibbonOverflowProps {
    groups: IMenuSchema[];
    grid?: boolean;
}

export function RibbonOverflow({ groups, grid = false }: IRibbonOverflowProps) {
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const sidebarService = useDependency(ISidebarService);
    const { direction } = useContext(ConfigContext);
    const [openedGroups, setOpenedGroups] = useState<IMenuSchema[] | null>(null);
    const open = openedGroups === groups;
    const keyboardRef = useRef(false);
    const restoreFocusRef = useRef(true);
    const label = localeService.t('ui.ribbon.more');

    useEffect(() => {
        if (!open) return;
        const closeForPanel = () => {
            restoreFocusRef.current = false;
            setOpenedGroups(null);
        };
        const sidebar = sidebarService.sidebarOptions$.subscribe((options) => {
            if (options.visible) closeForPanel();
        });
        const dialogs = dialogService.getDialogs$().subscribe((options) => {
            if (options.some((dialog) => dialog.open)) closeForPanel();
        });
        return () => {
            sidebar.unsubscribe();
            dialogs.unsubscribe();
        };
    }, [open, dialogService, sidebarService]);

    return (
        <Dropdown
            open={open}
            onOpenChange={(visible) => {
                if (visible) restoreFocusRef.current = true;
                setOpenedGroups(visible ? groups : null);
            }}
            align={direction === 'rtl' ? 'start' : 'end'}
            collisionPadding={12}
            aria-label={label}
            data-u-comp="ribbon-overflow"
            className="univer-w-80 univer-max-w-[--radix-popper-available-width] univer-overflow-x-hidden"
            onOpenAutoFocus={(event) => {
                if (!keyboardRef.current) event.preventDefault();
            }}
            onFocusOutside={(event) => {
                // Formatting commands focus the editor; keep More available for the next adjustment.
                event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
                if (!restoreFocusRef.current) event.preventDefault();
            }}
            overlay={(
                <ToolbarDropdownProvider>
                    <div className="univer-px-2 univer-py-1">
                        {groups.map((group, index) => (
                            <section
                                key={group.key}
                                aria-label={group.title ? localeService.t(group.title) : undefined}
                                className={clsx('univer-py-1.5', index > 0 && borderTopClassName)}
                            >
                                {group.title && (
                                    <h3
                                        className="
                                          univer-m-0 univer-mb-1 univer-px-1 univer-text-xs univer-font-medium
                                          univer-text-gray-500
                                          dark:!univer-text-gray-400
                                        "
                                    >
                                        {localeService.t(group.title)}
                                    </h3>
                                )}
                                <div className="univer-flex univer-flex-wrap univer-items-center univer-gap-1">
                                    {(group.children ?? [group]).map((child) => child.item && (
                                        <div
                                            key={child.key}
                                            className="
                                              univer-min-w-0 univer-max-w-full
                                              [&>span]:univer-block [&>span]:univer-h-full
                                            "
                                            style={{ width: child.item.label && !child.item.icon ? child.gridLayout?.width : undefined }}
                                        >
                                            <ToolbarItem
                                                {...child.item}
                                                grid
                                                showLabel={child.gridLayout?.showLabel}
                                                fullWidth
                                                overflow
                                                preserveStrokeWidth
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </ToolbarDropdownProvider>
            )}
        >
            <button
                type="button"
                aria-label={label}
                onPointerDown={() => { keyboardRef.current = false; }}
                onKeyDown={() => { keyboardRef.current = true; }}
                className={clsx(toolbarButtonClassName, `
                  data-[state=open]:univer-bg-primary-50 data-[state=open]:univer-text-primary-600
                  focus-visible:univer-ring-2 focus-visible:univer-ring-primary-600
                  dark:data-[state=open]:!univer-bg-gray-700 dark:data-[state=open]:!univer-text-primary-300
                `, grid && '!univer-h-14 !univer-w-14 univer-flex-col univer-gap-1.5 univer-text-xs')}
            >
                {grid
                    ? (
                        <>
                            <MoreHorizontalIcon className="univer-size-5" preserveStrokeWidth />
                            <span
                                className="univer-flex univer-items-center univer-gap-0.5"
                            >
                                {label}
                                <MoreDownIcon
                                    className="univer-size-3"
                                    preserveStrokeWidth
                                />
                            </span>
                        </>
                    )
                    : <MoreVerticalIcon preserveStrokeWidth />}
            </button>
        </Dropdown>
    );
}
