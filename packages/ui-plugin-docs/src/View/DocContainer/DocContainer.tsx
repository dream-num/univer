import { BaseComponentProps, Container, Content, Footer, Header, Layout, Sider } from '@univerjs/base-ui';
import { Component, createRef } from 'preact';
import defaultSkin from '@univerjs/base-ui/Basics/CSS/Skin/default.module.less';
import { Tools } from '@univerjs/core';
import cssVars from 'css-vars-ponyfill';
import style from './index.module.less';
import { IDocUIPluginConfig } from '../../Basics';
import { Toolbar } from '../Toolbar';
import { InfoBar } from '../InfoBar';

export interface BaseDocContainerProps extends BaseComponentProps {
    config: IDocUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

/**
 * One univerdoc instance DOM container
 */
export class DocContainer extends Component<BaseDocContainerProps> {
    leftContentLeft: number;

    leftContentTop: number;

    rightBorderX: number;

    rightBorderY: number;

    splitLeftRef = createRef<HTMLDivElement>();

    contentRef = createRef<HTMLDivElement>();

    constructor(props: BaseDocContainerProps) {
        super();
        this.changeSkin(props.config.container as string, 'default');
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    /**
     * split mouse down
     * @param e
     */
    handleSplitBarMouseDown = (e: MouseEvent) => {
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
        const layout = this.props.config.layout?.docContainerConfig!;
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

        // get all skins
        const skins = {
            default: defaultSkin,
        };

        // current skin set by user
        let currentSkin = skins[skin];

        // transform "primaryColor" to "--primary-color"
        currentSkin = Object.fromEntries(Object.keys(currentSkin).map((item) => [`--${item.replace(/([A-Z0-9])/g, '-$1').toLowerCase()}`, currentSkin[item]]));

        // ie11 does not support css variables, use css-vars-ponyfill to handle
        if (Tools.isIEBrowser()) {
            cssVars({
                // Options...

                // The container is invalid as rootElement, so the default setting is root.
                // Disadvantages: In ie11, only one set of skins can be used for multiple workbooks, and it is the skin set by the last workbook
                rootElement: root, // default

                variables: currentSkin,
            });
        } else {
            // set css variable
            const doc = getSkinStyleDoc(id);

            /**
             *  covert object to style, remove " and replace , to ;
             *
             *  Example:
             *
             *  before: {--primary-color:"#0188fb",--primary-color-hover:"#5391ff"}
             *  after:  {--primary-color:#0188fb;--primary-color-hover:#5391ff;}
             */

            doc.insertRule(
                `#${id} ${JSON.stringify(currentSkin)
                    .replace(/"/g, '')
                    .replace(/,(?=--)/g, ';')}`
            );
        }

        /**
         * get skin style doc
         * @param id
         * @returns
         */

        function getSkinStyleDoc(id: string) {
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

        /**
         * delete style rule in univerdoc-skin-style
         * @param skinStyleDoc
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
    render() {
        const { methods } = this.props;
        const { layout } = this.props.config;
        const config = layout?.docContainerConfig!;
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
                                    display: config.innerLeft ? 'block' : 'none',
                                }}
                            >
                                {/* innerLeft */}
                            </Sider>
                            <Content className={config.contentSplit === 'vertical' ? style.contentContainerVertical : style.contentContainerHorizontal}>
                                {!!config.contentSplit && (
                                    <Container ref={this.splitLeftRef} className={style.contentInnerLeftContainer}>
                                        <div className={style.hoverCursor} onMouseDown={this.handleSplitBarMouseDown}></div>
                                    </Container>
                                )}
                                <Container onContextMenu={(e) => e.preventDefault()} ref={this.contentRef} className={style.contentInnerRightContainer}></Container>
                                {/* <Prompt show={true} title="123" content="235" /> */}
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
                        ></Footer>
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
