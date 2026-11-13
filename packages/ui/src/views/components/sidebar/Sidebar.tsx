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
import { LocaleService } from '@univerjs/core';
import { borderLeftBottomClassName, clsx, ResizeHandle, scrollbarClassName } from '@univerjs/design';
import { CloseIcon } from '@univerjs/icons';
import { useEffect, useMemo, useRef } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { ICustomLabelProps } from '../../custom-label/CustomLabel';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';

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

export interface IRenderedSidebarOptions extends Omit<ISidebarMethodOptions, 'children' | 'footer' | 'header'> {
    children?: ReactNode;
    footer?: ReactNode;
    header?: ReactNode;
}

export function renderSidebarOptions(options?: ISidebarMethodOptions): IRenderedSidebarOptions | null {
    if (!options) return null;

    const { children, footer, header, ...rest } = options;
    const renderLabel = (label?: SidebarCustomLabelProps) => {
        if (!label) return undefined;

        const { key, ...props } = label;
        return <CustomLabel key={key} {...props} />;
    };

    return {
        ...rest,
        children: renderLabel(children),
        footer: renderLabel(footer),
        header: renderLabel(header),
    };
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
    const returnFocusElementRef = useRef<HTMLElement | null>(null);
    const previousSidebarIdRef = useRef<string | undefined>(undefined);
    const wasVisibleRef = useRef(false);

    const options = useMemo(() => renderSidebarOptions(sidebarOptions), [sidebarOptions]);

    useEffect(() => {
        const isVisible = !!options?.visible;
        const isNewPanel = isVisible && (!wasVisibleRef.current || previousSidebarIdRef.current !== options?.id);

        if (isNewPanel) {
            const activeElement = document.activeElement;
            if (
                activeElement instanceof HTMLElement &&
                activeElement !== document.body &&
                !sidebarRef.current?.contains(activeElement)
            ) {
                returnFocusElementRef.current = activeElement;
            }
            closeButtonRef.current?.focus();
        } else if (!isVisible && wasVisibleRef.current) {
            const activeElement = document.activeElement;
            const shouldRestoreFocus = activeElement === document.body || !!sidebarRef.current?.contains(activeElement);
            const returnFocusElement = returnFocusElementRef.current;
            if (shouldRestoreFocus && returnFocusElement?.isConnected) {
                returnFocusElement.focus({ preventScroll: true });
            }
            returnFocusElementRef.current = null;
        }

        wasVisibleRef.current = isVisible;
        previousSidebarIdRef.current = options?.id;
    }, [options?.id, options?.visible]);

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
        if (!options?.visible) return 0;

        const savedWidth = sidebarService.width;
        if (savedWidth) {
            return `${savedWidth}px`;
        }

        if (typeof options.width === 'number') {
            return `${options.width}px`;
        }

        return options.width;
    }, [options, sidebarService]);

    function handleClose() {
        sidebarService.close(sidebarOptions?.id);
    }

    return (
        <section
            ref={sidebarRef}
            data-u-comp="sidebar"
            role="complementary"
            aria-expanded={!!options?.visible}
            aria-hidden={!options?.visible}
            aria-label={localeService.t<LocaleKey>('ui.sidebar.panel')}
            className={clsx(`
              univer-relative univer-h-full univer-flex-shrink-0 univer-bg-gray-0 univer-text-gray-900
              dark:!univer-bg-gray-900 dark:!univer-text-gray-0
            `, {
                'univer-w-96 univer-translate-x-0': options?.visible,
                'univer-pointer-events-none univer-invisible univer-w-0 univer-translate-x-full': !options?.visible,
            })}
            style={{ width }}
        >
            {/* Resize handle */}
            {options?.visible && (
                <ResizeHandle
                    label={localeService.t<LocaleKey>('ui.sidebar.resize')}
                    currentWidth={sidebarService.width || (typeof options.width === 'number' ? options.width : 384)}
                    getCurrentWidth={() => sidebarRef.current?.getBoundingClientRect().width || sidebarService.width || 384}
                    minimumWidth={MIN_SIDEBAR_WIDTH}
                    maximumWidth={MAX_SIDEBAR_WIDTH}
                    side="left"
                    step={20}
                    onResize={(nextWidth) => {
                        if (sidebarRef.current) sidebarRef.current.style.width = `${nextWidth}px`;
                    }}
                    onResizeEnd={(nextWidth) => sidebarService.setWidth(nextWidth)}
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
                          univer-flex univer-size-6 univer-cursor-pointer univer-appearance-none univer-items-center
                          univer-justify-center univer-rounded-sm univer-border-none univer-bg-transparent univer-p-0
                          univer-text-gray-500
                          focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-500
                          dark:!univer-text-gray-300
                        `}
                        onClick={handleClose}
                        aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                    >
                        <CloseIcon />
                    </button>
                </header>

                <section className="univer-box-border univer-min-w-0 univer-cursor-default univer-px-4 univer-pb-4">
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
