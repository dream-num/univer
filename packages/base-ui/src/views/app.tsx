import '../Basics/CSS/Skin/default.module.less';

import { LocaleService, ObserverManager } from '@univerjs/core';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import React, { ComponentType, useEffect, useRef } from 'react';

import { defaultSkin } from '../Basics/CSS';
import { ComponentManager, ZIndexManager } from '../Common';
import { AppContext } from '../Common/AppContext';
import { Content, Footer, Header, Layout, Sider } from '../Components';
import { Container } from '../Components/Container/Container';
import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import { LocaleType } from '../Enum';
import style from './app.module.less';
import { ContextMenu } from './components/contextmenu/contextmenu';
import { Toolbar } from './components/toolbar/toolbar';

export interface IUniverAppProps extends IWorkbenchOptions {
    onRendered?: (container: HTMLElement) => void;
    footerComponents?: Set<() => ComponentType>;
}

// eslint-disable-next-line max-lines-per-function
export function App(props: IUniverAppProps) {
    const injector = useInjector();
    const localeService = useDependency(LocaleService);
    const observerManager = useDependency(ObserverManager);
    const zIndexManager = useDependency(ZIndexManager);
    const componentManager = useDependency(ComponentManager);

    const containerRef = useRef<HTMLDivElement>(null);

    const { footerComponents } = props;

    useEffect(() => {
        /**
         * delete style rule in universheet-skin-style
         * @param skinStyleSheet
         * @param id
         */
        function deleteStyleRuleIndexBySelector(skinStyleSheet: CSSStyleSheet, id: string) {
            let index = 0;
            for (let i = 0; i < skinStyleSheet.cssRules.length; i++) {
                const rule = skinStyleSheet.cssRules[i];

                if (rule instanceof CSSStyleRule && rule.selectorText === `#${id}`) {
                    index = i;
                    skinStyleSheet.deleteRule(index);
                    break;
                }
            }
        }

        function getSkinStyleSheet(id: string) {
            const title = 'universheet-skin-style';
            // avoid duplicates
            for (let i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].title === title) {
                    deleteStyleRuleIndexBySelector(document.styleSheets[i], id);

                    return document.styleSheets[i];
                }
            }
            const head = document.head || document.getElementsByTagName('head')[0];
            const styleEle = document.createElement('style');
            styleEle.title = title;
            head.appendChild(styleEle);

            return document.styleSheets[document.styleSheets.length - 1];
        }

        // set css variable
        const id = containerRef.current!.id;
        const sheet = getSkinStyleSheet(id);

        /**
         *  covert object to style, remove " and replace , to ;
         *  Example:
         *  before: {--primary-color:"#0188fb",--primary-color-hover:"#5391ff"}
         *  after:  {--primary-color:#0188fb;--primary-color-hover:#5391ff;}
         */
        let currentSkin = defaultSkin;
        currentSkin = Object.fromEntries(Object.keys(defaultSkin).map((item) => [`--${item.replace(/([A-Z0-9])/g, '-$1').toLowerCase()}`, currentSkin[item]]));
        sheet.insertRule(
            `#${'univer-container'} ${JSON.stringify(currentSkin)
                .replace(/"/g, '')
                .replace(/,(?=--)/g, ';')}`
        );
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            props.onRendered?.(containerRef.current);
        }
    }, [props.onRendered]);

    return (
        <AppContext.Provider value={{ injector, localeService, locale: LocaleType.EN, componentManager, zIndexManager, observerManager }}>
            {/* TODO: UI here is not fine tuned */}
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
                <select value={LocaleType.EN} style={{ width: 70 }} onChange={(e) => localeService.setLocale(e.target.value as LocaleType)}>
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
                        <Header style={{ display: props.header ? 'block' : 'none' }}>{props.toolbar && <Toolbar></Toolbar>}</Header>
                        {/* content */}
                        <Layout>
                            <Sider style={{ display: props.innerLeft ? 'block' : 'none' }}>{/* inner left */}</Sider>
                            <Content className={style.contentContainerHorizontal}>
                                {/* FIXME: context menu component shouldn't have to mount on this position */}
                                <Container onContextMenu={(e) => e.preventDefault()} className={style.contentInnerRightContainer} ref={containerRef}>
                                    <ContextMenu />
                                    {/* {config.rightMenu && <RightMenu {...methods.rightMenu}></RightMenu>} */}
                                    {/* {<RichText {...methods.cellEditor}></RichText>} */}
                                </Container>
                            </Content>
                        </Layout>
                        {/* footer */}
                        <Footer style={{ display: props.footer ? 'block' : 'none' }}>
                            {footerComponents && Array.from(footerComponents.values()).map((component, index) => React.createElement(component(), { key: `${index}` }))}
                        </Footer>
                    </Layout>
                </Layout>
            </Container>
        </AppContext.Provider>
    );
}
