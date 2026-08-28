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

import type { Attributes, ReactNode } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { ICustomLabelProps } from '../../custom-label/CustomLabel';
import type { MobileDrawerSnap } from '../mobile-drawer/MobileDrawer';
import { LocaleService } from '@univerjs/core';
import { borderLeftBottomClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { CloseIcon } from '@univerjs/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';
import { MobileDrawer } from '../mobile-drawer/MobileDrawer';

type SidebarCustomLabelProps = ICustomLabelProps & Attributes;

export interface ISidebarMethodOptions {
    id?: string;
    header?: SidebarCustomLabelProps;
    children?: SidebarCustomLabelProps;
    footer?: SidebarCustomLabelProps;

    visible?: boolean;

    width?: number | string;

    onClose?: (id?: string) => void;
    onOpen?: () => void;
}

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 800;

export function Sidebar() {
    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const sidebarOptions = useObservable<ISidebarMethodOptions>(sidebarService.sidebarOptions$);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragWidthRef = useRef<number | null>(null);

    const options = useMemo(() => {
        if (!sidebarOptions) {
            return null;
        }

        const copy = { ...sidebarOptions } as Omit<ISidebarMethodOptions, 'children'> & {
            children?: ReactNode;
            header?: ReactNode;
            footer?: ReactNode;
        };

        for (const key of ['children', 'header', 'footer']) {
            const k = key as keyof ISidebarMethodOptions;

            if (sidebarOptions[k]) {
                const { key: itemKey, ...props } = sidebarOptions[k] as any;

                if (props) {
                    (copy as any)[k] = <CustomLabel key={itemKey} {...props} />;
                }
            }
        }

        return copy;
    }, [sidebarOptions]);

    // Focus management: move focus into the sidebar when it opens
    useEffect(() => {
        if (options?.visible && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [options?.visible]);

    // ESC key to close sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && sidebarService.visible) {
                e.stopPropagation();
                sidebarService.close();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sidebarService]);

    // Drag resize handlers
    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        if (!isDragging) {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!sidebarRef.current) return;
            const rect = sidebarRef.current.getBoundingClientRect();
            const newWidth = rect.right - e.clientX;
            const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH));
            dragWidthRef.current = clampedWidth;
            sidebarRef.current.style.width = `${clampedWidth}px`;
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            if (dragWidthRef.current != null) {
                sidebarService.setWidth(dragWidthRef.current);
                dragWidthRef.current = null;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, sidebarService]);

    useEffect(() => {
        if (scrollRef.current) {
            sidebarService.setContainer(scrollRef.current);
        }
        return () => {
            sidebarService.setContainer(undefined);
        };
    }, [sidebarService]);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            sidebarService.scrollEvent$.next(e);
        };
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            scrollElement?.removeEventListener('scroll', handleScroll);
        };
    }, [sidebarService]);

    const width = useMemo(() => {
        if (isDragging && dragWidthRef.current != null) {
            return `${dragWidthRef.current}px`;
        }
        if (!options?.visible) return 0;

        const savedWidth = sidebarService.width;
        if (savedWidth) {
            return `${savedWidth}px`;
        }

        if (typeof options.width === 'number') {
            return `${options.width}px`;
        }

        return options.width;
    }, [isDragging, options, sidebarService]);

    function handleClose() {
        sidebarService.close(sidebarOptions?.id);
    }

    return (
        <section
            ref={sidebarRef}
            data-u-comp="sidebar"
            role="complementary"
            aria-expanded={!!options?.visible}
            aria-label={localeService.t<LocaleKey>('ui.sidebar.panel')}
            className={clsx(`
              univer-relative univer-h-full univer-flex-shrink-0 univer-bg-gray-0 univer-text-gray-900
              dark:!univer-bg-gray-900 dark:!univer-text-gray-0
            `, {
                'univer-w-96 univer-translate-x-0': options?.visible,
                'univer-w-0 univer-translate-x-full': !options?.visible,
            })}
            style={{ width: isDragging ? undefined : width }}
        >
            {/* Resize handle */}
            {options?.visible && (
                <div
                    className={`
                      hover:univer-bg-primary-500/30
                      active:univer-bg-primary-500/50
                      univer-absolute univer-left-0 univer-top-0 univer-z-20 univer-h-full univer-w-1
                      univer-cursor-col-resize univer-transition-colors
                    `}
                    onMouseDown={handleResizeMouseDown}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={localeService.t<LocaleKey>('ui.sidebar.resize')}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (!sidebarRef.current) return;
                        const currentWidth = sidebarRef.current.getBoundingClientRect().width;
                        let newWidth = currentWidth;
                        if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            newWidth = Math.max(MIN_SIDEBAR_WIDTH, currentWidth - 20);
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            newWidth = Math.min(MAX_SIDEBAR_WIDTH, currentWidth + 20);
                        }
                        if (newWidth !== currentWidth) {
                            sidebarRef.current.style.width = `${newWidth}px`;
                            sidebarService.setWidth(newWidth);
                        }
                    }}
                />
            )}

            <section
                ref={scrollRef}
                className={clsx(`
                  univer-box-border univer-grid univer-h-0 univer-min-h-full univer-grid-rows-[auto_1fr_auto]
                  univer-overflow-y-auto
                `, borderLeftBottomClassName, scrollbarClassName)}
            >
                <header
                    className={`
                      univer-sticky univer-top-0 univer-z-10 univer-box-border univer-flex univer-cursor-default
                      univer-items-center univer-justify-between univer-bg-gray-0 univer-p-4 univer-pb-2
                      univer-text-base univer-font-medium univer-text-gray-800
                      dark:!univer-bg-gray-900 dark:!univer-text-gray-0
                    `}
                >
                    {options?.header}

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className={`
                          focus:univer-ring-primary-500/50
                          univer-flex univer-size-6 univer-cursor-pointer univer-appearance-none univer-items-center
                          univer-justify-center univer-rounded-sm univer-border-none univer-bg-transparent univer-p-0
                          univer-text-gray-500
                          focus:univer-outline-none focus:univer-ring-2
                          dark:!univer-text-gray-300
                        `}
                        onClick={handleClose}
                        aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                    >
                        <CloseIcon />
                    </button>
                </header>

                <section className="univer-box-border univer-min-w-0 univer-cursor-default univer-px-4">
                    {options?.children}
                </section>

                {options?.footer && (
                    <footer
                        className={`
                          univer-sticky univer-bottom-0 univer-box-border univer-bg-gray-0 univer-p-4
                          dark:!univer-bg-gray-900
                        `}
                    >
                        {options.footer}
                    </footer>
                )}
            </section>
        </section>
    );
}

export function MobileSidebar() {
    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const sidebarOptions = useObservable<ISidebarMethodOptions>(sidebarService.sidebarOptions$);
    const scrollRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('expanded');
    const options = useMemo(() => {
        if (!sidebarOptions) return null;

        const { children, header, footer, ...rest } = sidebarOptions;
        const renderLabel = (label?: SidebarCustomLabelProps) => {
            if (!label) return undefined;

            const { key, ...props } = label;
            return <CustomLabel key={key} {...props} />;
        };

        return {
            ...rest,
            children: renderLabel(children),
            header: renderLabel(header),
            footer: renderLabel(footer),
        };
    }, [sidebarOptions]);

    useEffect(() => {
        if (options?.visible) closeButtonRef.current?.focus();
    }, [options?.visible]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        sidebarService.setContainer(scrollElement ?? undefined);
        const handleScroll = (event: Event) => sidebarService.scrollEvent$.next(event);
        scrollElement?.addEventListener('scroll', handleScroll);
        return () => {
            scrollElement?.removeEventListener('scroll', handleScroll);
            sidebarService.setContainer(undefined);
        };
    }, [options?.visible, sidebarService]);

    if (!options?.visible) return null;

    const close = () => sidebarService.close(sidebarOptions?.id);

    return (
        <div className="univer-fixed univer-inset-0 univer-z-[1100]" data-u-comp="mobile-sidebar">
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                className="
                  univer-absolute univer-inset-0 univer-m-0 univer-appearance-none univer-rounded-none univer-border-0
                  univer-bg-black/35 univer-p-0
                "
                onClick={close}
            />
            <MobileDrawer
                componentName="mobile-sidebar-drawer"
                snap={drawerSnap}
                expandLabel={localeService.t<LocaleKey>('ui.ribbon.more')}
                collapseLabel={localeService.t<LocaleKey>('ui.ribbon.more')}
                onSnapChange={setDrawerSnap}
                onClose={close}
                role="dialog"
                ariaLabel={localeService.t<LocaleKey>('ui.sidebar.panel')}
                contentRef={scrollRef}
                panelClassName="
                  univer-bg-gray-0 univer-text-gray-900
                  dark:!univer-bg-gray-900 dark:!univer-text-gray-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-m-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-h-12
                  [&_[data-u-comp='mobile-actions']>button]:!univer-min-w-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-flex-1
                  [&_[data-u-comp='mobile-actions']>button]:!univer-rounded-xl
                  [&_[data-u-comp='mobile-actions']]:!univer-flex [&_[data-u-comp='mobile-actions']]:!univer-w-full
                  [&_[data-u-comp='mobile-actions']]:!univer-justify-stretch
                  [&_[data-u-comp='mobile-actions']]:!univer-gap-3
                "
                contentClassName="univer-min-h-0 univer-px-4 univer-pb-4"
                header={(
                    <header
                        className="
                          univer-flex univer-h-12 univer-flex-1 univer-items-center univer-justify-between univer-px-4
                        "
                    >
                        <div className="univer-min-w-0 univer-truncate univer-text-base univer-font-semibold">{options.header}</div>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            className="
                              univer-flex univer-size-10 univer-shrink-0 univer-items-center univer-justify-center
                              univer-rounded-full univer-border-0 univer-bg-transparent univer-text-xl
                              univer-text-gray-600 univer-outline-none
                              active:univer-bg-gray-100
                              dark:!univer-text-gray-300
                              dark:active:!univer-bg-gray-700
                            "
                            onClick={close}
                            aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                        >
                            <CloseIcon />
                        </button>
                    </header>
                )}
                footer={options.footer
                    ? (
                        <footer
                            data-u-comp="mobile-actions"
                            className="
                              univer-shrink-0 univer-border-0 univer-border-t univer-border-solid univer-border-gray-200
                              univer-p-4
                              dark:!univer-border-gray-700
                            "
                        >
                            {options.footer}
                        </footer>
                    )
                    : undefined}
            >
                {options.children}
            </MobileDrawer>
        </div>
    );
}
