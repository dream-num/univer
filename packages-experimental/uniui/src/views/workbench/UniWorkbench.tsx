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

// Refer to packages/ui/src/views/App.tsx

import { IUniverInstanceService, LocaleService, ThemeService } from '@univerjs/core';
import { ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import type { ILocale } from '@univerjs/design';
import {
    builtInGlobalComponents,
    BuiltInUIPart,
    ComponentContainer,
    ContextMenu,
    IMessageService,
    type IWorkbenchOptions,
    Sidebar,
    Toolbar,
    useComponentsOfPart,
    useObservable,
    ZenZone,
} from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { UnitGridService } from '../../services/unit-grid/unit-grid.service';
import styles from './workbench.module.less';

// Refer to packages/ui/src/views/workbench/Workbench.tsx

export interface IUniWorkbenchProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered: () => void;
}

export function UniWorkbench(props: IUniWorkbenchProps) {
    const {
        header = true,
        footer = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const messageService = useDependency(IMessageService);
    const unitGridService = useDependency(UnitGridService);
    const instanceService = useDependency(IUniverInstanceService);

    const contentRef = useRef<HTMLDivElement>(null);

    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const headerMenuComponents = useComponentsOfPart(BuiltInUIPart.HEADER_MENU);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    const unitGrid = useObservable(unitGridService.unitGrid$, undefined, true);
    const focused = useObservable(instanceService.focused$);

    const focusUnit = useCallback((unitId: string) => {
        instanceService.focusUnit(unitId);
        instanceService.setCurrentUnitForType(unitId);
    }, [instanceService]);

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }

        onRendered();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            // cleanup
            document.body.removeChild(portalContainer);
        };
    }, [localeService, messageService, mountContainer, portalContainer, themeService.currentTheme$]);

    return (
        <ConfigProvider locale={locale?.design} mountContainer={portalContainer}>
            {/**
              * IMPORTANT! This `tabIndex` should not be moved. This attribute allows the element to catch
              * all focusin event merged from its descendants. The DesktopLayoutService would listen to focusin events
              * bubbled to this element and refocus the input element.
              */}
            <div className={styles.workbenchLayout} tabIndex={-1} onBlur={(e) => e.stopPropagation()}>
                {/* header */}
                {header && (
                    <header className={styles.workbenchContainerHeader}>
                        <Toolbar headerMenuComponents={headerMenuComponents} />
                    </header>
                )}

                {/* content */}
                <section className={styles.workbenchContainer}>
                    <div className={styles.workbenchContainerWrapper}>
                        <aside className={styles.workbenchContainerLeftSidebar}>
                            <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                        </aside>

                        <section className={styles.workbenchContainerContent}>
                            <header>
                                {header && <ComponentContainer key="header" components={headerComponents} />}
                            </header>

                            <section
                                className={styles.workbenchContainerCanvasContainer}
                                ref={contentRef}
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {/* Render units. */}
                                {unitGrid?.map((unitId) => (
                                    <UnitRenderer
                                        key={unitId}
                                        unitId={unitId}
                                        focused={focused === unitId}
                                        onFocus={focusUnit}
                                        gridService={unitGridService}
                                        instanceService={instanceService}
                                    />
                                ))}
                                <ComponentContainer key="content" components={contentComponents} />
                            </section>
                        </section>

                        <aside className={styles.workbenchContainerSidebar}>
                            <Sidebar />
                        </aside>
                    </div>

                    {/* footer */}
                    {footer && (
                        <footer className={styles.workbenchFooter}>
                            <ComponentContainer key="footer" components={footerComponents} />
                        </footer>
                    )}

                    <ZenZone />
                </section>
            </div>
            <ComponentContainer key="global" components={globalComponents} />
            <ComponentContainer key="built-in-global" components={builtInGlobalComponents} />
            {contextMenu && <ContextMenu />}
        </ConfigProvider>
    );
}

interface IUnitRendererProps {
    unitId: string;
    focused: boolean;

    gridService: UnitGridService;
    instanceService: IUniverInstanceService;

    onFocus?: (unitId: string) => void;
}

function UnitRenderer(props: IUnitRendererProps) {
    const { unitId, gridService, focused, onFocus } = props;
    const mountRef = useRef<HTMLDivElement>(null);

    const focus = useCallback(() => {
        !focused && onFocus?.(unitId);
    }, [focused, onFocus, unitId]);

    useEffect(() => {
        if (mountRef.current) {
            gridService.setContainerForRender(unitId, mountRef.current);
        }
    }, [gridService, unitId]);

    return (
        <div
            className={clsx(styles.workbenchContainerCanvas, {
                [styles.workbenchContainerCanvasFocused]: focused,
            })}
            ref={mountRef}
            onPointerDownCapture={focus}
            onWheelCapture={focus}
        >
        </div>
    );
}
