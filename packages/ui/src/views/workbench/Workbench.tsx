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
import type { IUniverUIConfig } from '../../controllers/config.schema';
import type { IWorkbenchOptions } from '../../controllers/ui/ui.controller';
import { IConfigService, LocaleService, ThemeService } from '@univerjs/core';
import { borderBottomClassName, clsx, ConfigContext, ConfigProvider } from '@univerjs/design';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfigValue } from '../../components/hooks';
import { UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { BuiltInUIPart } from '../../services/parts/parts.service';
import { ThemeSwitcherService } from '../../services/theme-switcher/theme-switcher.service';
import { useDependency } from '../../utils/di';
import { ComponentContainer, useComponentsOfPart } from '../components/ComponentContainer';
import { DesktopContextMenu } from '../components/context-menu/ContextMenu';
import { GlobalZone } from '../components/global-zone/GlobalZone';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ZenZone } from '../components/zen-zone/ZenZone';

export interface IUniverWorkbenchProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered?: (containerElement: HTMLElement) => void;
}

export function DesktopWorkbench(props: IUniverWorkbenchProps) {
    const uiConfig = useConfigValue<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
    return <DesktopWorkbenchContent {...props} {...uiConfig} />;
}

export function DesktopWorkbenchContent(props: IUniverWorkbenchProps) {
    const {
        header = true,
        toolbar = true,
        footer = true,
        headerMenu = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const themeSwitcherService = useDependency(ThemeSwitcherService);
    const contentRef = useRef<HTMLDivElement>(null);
    const configService = useDependency(IConfigService);
    const uiConfig = configService.getConfig(UI_PLUGIN_CONFIG_KEY) as IUniverUIConfig;
    const customHeaderComponents = useComponentsOfPart(BuiltInUIPart.CUSTOM_HEADER);
    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const headerMenuComponents = useComponentsOfPart(BuiltInUIPart.HEADER_MENU);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);
    const toolbarComponents = useComponentsOfPart(BuiltInUIPart.TOOLBAR);

    const popupRootId = uiConfig?.popupRootId ?? 'univer-popup-portal';

    useLayoutEffect(() => {
        const sub = themeService.currentTheme$.subscribe((theme) => {
            themeSwitcherService.injectThemeToHead(theme);
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    const [darkMode, setDarkMode] = useState<boolean>(false);
    useLayoutEffect(() => {
        const sub = themeService.darkMode$.subscribe((darkMode) => {
            setDarkMode(darkMode);

            if (darkMode) {
                document.documentElement.classList.add('univer-dark');
            } else {
                document.documentElement.classList.remove('univer-dark');
            }
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
                data-u-comp="workbench-layout"
                className={clsx(`
                  univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-bg-white
                  dark:univer-bg-gray-800
                `, {
                    'univer-dark': darkMode,
                })}
                tabIndex={-1}
                onBlur={(e) => e.stopPropagation()}
            >
                {/* user header */}
                <div className="univer-relative univer-flex univer-min-h-0 univer-flex-col univer-bg-white">
                    <ComponentContainer key="custom-header" components={customHeaderComponents} />
                </div>

                {/* header */}
                {header && toolbar && (
                    <header
                        data-u-comp="headerbar"
                        className="univer-relative univer-z-10 univer-w-full"
                    >
                        <ComponentContainer
                            key="toolbar"
                            components={toolbarComponents}
                            sharedProps={{
                                headerMenuComponents,
                                headerMenu,
                            }}
                        />
                    </header>
                )}

                {/* content */}
                <section className="univer-relative univer-flex univer-min-h-0 univer-flex-1 univer-flex-col">
                    <div
                        className={`
                          univer-grid univer-h-full univer-grid-cols-[auto_1fr_auto] univer-grid-rows-[100%]
                          univer-overflow-hidden
                        `}
                    >
                        <aside data-u-comp="left-sidebar" className="univer-h-full">
                            <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                        </aside>

                        <section
                            className={clsx(`
                              univer-relative univer-grid univer-flex-1 univer-grid-rows-[auto_1fr]
                              univer-overflow-hidden univer-bg-white
                            `, borderBottomClassName)}
                        >
                            <header>
                                {header && <ComponentContainer key="header" components={headerComponents} />}
                            </header>

                            <section
                                className={`
                                  univer-relative univer-overflow-hidden
                                  dark:univer-bg-gray-900
                                `}
                                ref={contentRef}
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <ComponentContainer key="content" components={contentComponents} />
                            </section>

                        </section>

                        <aside data-u-comp="right-sidebar" className="univer-h-full">
                            <Sidebar />
                        </aside>
                    </div>

                    {/* footer */}
                    {footer && (
                        <footer>
                            <ComponentContainer key="footer" components={footerComponents} sharedProps={{ contextMenu }} />
                        </footer>
                    )}
                    <ZenZone />

                </section>
            </div>
            <ComponentContainer key="global" components={globalComponents} />
            <GlobalZone />
            {contextMenu && <DesktopContextMenu />}
            <FloatingContainer />
            <div id={popupRootId} />
        </ConfigProvider>
    );
}

function FloatingContainer() {
    const { mountContainer } = useContext(ConfigContext);
    const floatingComponents = useComponentsOfPart(BuiltInUIPart.FLOATING);

    return createPortal(<ComponentContainer key="floating" components={floatingComponents} />, mountContainer!);
}
