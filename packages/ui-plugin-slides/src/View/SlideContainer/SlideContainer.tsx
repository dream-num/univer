import { BaseComponentProps } from '@univerjs/base-ui';
import { Container, Content, Footer, Header, Layout, Sider } from '@univerjs/design';
import { Component, createRef } from 'react';

import { ISlideUIPluginConfig } from '../../Basics';
import { InfoBar } from '../InfoBar';
import { SlideBar } from '../SlideBar/SlideBar';
import { Toolbar } from '../Toolbar';
import style from './index.module.less';

export interface BaseSlideContainerProps extends BaseComponentProps {
    config: ISlideUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

/**
 * One universlide instance DOM container
 */
export class SlideContainer extends Component<BaseSlideContainerProps> {
    leftContentLeft: number = 0;

    leftContentTop: number = 0;

    rightBorderX: number = 0;

    rightBorderY: number = 0;

    splitLeftRef = createRef<HTMLDivElement>();

    contentRef = createRef<HTMLDivElement>();

    constructor(props: BaseSlideContainerProps) {
        super(props);
        this.changeSkin(props.config.container as string, 'default');
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    /**
     * split mouse down
     * @param e
     */
    handleSplitBarMouseDown = (e: React.MouseEvent) => {
        e = e || window.event; // Compatible with IE browser
        // Store the current mouse position
        this.leftContentLeft = this.splitLeftRef.current?.getBoundingClientRect().left!;
        this.leftContentTop = this.splitLeftRef.current?.getBoundingClientRect().top!;
        const mainContainer = this.splitLeftRef.current?.parentElement;
        this.rightBorderX = mainContainer?.getBoundingClientRect()?.width!;
        this.rightBorderY = mainContainer?.getBoundingClientRect()?.height!;
        document.addEventListener('mousemove', this.handleSplitBarMouseMove, false);
        document.addEventListener('mouseup', this.handleSplitBarMouseUp, false);
    };

    /**
     * split mouse move
     * @param e
     */
    handleSplitBarMouseMove = (e: MouseEvent) => {
        const layout = this.props.config.layout?.slideContainerConfig!;
        e = e || window.event; // Compatible with IE browser
        let diffLeft = e.clientX - this.leftContentLeft;
        let diffTop = e.clientY - this.leftContentTop;
        // Prevent crossing borders
        diffLeft = diffLeft >= this.rightBorderX ? this.rightBorderX : diffLeft;
        diffTop = diffTop >= this.rightBorderY ? this.rightBorderY : diffTop;
        // set new width
        if (layout.contentSplit === 'vertical') {
            this.splitLeftRef.current!.style.height = `${diffTop}px`;
        } else {
            this.splitLeftRef.current!.style.width = `${diffLeft}px`;
        }
    };

    /**
     * split mouse up
     * @param e
     */
    handleSplitBarMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', this.handleSplitBarMouseMove, false);
        document.removeEventListener('mouseup', this.handleSplitBarMouseUp, false);
    };

    getContentRef() {
        return this.contentRef;
    }

    getSplitLeftRef() {
        return this.splitLeftRef;
    }

    /**
     * Modify Dom Skin
     */
    changeSkin(container: HTMLElement | string, skin: string) {
        // Collect all  skins
        const root = document.documentElement;

        const id = typeof container === 'string' ? container : container.id;

        /**
         * get skin style sheet
         * @param id
         * @returns
         */

        function getSkinStyleSheet(id: string) {
            const title = 'universlide-skin-style';
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

        /**
         * delete style rule in universlide-skin-style
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
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    override render() {
        const { methods } = this.props;
        const { layout } = this.props.config;
        const config = layout?.slideContainerConfig!;
        // Set Provider for entire Container
        return (
            <Container className={style.layoutContainer}>
                <Layout>
                    <Sider style={{ display: config.outerLeft ? 'block' : 'none' }}></Sider>
                    <Layout className={style.mainContent} style={{ position: 'relative' }}>
                        <Header style={{ display: config.header ? 'block' : 'none' }}>
                            {config.infoBar && <InfoBar {...methods.infoBar}></InfoBar>}
                            {config.toolbar && <Toolbar {...methods.toolbar}></Toolbar>}
                        </Header>
                        <Layout>
                            <Sider
                                style={{
                                    width: '300px',
                                    display: config.innerLeft ? 'block' : 'none',
                                }}
                            >
                                <SlideBar {...methods.slideBar}></SlideBar>
                            </Sider>
                            <Content
                                className={
                                    config.contentSplit === 'vertical'
                                        ? style.contentContainerVertical
                                        : style.contentContainerHorizontal
                                }
                            >
                                {!!config.contentSplit && (
                                    <Container ref={this.splitLeftRef} className={style.contentInnerLeftContainer}>
                                        <div
                                            className={style.hoverCursor}
                                            onMouseDown={this.handleSplitBarMouseDown}
                                        ></div>
                                    </Container>
                                )}
                                <Container
                                    onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                                    ref={this.contentRef}
                                    className={style.contentInnerRightContainer}
                                >
                                    {/* {config.rightMenu && <RightMenu {...methods.rightMenu}></RightMenu>} */}
                                </Container>
                                {/* extend main content */}
                            </Content>

                            <Sider
                                style={{
                                    display: config.innerRight ? 'block' : 'none',
                                }}
                            >
                                {/* innerRight */}
                                {/* <SideGroup></SideGroup> */}
                            </Sider>
                        </Layout>
                        <Footer
                            style={{
                                display: config.footer ? 'block' : 'none',
                            }}
                        >
                            {/* {config.countBar && <CountBar {...methods.countBar}></CountBar>} */}
                        </Footer>
                    </Layout>
                    <Sider
                        style={{
                            display: config.outerRight ? 'block' : 'none',
                        }}
                        className={style.outerRightContainer}
                    ></Sider>
                </Layout>
            </Container>
        );
    }
}
