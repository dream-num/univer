import { BaseComponentProps, Component, Container, Content, createRef, Footer, Header, Layout, Sider, Slot, defaultSkin } from '@univerjs/base-ui';
import { Tools } from '@univerjs/core';
import cssVars from 'css-vars-ponyfill';
import style from './index.module.less';
import { InfoBar } from '../InfoBar';
import { RightMenu } from '../RightMenu';
import { CountBar } from '../CountBar';
import { SheetBar } from '../SheetBar';
import { FormulaBar } from '../FormulaBar';
import { RichText } from '../RichText';
import { ISheetUIPluginConfig } from '../../Basics';
import { Toolbar } from '../Toolbar';

export interface BaseSheetContainerProps extends BaseComponentProps {
    config: ISheetUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

/**
 * One universheet instance DOM container
 */
export class SheetContainer extends Component<BaseSheetContainerProps> {
    leftContentLeft: number;

    leftContentTop: number;

    rightBorderX: number;

    rightBorderY: number;

    splitLeftRef = createRef<HTMLDivElement>();

    contentRef = createRef<HTMLDivElement>();

    constructor(props: BaseSheetContainerProps) {
        super();
        this.changeSkin(props.config.container as string, 'default');
    }

    componentDidMount() {
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
        const layout = this.props.config.layout?.sheetContainerConfig!;
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
        let root = document.documentElement;

        const id = typeof container === 'string' ? container : container.id;

        // get all skins
        const skins: Record<string, CSSModuleClasses> = {
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
            let sheet = getSkinStyleSheet(id);

            /**
             *  covert object to style, remove " and replace , to ;
             *
             *  Example:
             *
             *  before: {--primary-color:"#0188fb",--primary-color-hover:"#5391ff"}
             *  after:  {--primary-color:#0188fb;--primary-color-hover:#5391ff;}
             */

            sheet.insertRule(
                `#${id} ${JSON.stringify(currentSkin)
                    .replace(/"/g, '')
                    .replace(/,(?=--)/g, ';')}`
            );
        }

        /**
         * get skin style sheet
         * @param id
         * @returns
         */

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
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const { methods } = this.props;
        const { layout } = this.props.config;
        const config = layout?.sheetContainerConfig!;
        // Set Provider for entire Container
        return (
            <Container className={style.layoutContainer}>
                <Layout>
                    <Sider style={{ display: config.outerLeft ? 'block' : 'none' }}></Sider>
                    <Layout className={style.mainContent} style={{ position: 'relative' }}>
                        <Header style={{ display: config.header ? 'block' : 'none' }}>
                            {config.infoBar && <InfoBar {...methods.infoBar}></InfoBar>}
                            {config.toolbar && <Toolbar {...methods.toolbar}></Toolbar>}
                            {config.formulaBar && <FormulaBar {...methods.formulaBar}></FormulaBar>}
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
                                {/* <Slot {...methods.slot}></Slot> */}
                                {!!config.contentSplit && (
                                    <Container ref={this.splitLeftRef} className={style.contentInnerLeftContainer}>
                                        <div className={style.hoverCursor} onMouseDown={this.handleSplitBarMouseDown}></div>
                                    </Container>
                                )}
                                <Container onContextMenu={(e) => e.preventDefault()} ref={this.contentRef} className={style.contentInnerRightContainer}>
                                    {config.rightMenu && <RightMenu {...methods.rightMenu}></RightMenu>}
                                    {<RichText {...methods.cellEditor}></RichText>}
                                </Container>
                                {/* <Prompt show={true} title="123" content="235" /> */}
                                {/* extend main content */}
                                <Slot name="main" {...methods.slot}></Slot>
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
                            {config.sheetBar && <SheetBar {...methods.sheetBar}></SheetBar>}
                            {config.countBar && <CountBar {...methods.countBar}></CountBar>}
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
