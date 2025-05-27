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

import { clsx, scrollbarClassName } from '@univerjs/design';
import { CatalogueIcon, LeftIcon } from '@univerjs/icons';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

export interface ISideMenuItem {
    text: string;
    level: number;
    id: string;
    isTitle?: boolean;
}

export interface ISideMenuProps {
    menus?: ISideMenuItem[];
    onClick?: (menu: ISideMenuItem) => void;
    className?: string;
    style?: React.CSSProperties;
    mode?: 'float' | 'side-bar';
    maxHeight: number;
    activeId?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    maxWidth?: number;
    wrapperClass?: string;
    wrapperStyle?: React.CSSProperties;
    iconClass?: string;
    iconStyle?: React.CSSProperties;
}

export interface ISideMenuInstance {
    scrollTo: (id: string) => void;
}

const commonClass = 'univer-overflow-hidden univer-font-[500] univer-truncate univer-h-[24px] univer-mb-2 univer-leading-[24px] univer-ellipsis univer-cursor-pointer';
const titleClass = 'univer-text-base univer-font-semibold';
const h1Class = 'univer-text-sm univer-font-semibold';
const textClass = 'univer-text-sm';

export const SideMenu = forwardRef<ISideMenuInstance, ISideMenuProps>((props, ref) => {
    const { menus, onClick, className, style, mode, maxHeight, activeId, open, onOpenChange, maxWidth, wrapperClass, wrapperStyle, iconClass, iconStyle } = props;
    const isSideBar = mode === 'side-bar';
    const containerRef = useRef<HTMLDivElement>(null);
    const menusRef = useRef(menus);
    menusRef.current = menus;
    const instance: ISideMenuInstance = useMemo(() => ({
        scrollTo: (id: string) => {
            if (!menusRef.current) return;
            const index = menusRef.current.findIndex((menu) => menu.id === id);
            if (index === -1 || !containerRef.current) return;

            // Find the actual DOM element by its ID
            const targetElement = document.getElementById(`univer-side-menu-${id}`);
            if (!targetElement) return;

            // Get the element's offsetTop relative to its parent
            const targetTop = targetElement.offsetTop;

            // Get container's scrollable height
            const containerHeight = containerRef.current.clientHeight;
            const maxScrollTop = containerRef.current.scrollHeight - containerHeight;

            // Calculate the scroll position to center the element if possible
            const scrollPosition = Math.max(0, Math.min(targetTop - containerHeight / 2 + targetElement.clientHeight / 2, maxScrollTop));

            containerRef.current?.scrollTo({
                behavior: 'smooth',
                top: scrollPosition,
            });
        },
    }), []);

    useImperativeHandle(ref, () => instance);

    useEffect(() => {
        if (activeId) {
            instance.scrollTo(activeId);
        }
    }, [activeId, instance]);

    return (
        <div className={clsx('univer-relative', wrapperClass)} style={wrapperStyle}>
            <div
                onClick={() => onOpenChange?.(!open)}
                className={clsx(`
                  univer-absolute univer-left-5 univer-top-4 univer-z-[100] univer-flex univer-h-8 univer-w-8
                  univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full univer-bg-white
                  univer-text-gray-800 univer-shadow-sm
                  dark:!univer-bg-gray-600 dark:!univer-text-gray-200
                `, iconClass)}
                style={iconStyle}
            >
                {open ? <LeftIcon /> : <CatalogueIcon />}
            </div>
            <div
                className={clsx(
                    className,
                    `
                      univer-absolute univer-left-0 univer-top-0 univer-box-border univer-flex univer-min-w-[180px]
                      univer-flex-col univer-px-4 univer-pb-4 univer-pt-14 univer-transition-all univer-duration-300
                    `,
                    {
                        'univer-rounded-r-2xl univer-bg-white univer-shadow univer-backdrop-blur-[10px] dark:!univer-bg-gray-900': isSideBar,
                    }
                )}
                style={{
                    ...style,
                    transform: open ? 'translateX(0)' : 'translateX(-100%)',
                    maxHeight,
                    opacity: open ? 1 : 0,
                    maxWidth: maxWidth ?? (mode === 'side-bar' ? 320 : 180),
                    paddingRight: mode === 'float' ? undefined : 0,
                }}
            >
                <div
                    ref={containerRef}
                    className={clsx('univer-flex-1 univer-overflow-y-auto univer-overflow-x-hidden', scrollbarClassName)}
                >
                    {menus?.map((menu) => (
                        <div
                            id={`univer-side-menu-${menu.id}`}
                            key={menu.id}
                            className={clsx(
                                commonClass,
                                {
                                    [titleClass]: menu.isTitle,
                                    [h1Class]: menu.level === 1,
                                    [textClass]: menu.level > 1,
                                    'univer-text-gray-500 dark:!univer-text-gray-400': menu.id !== activeId,
                                    'univer-text-gray-800 dark:!univer-text-gray-200': menu.id === activeId,
                                }
                            )}
                            style={{
                                paddingLeft: (menu.level - 1) * 12,
                            }}
                            onClick={() => {
                                onClick?.(menu);
                            }}
                        >
                            {menu.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
