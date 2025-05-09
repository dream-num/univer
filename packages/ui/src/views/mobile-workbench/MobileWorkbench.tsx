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

import type { ILocale } from '@univerjs/design';
import type { IWorkbenchOptions } from '../../controllers/ui/ui.controller';
import { LocaleService, ThemeService } from '@univerjs/core';
import { borderBottomClassName, clsx, ConfigProvider } from '@univerjs/design';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BuiltInUIPart } from '../../services/parts/parts.service';
import { useDependency } from '../../utils/di';
import { ComponentContainer, useComponentsOfPart } from '../components/ComponentContainer';
import { MobileContextMenu } from '../components/context-menu/MobileContextMenu';
import { GlobalZone } from '../components/global-zone/GlobalZone';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ZenZone } from '../components/zen-zone/ZenZone';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered?: (container: HTMLElement) => void;
}

export function MobileWorkbench(props: IUniverAppProps) {
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

    const [darkMode, setDarkMode] = useState<boolean>(false);
    useEffect(() => {
        const sub = themeService.darkMode$.subscribe((darkMode) => {
            setDarkMode(darkMode);
        });

        return () => {
            sub.unsubscribe();
        };
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
            <div
                data-u-comp="app-layout"
                className={clsx(`
                  univer-relative univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-bg-white
                  dark:univer-bg-gray-800
                `, {
                    'univer-dark': darkMode,
                })}
                tabIndex={-1}
                onBlur={(e) => e.stopPropagation()}
            >
                {/* header */}
                {header && (
                    <header className="univer-relative univer-z-10 univer-w-full" />
                )}

                {/* content */}
                <section className="univer-relative univer-flex univer-min-h-0 univer-flex-1 univer-flex-col">
                    <div
                        className={`
                          univer-grid univer-h-full univer-grid-cols-[auto_1fr_auto] univer-grid-rows-[100%]
                          univer-overflow-hidden
                        `}
                    >
                        <aside className="univer-h-full">
                            <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                        </aside>

                        <section
                            className={clsx(`
                              univer-relative univer-grid univer-flex-1 univer-grid-rows-[auto_1fr]
                              univer-overflow-hidden univer-bg-white
                            `, borderBottomClassName)}
                        >
                            <header className="univer-w-screen">
                                {header && <ComponentContainer key="header" components={headerComponents} />}
                            </header>

                            <section
                                ref={contentRef}
                                className="univer-relative univer-overflow-hidden"
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <ComponentContainer key="content" components={contentComponents} />
                            </section>
                        </section>

                        <aside className="univer-h-full">
                            <Sidebar />
                        </aside>
                    </div>

                    {/* footer */}
                    {footer && (
                        <footer>
                            <ComponentContainer key="footer" components={footerComponents} />
                        </footer>
                    )}
                    <GlobalZone />
                    <ZenZone />
                </section>
            </div>
            <ComponentContainer key="global" components={globalComponents} />
            {contextMenu && <MobileContextMenu />}
        </ConfigProvider>
    );
}
