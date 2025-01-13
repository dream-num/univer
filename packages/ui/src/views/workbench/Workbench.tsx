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

import type { DocumentDataModel, IDocumentData, Nullable } from '@univerjs/core';
import type { ILocale } from '@univerjs/design';
import type { IWorkbenchOptions } from '../../controllers/ui/ui.controller';
import { DocumentFlavor, IUniverInstanceService, LocaleService, ThemeService, UniverInstanceType, useDependency } from '@univerjs/core';
import { ConfigContext, ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';

import clsx from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BuiltInUIPart } from '../../services/parts/parts.service';
import { ComponentContainer, useComponentsOfPart } from '../components/ComponentContainer';
import { DesktopContextMenu } from '../components/context-menu/ContextMenu';
import { Ribbon } from '../components/ribbon/Ribbon';

import { Sidebar } from '../components/sidebar/Sidebar';
import { ZenZone } from '../components/zen-zone/ZenZone';
import { builtInGlobalComponents } from '../parts';
import styles from './workbench.module.less';

export interface IUniverWorkbenchProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered?: (containerElement: HTMLElement) => void;
}

export function DesktopWorkbench(props: IUniverWorkbenchProps) {
    const {
        header = true,
        toolbar = true,
        footer = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const instanceService = useDependency(IUniverInstanceService);
    const contentRef = useRef<HTMLDivElement>(null);

    const customHeaderComponents = useComponentsOfPart(BuiltInUIPart.CUSTOM_HEADER);
    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const headerMenuComponents = useComponentsOfPart(BuiltInUIPart.HEADER_MENU);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    const [docSnapShot, setDocSnapShot] = useState<Nullable<IDocumentData>>(null);

    useEffect(() => {
        const sub = instanceService.focused$.subscribe((id) => {
            if (id == null) {
                return;
            }
            const instanceType = instanceService.getUnitType(id);
            const instance = instanceService.getUnit(id);

            if (instanceType === UniverInstanceType.UNIVER_DOC && instance) {
                setDocSnapShot((instance as DocumentDataModel).getSnapshot());
            }
        });

        return () => {
            sub.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                if (portalContainer) {
                    themeInstance.setTheme(portalContainer, theme);
                }
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
            <div className={styles.workbenchLayout} tabIndex={-1} onBlur={(e) => e.stopPropagation()}>
                {/* user header */}
                <div className={styles.workbenchCustomHeader}>
                    <ComponentContainer key="custom-header" components={customHeaderComponents} />
                </div>

                {/* header */}
                {header && toolbar && (
                    <header className={styles.workbenchContainerHeader}>
                        <Ribbon headerMenuComponents={headerMenuComponents} />
                    </header>
                )}

                {/* content */}
                <section className={styles.workbenchContainer}>
                    <div className={styles.workbenchContainerWrapper}>
                        <aside className={styles.workbenchContainerLeftSidebar}>
                            <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                        </aside>

                        <section className={clsx(
                            styles.workbenchContainerContent,
                            {
                                [styles.workbenchContainerDocContent]: docSnapShot?.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL,
                            }
                        )}
                        >
                            <header>
                                {header && <ComponentContainer key="header" components={headerComponents} />}
                            </header>

                            <section
                                className={styles.workbenchContainerCanvas}
                                ref={contentRef}
                                data-range-selector
                                onContextMenu={(e) => e.preventDefault()}
                            >
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
                            <ComponentContainer key="footer" components={footerComponents} sharedProps={{ contextMenu }} />
                        </footer>
                    )}
                    <ZenZone />

                </section>
            </div>
            <ComponentContainer key="global" components={globalComponents} />
            <ComponentContainer key="built-in-global" components={builtInGlobalComponents} />
            {contextMenu && <DesktopContextMenu />}
            <FloatingContainer />
            <div id="univer-popup-portal"></div>
        </ConfigProvider>
    );
}

function FloatingContainer() {
    const { mountContainer } = useContext(ConfigContext);
    const floatingComponents = useComponentsOfPart(BuiltInUIPart.FLOATING);

    return createPortal(<ComponentContainer key="floating" components={floatingComponents} />, mountContainer!);
}
