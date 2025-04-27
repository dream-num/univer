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

import type { IDropdownMenuProps } from '@univerjs/design';
import type { IMouseEvent } from '@univerjs/engine-render';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { ICommandService } from '@univerjs/core';
import { DropdownMenu } from '@univerjs/design';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';

function MenuItemButton(props: { menuItem: IMenuSchema; setVisible: (visible: boolean) => void }) {
    const { menuItem, setVisible } = props;

    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);

    const { title, commandId, value$, icon, label, id } = menuItem.item!;
    const value = (menuItem.item as any)?.value;

    const observableValue = useObservable(value$);

    const [realValue, setRealValue] = useState<any>(observableValue ?? value);

    return (
        <div
            className="univer-box-border univer-flex univer-w-full univer-items-center univer-gap-2"
            onClick={() => {
                if (commandService) {
                    commandService.executeCommand(commandId ?? id as string, { value: realValue });
                }
                layoutService.focus();
                setVisible(false);
            }}
        >
            <CustomLabel
                icon={icon}
                value$={value$ as any}
                label={label}
                title={title}
                onChange={(value) => {
                    if (commandService) {
                        setRealValue(value);
                        commandService.executeCommand(commandId ?? id as string, { value: +value });
                    }
                }}
            />
        </div>
    );
}

export function DesktopContextMenu() {
    const contentRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [menu, setMenu] = useState<IDropdownMenuProps['items']>([]);
    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const visibleRef = useRef(visible);
    const contextMenuService = useDependency(IContextMenuService);
    const menuManagerService = useDependency(IMenuManagerService);

    visibleRef.current = visible;

    useEffect(() => {
        const disposables = contextMenuService.registerContextMenuHandler({
            handleContextMenu,
            hideContextMenu() {
                setVisible(false);
            },
            get visible() {
                return visibleRef.current;
            },
        });

        function handleClickOutside(event: MouseEvent) {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                handleClose();
            }
        }

        document.addEventListener('pointerdown', handleClickOutside);

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
            disposables.dispose();
        };
    }, [contextMenuService]);

    /** A function to open context menu with given position and menu type. */
    function handleContextMenu(event: IMouseEvent, menuType: string) {
        setVisible(false);
        requestAnimationFrame(() => {
            const menu = menuManagerService.getMenuByPositionKey(menuType);

            if (!menu) {
                return;
            }

            const dropdownMenu: IDropdownMenuProps['items'] = [];

            for (let i = 0; i < menu.length; i++) {
                const group = menu[i];

                if (!group?.children?.length) continue;

                for (const menuItem of group?.children) {
                    if (!menuItem.item) continue;

                    const { type, title, hidden$, disabled$, icon, label, id } = menuItem.item;

                    let hidden = false;
                    let disabled = false;
                    if (hidden$) {
                        hidden$.subscribe((v) => {
                            hidden = v;
                        }).unsubscribe();
                    }
                    if (disabled$) {
                        disabled$.subscribe((v) => {
                            disabled = v;
                        }).unsubscribe();
                    }

                    if (hidden) continue;

                    if (type === MenuItemType.BUTTON) {
                        dropdownMenu.push({
                            type: 'item',
                            children: (
                                <MenuItemButton menuItem={menuItem} setVisible={setVisible} />
                            ),
                            disabled,
                        });
                    } else if (type === MenuItemType.SUBITEMS) {
                        const subMenu = menuManagerService.getMenuByPositionKey(id);

                        dropdownMenu.push({
                            type: 'subItem',
                            children: (
                                <div
                                    className={`
                                      univer-box-border univer-flex univer-w-full univer-items-center univer-gap-2
                                    `}
                                >
                                    <CustomLabel
                                        icon={icon}
                                        label={label}
                                        title={title}
                                    />
                                </div>
                            ),
                            disabled,
                            options: subMenu.map((item) => {
                                if (!item.item) return null;

                                const { hidden$, disabled$ } = item.item;

                                let hidden = false;
                                let disabled = false;

                                if (hidden$) {
                                    hidden$.subscribe((v) => {
                                        hidden = v;
                                    }).unsubscribe();
                                }
                                if (disabled$) {
                                    disabled$.subscribe((v) => {
                                        disabled = v;
                                    }).unsubscribe();
                                }

                                if (hidden) return null;

                                return {
                                    type: 'item',
                                    children: (
                                        <MenuItemButton menuItem={item} setVisible={setVisible} />
                                    ),
                                    disabled,
                                } as IDropdownMenuProps['items'][number];
                            }).filter((item) => item !== null),
                        });
                    }
                }

                if (i < menu.length - 1) {
                    dropdownMenu.push({ type: 'separator' });
                }
            }

            setMenu(dropdownMenu);
            setOffset([event.clientX, event.clientY]);
            setVisible(true);
        });
    }

    function handleClose() {
        setVisible(false);
    }

    const contextMenuRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            if (!contextMenuRef.current) return;

            const screenHeight = window.innerHeight;
            const { height: contextMenuHeight } = contextMenuRef.current.getBoundingClientRect();

            if (contextMenuHeight + offset[1] > screenHeight) {
                if (offset[1] !== screenHeight - contextMenuHeight) {
                    setOffset([offset[0], screenHeight - contextMenuHeight]);
                }
            }
        });
    }, [visible, contextMenuRef, offset]);

    return (
        <DropdownMenu
            ref={contextMenuRef}
            className="!univer-max-h-screen univer-min-w-52 !univer-animate-none"
            open={visible}
            items={menu}
            align="start"
            alignOffset={offset[0]}
            sideOffset={offset[1]}
            sticky="always"
            collisionBoundary={document.body}
            onOpenChange={setVisible}
        >
            <div className="univer-fixed univer-left-0 univer-top-0 univer-hidden univer-rounded-md" />
        </DropdownMenu>
    );
}
