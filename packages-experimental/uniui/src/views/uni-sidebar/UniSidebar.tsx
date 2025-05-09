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

import type { ISidebarMethodOptions } from '@univerjs/ui';
import { borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { CloseSingle } from '@univerjs/icons';
import { CustomLabel, ILeftSidebarService, ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef } from 'react';

export interface IUniSidebarProps {
    position: 'left' | 'right';
    sidebarService: ISidebarService;
    showClose?: boolean;
}

export function LeftSidebar() {
    const sidebarService = useDependency(ILeftSidebarService);
    return <UniSidebar position="left" sidebarService={sidebarService} showClose={false} />;
}

export function RightSidebar() {
    const sidebarService = useDependency(ISidebarService);
    return <UniSidebar position="right" sidebarService={sidebarService} />;
}

export function UniSidebar(props: IUniSidebarProps) {
    const { sidebarService, position, showClose = true } = props;
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
                const props = sidebarOptions[k] as any;

                if (props) {
                    (copy as any)[k] = <CustomLabel {...props} />;
                }
            }
        }

        return copy;
    }, [sidebarOptions]);

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
        if (!options?.visible) return '0px';

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

        sidebarService.sidebarOptions$.next(options);
        options?.onClose?.();
    }

    const visible = options?.visible ?? false;
    return (
        <aside
            className={clsx(`
              univer-pointer-events-auto univer-fixed univer-bottom-3 univer-top-12 univer-z-20 univer-box-border
              univer-overflow-hidden univer-rounded-lg univer-shadow-lg univer-transition-all
            `, borderClassName, {
                'univer-left-3 univer-w-[180px]': position === 'left',
                'univer-right-3 univer-min-w-[280px] univer-max-w-[400px]': position === 'right',
                'univer-translate-x-[calc(-100%-12px)]': position === 'left' && !visible,
                'univer-translate-x-[calc(100%+12px)]': position === 'right' && !visible,
            })}
            style={{ width }}
        >
            <section
                ref={scrollRef}
                className={clsx(`
                  univer-m-auto univer-box-border univer-flex univer-h-0 univer-min-h-full univer-w-full univer-flex-col
                  univer-overflow-hidden univer-overflow-y-auto univer-bg-white
                `, scrollbarClassName)}
            >
                { showClose && (
                    <header
                        className={`
                          univer-sticky univer-top-0 univer-z-10 univer-box-border univer-flex univer-h-[44px]
                          univer-flex-shrink-0 univer-flex-grow-0 univer-content-between univer-items-center
                          univer-justify-between univer-p-4 univer-pb-0 univer-text-lg univer-font-medium
                        `}
                    >
                        {options?.header}

                        <a className="univer-cursor-pointer" onClick={handleClose}>
                            <CloseSingle />
                        </a>
                    </header>
                )}

                <section
                    className="univer-box-border univer-flex-grow univer-p-2"
                >
                    {options?.children}
                </section>
                {options?.footer && <footer className="univer-sticky univer-bottom-0 univer-box-border univer-p-4">{options.footer}</footer>}
            </section>
        </aside>
    );
}
