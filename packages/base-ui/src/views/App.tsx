import { LocaleService, ThemeService } from '@univerjs/core';
import { ConfigProvider, defaultTheme, ILocale, themeInstance } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { ComponentType, useEffect, useMemo, useRef, useState } from 'react';

import { IMessageService } from '..';
import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import { ISidebarService } from '../services/sidebar/sidebar.service';
import styles from './app.module.less';
import { ContextMenu } from './components/context-menu/ContextMenu';
import { MenuBar } from './components/doc-bars/MenuBar';
import { Toolbar } from './components/doc-bars/Toolbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { globalComponents } from './parts';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;
    headerComponents?: Set<() => ComponentType>;
    contentComponents?: Set<() => ComponentType>;
    footerComponents?: Set<() => ComponentType>;
    // sidebarComponents?: Set<() => ComponentType>;
    headerMenuComponents?: Set<() => ComponentType>;
    onRendered?: (container: HTMLElement) => void;
}

function ComponentContainer(props: { components?: Set<() => ComponentType> }) {
    const { components } = props;

    if (!components) return null;

    return Array.from(components.values()).map((component, index) =>
        React.createElement(component(), { key: `${index}` })
    );
}

// eslint-disable-next-line max-lines-per-function
export function App(props: IUniverAppProps) {
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const sidebarService = useDependency(ISidebarService);
    const messageService = useDependency(IMessageService);

    const contentRef = useRef<HTMLDivElement>(null);

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
    const [mainCollapsed, setMainCollapsed] = useState<boolean>(false);

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
            sidebarService.getObservableSidebar().subscribe((sidebar) => {
                setMainCollapsed(sidebar?.visible ?? false);
            }),
        ];

        return () => {
            // batch unsubscribe
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, [portalContainer]);

    return (
        <ConfigProvider locale={locale} mountContainer={portalContainer}>
            <section className={styles.appLayout}>
                {/* header */}
                <header>{props.toolbar && <MenuBar />}</header>

                {/* content */}
                <section className={styles.appContainer}>
                    <section
                        className={clsx(styles.appContainerMain, { [styles.appContainerMainCollapsed]: mainCollapsed })}
                    >
                        <header className={styles.appContainerHeader}>
                            {props.toolbar && <Toolbar />}

                            <ComponentContainer components={headerComponents} />

                            <ComponentContainer components={headerMenuComponents} />
                        </header>

                        {/* <ComponentContainer components={sidebarComponents} /> */}

                        <ContextMenu>
                            <section ref={contentRef} className={styles.appContainerContent}>
                                <ComponentContainer components={contentComponents} />
                            </section>
                        </ContextMenu>
                    </section>

                    <aside className={styles.appContainerSidebar}>
                        <Sidebar />
                    </aside>
                </section>

                {/* footer */}
                <footer className={styles.appFooter}>
                    <ComponentContainer components={footerComponents} />
                </footer>
            </section>

            <ComponentContainer components={globalComponents} />
        </ConfigProvider>
    );
}
