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

import type { CSSProperties, KeyboardEvent } from 'react';
import { clsx, scrollbarClassName } from '@univerjs/design';
import { CatalogueIcon, MoreLeftIcon } from '@univerjs/icons';
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef } from 'react';

export interface ISideMenuItem {
    text: string;
    level: number;
    id: string;
    isTitle?: boolean;
}

export interface ISideMenuProps {
    label: string;
    menus?: ISideMenuItem[];
    onClick?: (menu: ISideMenuItem) => void;
    className?: string;
    style?: CSSProperties;
    mode?: 'float' | 'side-bar';
    maxHeight: number;
    activeId?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    maxWidth?: number;
    wrapperClass?: string;
    wrapperStyle?: CSSProperties;
    iconClass?: string;
    iconStyle?: CSSProperties;
}

export interface ISideMenuInstance {
    scrollTo: (id: string) => void;
}

export const SideMenu = forwardRef<ISideMenuInstance, ISideMenuProps>((props, ref) => {
    const { label, menus, onClick, className, style, mode, maxHeight, activeId, open, onOpenChange, maxWidth, wrapperClass, wrapperStyle, iconClass, iconStyle } = props;
    const panelId = useId();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const itemsRef = useRef(new Map<string, HTMLButtonElement>());
    const width = Math.min(256, maxWidth ?? 256);
    const instance: ISideMenuInstance = useMemo(() => ({
        scrollTo: (id: string) => {
            const container = containerRef.current;
            const target = itemsRef.current.get(id);
            if (!container || !target) return;

            const top = target.offsetTop;
            const bottom = top + target.offsetHeight;
            if (top < container.scrollTop) {
                container.scrollTo({ top });
            } else if (bottom > container.scrollTop + container.clientHeight) {
                container.scrollTo({ top: bottom - container.clientHeight });
            }
        },
    }), []);

    useImperativeHandle(ref, () => instance);

    useEffect(() => {
        if (open && activeId) {
            instance.scrollTo(activeId);
        }
    }, [activeId, instance, open]);

    useEffect(() => {
        if (!open || mode !== 'float') return;

        const handlePointerDown = (event: PointerEvent) => {
            if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
                onOpenChange?.(false);
            }
        };
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [mode, onOpenChange, open]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange?.(false);
            toggleRef.current?.focus();
            return;
        }
        const items = Array.from(itemsRef.current.values());
        const index = items.indexOf(event.target as HTMLButtonElement);
        if (index === -1) return;

        let next: number;
        switch (event.key) {
            case 'ArrowDown':
                next = Math.min(index + 1, items.length - 1);
                break;
            case 'ArrowUp':
                next = Math.max(index - 1, 0);
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = items.length - 1;
                break;
            default: return;
        }
        event.preventDefault();
        event.stopPropagation();
        items[next]?.focus();
    };

    return (
        <div
            ref={wrapperRef}
            className={clsx('univer-relative univer-ml-3', wrapperClass)}
            style={{ width, ...wrapperStyle }}
            onKeyDown={handleKeyDown}
        >
            <button
                ref={toggleRef}
                type="button"
                aria-label={label}
                aria-expanded={!!open}
                aria-controls={open ? panelId : undefined}
                title={label}
                onClick={() => onOpenChange?.(!open)}
                className={clsx(`
                  univer-absolute univer-top-1.5 univer-z-10 univer-flex univer-size-8 univer-cursor-pointer
                  univer-items-center univer-justify-center univer-rounded-md univer-border-0 univer-bg-gray-0
                  univer-text-gray-500 univer-transition-colors
                  hover:univer-bg-gray-100 hover:univer-text-gray-900
                  focus-visible:univer-outline focus-visible:univer-outline-2 focus-visible:univer-outline-primary-600
                  dark:univer-bg-gray-900 dark:univer-text-gray-400
                  dark:hover:univer-bg-gray-800
                `, !open && 'univer-shadow-sm', iconClass)}
                style={{ left: open ? width - 40 : 0, ...iconStyle }}
            >
                {open ? <MoreLeftIcon aria-hidden="true" /> : <CatalogueIcon aria-hidden="true" />}
            </button>
            {open && (
                <nav
                    id={panelId}
                    aria-label={label}
                    className={clsx(`
                      univer-box-border univer-flex univer-w-full univer-flex-col univer-overflow-hidden
                      univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-gray-0
                      univer-text-gray-700
                      dark:univer-border-gray-700 dark:univer-bg-gray-900 dark:univer-text-gray-200
                    `, mode === 'float' ? 'univer-shadow-md' : 'univer-shadow-sm', className)}
                    style={{ maxHeight, ...style }}
                >
                    <div
                        className="
                          univer-flex univer-h-11 univer-shrink-0 univer-items-center univer-gap-2 univer-px-3
                          univer-pr-12 univer-text-xs univer-font-medium univer-text-gray-500
                          dark:univer-text-gray-400
                        "
                    >
                        <CatalogueIcon aria-hidden="true" className="univer-shrink-0 univer-text-sm" />
                        <span className="univer-truncate">{label}</span>
                    </div>
                    <div
                        ref={containerRef}
                        className={clsx(`
                          univer-relative univer-min-h-0 univer-overflow-y-auto univer-overscroll-contain univer-px-2
                          univer-pb-2
                        `, scrollbarClassName)}
                    >
                        <ol className="univer-m-0 univer-list-none univer-p-0">
                            {menus?.map((menu) => (
                                <li key={menu.id} className={menu.isTitle ? 'univer-mb-1 univer-pb-1' : undefined}>
                                    <button
                                        ref={(element) => {
                                            if (element) itemsRef.current.set(menu.id, element);
                                            else itemsRef.current.delete(menu.id);
                                        }}
                                        type="button"
                                        aria-current={menu.id === activeId ? 'location' : undefined}
                                        title={menu.text}
                                        className={clsx(`
                                          univer-relative univer-box-border univer-flex univer-min-h-8 univer-w-full
                                          univer-cursor-pointer univer-items-center univer-rounded univer-border-0
                                          univer-bg-transparent univer-py-1.5 univer-pr-2 univer-text-left
                                          univer-text-sm univer-leading-5 univer-transition-colors
                                          hover:univer-bg-gray-100
                                          focus-visible:univer-outline focus-visible:univer-outline-2
                                          focus-visible:-univer-outline-offset-2
                                          focus-visible:univer-outline-primary-600
                                          dark:hover:univer-bg-gray-800
                                        `, menu.isTitle ? 'univer-font-semibold' : 'univer-font-normal', {
                                            'univer-bg-primary-50 univer-text-primary-700 hover:univer-bg-primary-50 dark:univer-bg-gray-700 dark:univer-text-primary-200 dark:hover:univer-bg-gray-700': menu.id === activeId,
                                            'univer-text-gray-900 dark:univer-text-gray-100': menu.isTitle && menu.id !== activeId,
                                            'univer-text-gray-600 dark:univer-text-gray-300': !menu.isTitle && menu.id !== activeId,
                                        })}
                                        style={{ paddingLeft: 10 + Math.max(0, menu.level - 1) * 12 }}
                                        onClick={() => {
                                            onClick?.(menu);
                                            if (mode === 'float') {
                                                onOpenChange?.(false);
                                                toggleRef.current?.focus();
                                            }
                                        }}
                                    >
                                        {menu.level > 1 && (
                                            <span
                                                aria-hidden="true"
                                                className="
                                                  univer-absolute univer-bottom-0 univer-top-0 univer-w-px
                                                  univer-bg-gray-200
                                                  dark:univer-bg-gray-700
                                                "
                                                style={{ left: 14 + Math.max(0, menu.level - 2) * 12 }}
                                            />
                                        )}
                                        {menu.id === activeId && (
                                            <span
                                                aria-hidden="true"
                                                className="
                                                  univer-absolute univer-bottom-2 univer-left-0 univer-top-2
                                                  univer-w-0.5 univer-rounded-full univer-bg-primary-600
                                                  dark:univer-bg-primary-400
                                                "
                                            />
                                        )}
                                        <span
                                            className={menu.isTitle
                                                ? 'univer-line-clamp-2 univer-break-words'
                                                : 'univer-truncate'}
                                        >
                                            {menu.text}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </nav>
            )}
        </div>
    );
});
