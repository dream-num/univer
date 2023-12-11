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
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import styles from './index.module.less';
import type { ISidebarMethodOptions } from './interface';

export function Sidebar() {
    const sidebarService = useDependency(ISidebarService);

    const [sidebarOptions, setSidebarOptions] = useState<ISidebarMethodOptions>({});

    useEffect(() => {
        const subscribtion = sidebarService.sidebarOptions$.subscribe((options: ISidebarMethodOptions) => {
            setSidebarOptions(options);
        });

        return () => {
            subscribtion.unsubscribe();
        };
    }, []);

    const options = sidebarOptions as Omit<ISidebarMethodOptions, 'children'> & {
        children?: React.ReactNode;
        header?: React.ReactNode;
        footer?: React.ReactNode;
    };
    for (const key of ['children', 'header', 'footer']) {
        const k = key as keyof ISidebarMethodOptions;

        if (sidebarOptions[k]) {
            const props = sidebarOptions[k] as any;

            if (props) {
                (options as any)[k] = <CustomLabel {...props} />;
            }
        }
    }

    const _className = clsx(styles.sidebar, {
        [styles.sidebarOpen]: options.visible,
    });

    const width = useMemo(() => {
        if (!options.visible) return 0;

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

        setSidebarOptions(options);
        sidebarService.sidebarOptions$.next(options);
        options?.onClose?.();
    }

    return (
        <section className={_className} style={{ width }}>
            <section className={styles.sidebarContainer}>
                <header className={styles.sidebarHeader}>
                    {options?.header}

                    <a className={styles.sidebarHeaderClose} onClick={handleClose}>
                        <CloseSingle />
                    </a>
                </header>

                <section className={styles.sidebarBody}>{options?.children}</section>

                {options?.footer && <footer className={styles.sidebarFooter}>{options.footer}</footer>}
            </section>
        </section>
    );
}
