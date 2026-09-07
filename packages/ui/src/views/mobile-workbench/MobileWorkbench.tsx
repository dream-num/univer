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

import type { Injector } from '@univerjs/core';
import type { ComponentType } from 'react';
import type { IWorkbenchOptions } from '../../controllers/ui/ui.controller';
import { LifecycleService, LifecycleStages, LocaleService, ThemeService } from '@univerjs/core';
import { borderBottomClassName, clsx, ConfigProvider, render } from '@univerjs/design';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { map } from 'rxjs';

import { BuiltInUIPart } from '../../services/parts/parts.service';
import { ThemeSwitcherService } from '../../services/theme-switcher/theme-switcher.service';
import { IWorkbenchService } from '../../services/workbench/workbench.service';
import { connectInjector, useDependency, useObservable } from '../../utils/di';
import { ComponentContainer, useComponentsOfPart } from '../components/ComponentContainer';
import { MobileContextMenu } from '../components/context-menu/MobileContextMenu';
import { MobileSidebar } from '../components/sidebar/MobileSidebar';
import { WorkbenchSkeleton } from '../components/workbench-skeleton/WorkbenchSkeleton';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered?: (container: HTMLElement) => void;
}

export function mountMobileWorkbench(
    injector: Injector,
    options: IWorkbenchOptions,
    mountContainer: HTMLElement,
    onRendered: (contentElement: HTMLElement) => void
): void {
    const ConnectedApp = connectInjector(MobileWorkbench, injector) as ComponentType<IUniverAppProps>;

    render(
        <ConnectedApp
            {...options}
            mountContainer={mountContainer}
            onRendered={onRendered}
        />,
        mountContainer
    );
}

export function MobileWorkbench(props: IUniverAppProps) {
    const {
        header = true,
        toolbar = true,
        footer = true,
        headerMenu = true,
        ribbonType = 'classic',
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const lifecycleService = useDependency(LifecycleService);
    const workbenchService = useDependency(IWorkbenchService);
    const themeService = useDependency(ThemeService);
    const themeSwitcherService = useDependency(ThemeSwitcherService);

    const contentRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const globalRootRef = useRef<HTMLDivElement>(null);

    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const headerMenuComponents = useComponentsOfPart(BuiltInUIPart.HEADER_MENU);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);
    const toolbarComponents = useComponentsOfPart(BuiltInUIPart.TOOLBAR);

    const darkMode = useObservable(themeService.darkMode$, themeService.darkMode);
    const lifecycleStage = useObservable(lifecycleService.lifecycle$, lifecycleService.stage);
    const externalSkeletonVisible = useObservable(workbenchService.skeletonVisible$, undefined, true);
    const ready = lifecycleStage >= LifecycleStages.Ready;

    useEffect(() => {
        if (ready && contentRef.current) {
            onRendered?.(contentRef.current);
        }
    }, [ready, onRendered]);

    const locale = useObservable(
        () => localeService.localeChanged$.pipe(map(() => localeService.getLocales())),
        localeService.getLocales(),
        false,
        [localeService]
    );
    const direction = useObservable(localeService.direction$, localeService.getDirection());

    const portalContainer = useMemo<HTMLElement>(() => {
        const container = mountContainer.ownerDocument.createElement('div');
        container.setAttribute('data-univer-root', '');
        return container;
    }, [mountContainer]);

    useLayoutEffect(() => {
        const sub = themeService.currentTheme$.subscribe((theme) => {
            const roots = [viewportRef.current, globalRootRef.current, portalContainer]
                .filter((root): root is HTMLElement => root !== null);
            themeSwitcherService.applyTheme(theme, roots);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [portalContainer, themeService, themeSwitcherService]);

    useEffect(() => {
        mountContainer.ownerDocument.body.appendChild(portalContainer);

        return () => {
            portalContainer.remove();
        };
    }, [mountContainer, portalContainer]);

    useEffect(() => {
        portalContainer.setAttribute('dir', direction);
    }, [direction, portalContainer]);

    useLayoutEffect(() => {
        portalContainer.classList.toggle('univer-dark', darkMode);
    }, [darkMode, portalContainer]);

    useEffect(() => {
        const visualViewport = window.visualViewport;
        const viewportElement = viewportRef.current;
        if (!viewportElement) {
            return undefined;
        }

        let stableHeight = Math.round(mountContainer.getBoundingClientRect().height || window.innerHeight);
        let stableWidth = Math.round(mountContainer.getBoundingClientRect().width || window.innerWidth);

        const updateKeyboardInset = () => {
            const visibleBottom = visualViewport
                ? visualViewport.offsetTop + visualViewport.height
                : window.innerHeight;
            viewportElement.style.setProperty(
                '--univer-mobile-keyboard-inset',
                `${Math.max(0, Math.round(stableHeight - visibleBottom))}px`
            );
        };
        const updateStableViewport = () => {
            const width = Math.round(mountContainer.getBoundingClientRect().width || window.innerWidth);
            const activeElement = document.activeElement;
            const editing = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                activeElement?.getAttribute('contenteditable') === 'true';

            if (!editing || width !== stableWidth) {
                stableHeight = Math.round(mountContainer.getBoundingClientRect().height || window.innerHeight);
                stableWidth = width;
                viewportElement.style.height = `${stableHeight}px`;
            }
            updateKeyboardInset();
        };

        viewportElement.style.height = `${stableHeight}px`;
        updateKeyboardInset();
        window.addEventListener('resize', updateStableViewport);
        visualViewport?.addEventListener('resize', updateKeyboardInset);
        visualViewport?.addEventListener('scroll', updateKeyboardInset);

        return () => {
            window.removeEventListener('resize', updateStableViewport);
            visualViewport?.removeEventListener('resize', updateKeyboardInset);
            visualViewport?.removeEventListener('scroll', updateKeyboardInset);
        };
    }, [mountContainer]);

    // Keep the inner layout focusable so focusin bubbles from editors and the layout service can refocus input.
    return (
        <ConfigProvider
            locale={locale?.design}
            direction={direction}
            mountContainer={portalContainer}
            disableTooltips
            mobile
        >
            <div
                ref={viewportRef}
                data-univer-root
                className={clsx(`
                  univer-relative univer-h-full univer-min-h-0
                  [&_button:active]:!univer-opacity-70
                  [&_button]:univer-touch-manipulation
                `, {
                    'univer-dark': darkMode,
                })}
            >
                <div
                    data-u-comp="app-layout"
                    className={`
                      univer-relative univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-bg-gray-0
                      dark:!univer-bg-gray-800
                    `}
                    tabIndex={-1}
                    onBlur={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                    dir={direction}
                >
                    {/* header */}
                    {header && toolbar && (
                        <header
                            data-u-comp="headerbar"
                            className="univer-relative univer-z-10 univer-w-full univer-overflow-hidden"
                        >
                            <ComponentContainer
                                key="toolbar"
                                components={toolbarComponents}
                                sharedProps={{
                                    ribbonType,
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
                            <aside className="univer-h-full">
                                <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                            </aside>

                            <section
                                className={clsx(`
                                  univer-relative univer-grid univer-flex-1 univer-grid-rows-[auto_1fr]
                                  univer-overflow-hidden univer-bg-gray-0
                                  dark:!univer-bg-gray-800
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

                            <aside className="univer-h-full" />
                        </div>

                        {/* footer */}
                        {footer && (
                            <footer>
                                <ComponentContainer key="footer" components={footerComponents} />
                            </footer>
                        )}
                    </section>
                </div>
                {(!ready || externalSkeletonVisible) && (
                    <WorkbenchSkeleton darkMode={darkMode} direction={direction} overlay />
                )}
            </div>
            <div
                ref={globalRootRef}
                data-univer-root
                className={clsx(`
                  [&_button:active]:!univer-opacity-70
                  [&_button]:univer-touch-manipulation
                `, {
                    'univer-dark': darkMode,
                })}
                dir={direction}
            >
                <ComponentContainer key="global" components={globalComponents} />
                {contextMenu && <MobileContextMenu />}
                <MobileSidebar />
            </div>
        </ConfigProvider>
    );
}
