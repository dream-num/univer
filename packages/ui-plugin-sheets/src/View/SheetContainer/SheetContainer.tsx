import style from './index.module.less';
import { Toolbar } from '../Toolbar';
import { InfoBar } from '../InfoBar';
import { RightMenu } from '../RightMenu';
import { CountBar } from '../CountBar';
import { SheetBar } from '../SheetBar';
import { FormulaBar } from '../FormulaBar';
import { RichText } from '../RichText';
import { AppContext, BaseComponentProps, Component, Container, Content, createRef, Footer, Header, Layout, Sider } from '@univerjs/base-ui';
import { ISheetUIPluginConfig } from '../../Basics';

export interface BaseSheetContainerProps extends BaseComponentProps {
    config: ISheetUIPluginConfig;
    container?: HTMLElement;
    changeLocale: (locale: string) => void;
    methods?: any;
}

// Types for state
interface IState {
    currentLocale: string;
}

/**
 * One universheet instance DOM container
 */
export class SheetContainer extends Component<BaseSheetContainerProps, IState> {
    leftContentLeft: number;

    leftContentTop: number;

    rightBorderX: number;

    rightBorderY: number;

    splitLeftRef = createRef<HTMLDivElement>();

    contentRef = createRef<HTMLDivElement>();

    constructor(props: BaseSheetContainerProps) {
        super(props);
        // init state
        this.state = {
            currentLocale: 'zh',
        };
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

    setLocale(e: Event) {
        const { changeLocale } = this.props;
        const target = e.target as HTMLSelectElement;
        const locale = target.value;
        // You must use setState to trigger the re-rendering of the child component
        this.setState(
            {
                currentLocale: locale,
            },
            () => {
                changeLocale(locale);
            }
        );
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const { methods } = this.props;
        const { layout } = this.props.config;
        const { currentLocale } = this.state;
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
                                {/* extend main content */}
                                {/* <ModalGroup></ModalGroup> */}
                                {!!config.contentSplit && (
                                    <Container ref={this.splitLeftRef} className={style.contentInnerLeftContainer}>
                                        <div className={style.hoverCursor} onMouseDown={this.handleSplitBarMouseDown}></div>
                                    </Container>
                                )}
                                <Container ref={this.contentRef} className={style.contentInnerRightContainer}>
                                    {/* {config.rightMenu && <RightMenu {...methods.rightMenu}></RightMenu>}
                                              {config.cellEditor && <RichText {...methods.cellEditor}></RichText>} */}

                                    {<RichText {...methods.cellEditor}></RichText>}
                                    <div
                                        style={{
                                            position: 'fixed',
                                            right: '200px',
                                            top: '10px',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: 50,
                                                margin: '5px 0 0 5px',
                                            }}
                                        >
                                            语言
                                        </span>
                                        <select value={currentLocale} onChange={this.setLocale.bind(this)} style={{ width: 55 }}>
                                            <option value="en">English</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </div>
                                </Container>
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
                            {/* {config.sheetBar && <SheetBar {...methods.sheetBar}></SheetBar>} */}
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
