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

import { LocaleService, ThemeService } from '@univerjs/core';
import type { ILocale } from '@univerjs/design';
import { ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { ComponentType } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import { IMessageService } from '../services/message/message.service';
import { ComponentManager } from '../common';
import { CELL_ALERT_KEY } from './constant';
import styles from './app.module.less';
import { ComponentContainer } from './components/ComponentContainer';
import { Toolbar } from './components/doc-bars/Toolbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { ZenZone } from './components/zen-zone/ZenZone';
import { globalComponents } from './parts';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;
    headerComponents?: Set<() => ComponentType>;
    contentComponents?: Set<() => ComponentType>;
    footerComponents?: Set<() => ComponentType>;
    headerMenuComponents?: Set<() => ComponentType>;
    onRendered?: (container: HTMLElement) => void;
}

export function App(props: IUniverAppProps) {
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const messageService = useDependency(IMessageService);
    const componentManager = useDependency(ComponentManager);
    const contentRef = useRef<HTMLDivElement>(null);

    const CellAlert = componentManager.get(CELL_ALERT_KEY);
    const {
        mountContainer,
        headerComponents,
        headerMenuComponents,
        contentComponents,
        footerComponents,
        // sidebarComponents,
        onRendered,
    } = props;

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }
    }, []);

    useEffect(() => {
        if (contentRef.current) {
            onRendered?.(contentRef.current);
        }
    }, [onRendered]);

    const [locale, setLocale] = useState<ILocale>(localeService.getLocales() as unknown as ILocale);

    // Create a portal container for injecting global component themes.
    const portalContainer = useMemo<HTMLElement>(() => document.createElement('div'), []);

    useEffect(() => {
        document.body.appendChild(portalContainer);
        messageService.setContainer(portalContainer);

        const subscriptions = [
            localeService.localeChanged$.subscribe(() => {
                setLocale(localeService.getLocales() as unknown as ILocale);
            }),
            themeService.currentTheme$.subscribe((theme) => {
                themeInstance.setTheme(mountContainer, theme);
                portalContainer && themeInstance.setTheme(portalContainer, theme);
            }),
        ];

        return () => {
            // batch unsubscribe
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, [portalContainer]);

    return (
        <ConfigProvider locale={locale} mountContainer={portalContainer}>
            <div className={styles.appLayout}>
                {/* header */}
                {props.toolbar && (
                    <header className={styles.appContainerHeader}>
                        <Toolbar headerMenuComponents={headerMenuComponents} />
                    </header>
                )}

                {/* content */}
                <section className={styles.appContainer}>
                    <div className={styles.appContainerWrapper}>
                        <section className={styles.appContainerContent}>
                            <header>
                                <ComponentContainer components={headerComponents} />
                            </header>

                            <section
                                className={styles.appContainerCanvas}
                                ref={contentRef}
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {CellAlert && <CellAlert />}
                                <ComponentContainer components={contentComponents} />
                            </section>
                        </section>

                        <aside className={styles.appContainerSidebar}>
                            <Sidebar />
                        </aside>
                    </div>

                    {/* footer */}
                    {props.footer && (
                        <footer className={styles.appFooter}>
                            <ComponentContainer components={footerComponents} />
                        </footer>
                    )}

                    <ZenZone />

                </section>
            </div>

            <ComponentContainer components={globalComponents} />
        </ConfigProvider>
    );
}
