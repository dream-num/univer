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

import type { ILocale } from '@univerjs/design';
import type { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import { LocaleService, ThemeService, useDependency } from '@univerjs/core';
import { ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BuiltInUIPart } from '../services/parts/parts.service';
import { ComponentContainer, useComponentsOfPart } from './components/ComponentContainer';
import { MobileContextMenu } from './components/context-menu/MobileContextMenu';
import { Sidebar } from './components/sidebar/Sidebar';
import { ZenZone } from './components/zen-zone/ZenZone';
import styles from './mobile-app.module.less';
import { builtInGlobalComponents } from './parts';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered?: (container: HTMLElement) => void;
}

export function MobileApp(props: IUniverAppProps) {
    const {
        header = true,
        footer = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const contentRef = useRef<HTMLDivElement>(null);

    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            // cleanup
            document.body.removeChild(portalContainer);
        };
    }, [localeService, mountContainer, portalContainer, themeService.currentTheme$]);

    return (
        <ConfigProvider locale={locale?.design} mountContainer={portalContainer}>
            {/**
              * IMPORTANT! This `tabIndex` should not be moved. This attribute allows the element to catch
              * all focusin event merged from its descendants. The DesktopLayoutService would listen to focusin events
              * bubbled to this element and refocus the input element.
              */}
            <div className={styles.appLayout} tabIndex={-1} onBlur={(e) => e.stopPropagation()}>
                {/* header */}
                {header && (
                    <header className={styles.appContainerHeader}></header>
                )}

                {/* content */}
                <section className={styles.appContainer}>
                    <div className={styles.appContainerWrapper}>
                        <aside className={styles.appContainerLeftSidebar}>
                            <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                        </aside>

                        <section className={styles.appContainerContent}>
                            <header className={styles.appHeader}>
                                {header && <ComponentContainer key="header" components={headerComponents} />}
                            </header>

                            <section
                                className={styles.appContainerCanvas}
                                ref={contentRef}
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <ComponentContainer key="content" components={contentComponents} />
                            </section>
                        </section>

                        <aside className={styles.appContainerSidebar}>
                            <Sidebar />
                        </aside>
                    </div>

                    {/* footer */}
                    {footer && (
                        <footer className={styles.appFooter}>
                            <ComponentContainer key="footer" components={footerComponents} />
                        </footer>
                    )}

                    <ZenZone />
                </section>
            </div>
            <ComponentContainer key="global" components={globalComponents} />
            <ComponentContainer key="built-in-global" components={builtInGlobalComponents} />
            {contextMenu && <MobileContextMenu />}
        </ConfigProvider>
    );
}
