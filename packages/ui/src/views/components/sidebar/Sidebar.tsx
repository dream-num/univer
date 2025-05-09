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

import type { CSSProperties } from 'react';
import type { ICustomLabelProps } from '../../../components/custom-label/CustomLabel';
import { borderLeftBottomClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { CloseSingle } from '@univerjs/icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { useDependency, useObservable } from '../../../utils/di';

export interface ISidebarMethodOptions {
    id?: string;
    header?: ICustomLabelProps;
    children?: ICustomLabelProps;
    bodyStyle?: CSSProperties;
    footer?: ICustomLabelProps;

    visible?: boolean;

    width?: number | string;

    onClose?: () => void;
    onOpen?: () => void;
}

export function Sidebar() {
    const sidebarService = useDependency(ISidebarService);
    const sidebarOptions = useObservable<ISidebarMethodOptions>(sidebarService.sidebarOptions$);
    const scrollRef = useRef<HTMLDivElement>(null);

    const options = useMemo(() => {
        if (!sidebarOptions) {
            return null;
        }

        const copy = { ...sidebarOptions } as Omit<ISidebarMethodOptions, 'children'> & {
            children?: React.ReactNode;
            header?: React.ReactNode;
            footer?: React.ReactNode;
        };

        for (const key of ['children', 'header', 'footer']) {
            const k = key as keyof ISidebarMethodOptions;

            if (sidebarOptions[k]) {
                const { key, ...props } = sidebarOptions[k] as any;

                if (props) {
                    (copy as any)[k] = <CustomLabel key={key} {...props} />;
                }
            }
        }

        return copy;
    }, [sidebarOptions]);

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

        if (typeof options.width === 'number') {
            return `${options.width}px`;
        }

        return options.width;
    }, [options]);

    function handleClose() {
        const options = {
            ...sidebarOptions,
            visible: false,
        };

        sidebarService.options.visible = false;
        sidebarService.sidebarOptions$.next(options);
        options?.onClose?.();
    }
    return (
        <section
            data-u-comp="sidebar"
            className={clsx(`
              univer-relative univer-h-full univer-bg-white
              dark:univer-bg-gray-900
            `, {
                'univer-w-96 univer-translate-x-0': options?.visible,
                'univer-w-0 univer-translate-x-full': !options?.visible,
            })}
            style={{ width }}
        >
            <section
                ref={scrollRef}
                className={clsx(`
                  univer-box-border univer-grid univer-h-0 univer-min-h-full univer-grid-rows-[auto_1fr_auto]
                  univer-overflow-y-auto
                `, borderLeftBottomClassName, scrollbarClassName)}
            >
                <header
                    className={`
                      univer-sticky univer-top-0 univer-z-10 univer-box-border univer-flex univer-items-center
                      univer-justify-between univer-p-4 univer-pb-2 univer-text-base univer-font-medium
                      univer-text-gray-800
                      dark:univer-text-white
                    `}
                >
                    {options?.header}

                    <a className="univer-cursor-pointer univer-text-gray-500" onClick={handleClose}>
                        <CloseSingle />
                    </a>
                </header>

                <section className="univer-box-border univer-px-4" style={options?.bodyStyle}>
                    {options?.children}
                </section>

                {options?.footer && (
                    <footer
                        className="univer-sticky univer-bottom-0 univer-box-border univer-p-4"
                    >
                        {options.footer}
                    </footer>
                )}
            </section>
        </section>
    );
}
