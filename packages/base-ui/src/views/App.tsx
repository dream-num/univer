import { LocaleService, ThemeService } from '@univerjs/core';
import {
    ConfigProvider,
    Container,
    Content,
    defaultTheme,
    Footer,
    Header,
    ILocale,
    Layout,
    Sider,
    themeInstance,
} from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { ComponentType, useEffect, useRef, useState } from 'react';

import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import style from './app.module.less';
import { ContextMenu } from './components/context-menu/ContextMenu';
import { DocBars } from './components/doc-bars/DocBars';
import { Sidebar } from './components/sidebar/Sidebar';
import { globalComponents } from './parts';

export interface IUniverAppProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;
    headerComponents?: Set<() => ComponentType>;
    contentComponents?: Set<() => ComponentType>;
    footerComponents?: Set<() => ComponentType>;
    sidebarComponents?: Set<() => ComponentType>;
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

    const containerRef = useRef<HTMLDivElement>(null);

    const {
        mountContainer,
        headerComponents,
        headerMenuComponents,
        contentComponents,
        footerComponents,
        sidebarComponents,
        onRendered,
    } = props;

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            onRendered?.(containerRef.current);
        }
    }, [onRendered]);

    const [locale, setLocale] = useState<ILocale>(localeService.getLocales() as unknown as ILocale);

    // Create a portal container for injecting global component themes.
    const portalContainer: HTMLElement = document.createElement('div');
    document.body.appendChild(portalContainer);

    useEffect(() => {
        const subscriptions = [
            localeService.getLocale().locale$.subscribe((locale) => {
                locale && setLocale(localeService.getLocales() as unknown as ILocale);
            }),
            themeService.currentTheme$.subscribe((theme) => {
                themeInstance.setTheme(mountContainer, theme);
                themeInstance.setTheme(portalContainer, theme);
            }),
        ];

        return () => {
            // batch unsubscribe
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, []);

    return (
        <ConfigProvider locale={locale} mountContainer={portalContainer}>
            <Container className={style.layoutContainer}>
                <Layout>
                    {/* outer sidebar */}
                    <Sider style={{ display: props.outerLeft ? 'block' : 'none' }} />

                    <Layout className={style.mainContent}>
                        {/* header */}
                        <Header style={{ display: props.header ? 'block' : 'none' }}>
                            {props.toolbar && <DocBars />}

                            <ComponentContainer components={headerComponents} />

                            <div className={style.headerMenu}>
                                <ComponentContainer components={headerMenuComponents} />
                            </div>
                        </Header>

                        {/* content */}
                        <Layout>
                            <Sider
                                style={{ display: props.innerLeft ? 'block' : 'none' }}
                                className={style.contentInnerLeftContainer}
                            >
                                {/* inner left */}
                                <ComponentContainer components={sidebarComponents} />
                            </Sider>

                            <Content className={style.contentContainerHorizontal}>
                                <ContextMenu>
                                    <Container ref={containerRef} className={style.contentInnerRightContainer}>
                                        <ComponentContainer components={contentComponents} />
                                    </Container>
                                </ContextMenu>
                            </Content>
                        </Layout>

                        {/* footer */}
                        <Footer style={{ display: props.footer ? 'block' : 'none' }}>
                            <ComponentContainer components={footerComponents} />
                        </Footer>
                    </Layout>

                    <Sidebar />
                </Layout>
            </Container>

            <ComponentContainer components={globalComponents} />
        </ConfigProvider>
    );
}
