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

import { CloseSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/core';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import { CustomLabel, ILeftSidebarService, ISidebarService, useObservable } from '@univerjs/ui';
import styles from './index.module.less';

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

    const rootClassName = clsx(styles.uniSidebar, {
        [styles.uniSidebarOpen]: options?.visible,
        [styles.uniSidebarLeft]: position === 'left',
        [styles.uniSidebarRight]: position === 'right',
    });

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

        sidebarService.sidebarOptions$.next(options);
        options?.onClose?.();
    }
    return (
        <aside className={rootClassName} style={{ width }}>
            <section className={styles.uniSidebarContainer} ref={scrollRef}>
                { showClose && (
                    <header className={styles.uniSidebarHeader}>
                        {options?.header}

                        <a className={styles.uniSidebarHeaderClose} onClick={handleClose}>
                            <CloseSingle />
                        </a>
                    </header>
                )}

                <section className={styles.uniSidebarBody}>{options?.children}</section>

                {options?.footer && <footer className={styles.uniSidebarFooter}>{options.footer}</footer>}
            </section>
        </aside>
    );
}
