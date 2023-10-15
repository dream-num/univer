import { LocaleService, LocaleType, ThemeService } from '@univerjs/core';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import React, { ComponentType, useEffect, useRef, useState } from 'react';

import { defaultTheme } from '../Basics/CSS';
import { ComponentManager, ZIndexManager } from '../Common';
import { AppContext } from '../Common/AppContext';
import { Content, Footer, Header, Layout, Sider } from '../Components';
import { Container } from '../Components/Container/Container';
import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import style from './app.module.less';
import { ContextMenu } from './components/contextmenu/contextmenu';
import { Toolbar } from './components/toolbar/toolbar';

export interface IUniverAppProps extends IWorkbenchOptions {
    headerComponents?: Set<() => ComponentType>;
    contentComponents?: Set<() => ComponentType>;
    footerComponents?: Set<() => ComponentType>;
    sidebarComponents?: Set<() => ComponentType>;
    onRendered?: (container: HTMLElement) => void;
}

// eslint-disable-next-line max-lines-per-function
export function App(props: IUniverAppProps) {
    const injector = useInjector();
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const zIndexManager = useDependency(ZIndexManager);
    const componentManager = useDependency(ComponentManager);

    const containerRef = useRef<HTMLDivElement>(null);

    const { headerComponents, contentComponents, footerComponents, sidebarComponents, onRendered } = props;

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

    const [locale, setLocale] = useState<LocaleType>(localeService.getLocale().getCurrentLocale());

    useEffect(() => {
        const listener = localeService.getLocale().locale$.subscribe((locale) => {
            locale && setLocale(locale);
        });

        return () => {
            listener.unsubscribe();
        };
    }, []);

    return (
        <AppContext.Provider value={{ injector, localeService, themeService, locale, componentManager, zIndexManager }}>
            <div
                style={{
                    position: 'fixed',
                    right: '250px',
                    top: '14px',
                    fontSize: '14px',
                    zIndex: 100,
                }}
                className="univer-dev-operation"
            >
                {/* language selector */}
                <span
                    style={{
                        display: 'inline-block',
                        width: 70,
                        margin: '5px 0 0 5px',
                    }}
                >
                    Language
                </span>
                <select
                    value={locale}
                    style={{ width: 70 }}
                    onChange={(e) => {
                        const value = e.target.value as LocaleType;
                        localeService.setLocale(value);
                    }}
                >
                    <option value={LocaleType.EN}>English</option>
                    <option value={LocaleType.ZH}>简体中文</option>
                </select>
            </div>
            <Container className={style.layoutContainer}>
                <Layout>
                    {/* outer sidebar */}
                    <Sider style={{ display: props.outerLeft ? 'block' : 'none' }}></Sider>
                    <Layout className={style.mainContent} style={{ position: 'relative' }}>
                        {/* header */}
                        <Header style={{ display: props.header ? 'block' : 'none' }}>
                            {props.toolbar && <Toolbar></Toolbar>}
                            {headerComponents &&
                                Array.from(headerComponents.values()).map((component, index) =>
                                    React.createElement(component(), { key: `${index}` })
                                )}
                        </Header>
                        {/* content */}
                        <Layout>
                            <Sider
                                style={{ display: props.innerLeft ? 'block' : 'none' }}
                                className={style.contentInnerLeftContainer}
                            >
                                {/* inner left */}
                                {sidebarComponents &&
                                    Array.from(sidebarComponents.values()).map((component, index) =>
                                        React.createElement(component(), { key: `${index}` })
                                    )}
                            </Sider>
                            <Content className={style.contentContainerHorizontal}>
                                {/* FIXME: context menu component shouldn't have to mount on this position */}
                                <Container
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={style.contentInnerRightContainer}
                                    ref={containerRef}
                                >
                                    <ContextMenu />
                                    {contentComponents &&
                                        Array.from(contentComponents.values()).map((component, index) =>
                                            React.createElement(component(), { key: `${index}` })
                                        )}
                                    {/* {config.rightMenu && <RightMenu {...methods.rightMenu}></RightMenu>} */}
                                    {/* {<RichText {...methods.cellEditor}></RichText>} */}
                                </Container>
                            </Content>
                        </Layout>
                        {/* footer */}
                        <Footer style={{ display: props.footer ? 'block' : 'none' }}>
                            {footerComponents &&
                                Array.from(footerComponents.values()).map((component, index) =>
                                    React.createElement(component(), { key: `${index}` })
                                )}
                        </Footer>
                    </Layout>
                </Layout>
            </Container>
        </AppContext.Provider>
    );
}
