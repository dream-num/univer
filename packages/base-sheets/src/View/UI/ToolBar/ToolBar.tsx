import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { IToolBarItemProps } from '../../../Model/ToolBarModel';
import { SheetPlugin } from '../../../SheetPlugin';
import { Select } from '../Common/Select/Select';
import { TextButton } from '../Common/TextButton/TextButton';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    style?: JSX.CSSProperties;
    toolList: IToolBarItemProps[];
    // forwardRefs?: RefObject<HTMLElement>;
}

interface IState {
    toolList: IToolBarItemProps[];
    moreToolList: IToolBarItemProps[];
    defaultToolList: IToolBarItemProps[];
    more: boolean;
    index: number;
    toolbarListWidths: number[];
    moreText: string;
}

export class ToolBar extends Component<IProps, IState> {
    toolbarWarp = createRef();

    toolbarRef = createRef();

    moreBtn = createRef();

    moreToolRef = createRef();

    SelectRef = createRef();

    Render: BaseComponentRender;

    initialize(props: IProps) {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            // Button contains main button and drop down arrow, translation file contains main and right
            more: false,
            toolList: [],
            defaultToolList: [],
            moreToolList: [],
            index: 0,
            toolbarListWidths: [],
            moreText: '',
        };
    }

    /**
     * show more tool buttons
     *
     * TODO : 点击其他地方需要隐藏more buttons
     */
    moreTool = () => {
        let more = this.state.more;
        this.setState({ more: !more });

        if (!more) {
            document.addEventListener('click', this.hide, true);
        }
    };

    hide = (e: Event) => {
        if (this.moreToolRef.current.contains(e.target)) return;
        e.stopImmediatePropagation();
        this.setState({ more: false });
        document.removeEventListener('click', this.hide, true);
    };

    /**
     * Gets the distance of each button from the parent element
     */
    setToolbarListWidth = () => {
        const toolbar = this.toolbarWarp.current.querySelector(`.${styles.toolbar}`);
        const toolbarLeft = toolbar.getBoundingClientRect().left;
        const toolbarListWidths: number[] = []; // 每个 btn 离父元素 left 距离
        const toolbarListWidths1: number[] = []; // 每个 btn 离父元素 left 距离

        toolbar.childNodes.forEach((item: Element, i: number) => {
            toolbarListWidths.push(parseInt((item.getBoundingClientRect().left - toolbarLeft + item.getBoundingClientRect().width).toString()));
        });
        let max = 0;
        let count = 0;
        toolbarListWidths1.push(toolbarListWidths[0]);
        toolbarListWidths.reduce((prev, next) => {
            if (prev > next && count === 0) {
                max = prev;
                count++;
            }
            toolbarListWidths1.push(next + max);
            return next + max;
        });

        this.setState(
            () => ({
                toolbarListWidths: toolbarListWidths1,
            }),
            this.resetToolbar
        );
    };

    resetLabel = (toolList: any[]) => {
        const plugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        for (let i = 0; i < toolList.length; i++) {
            const item = toolList[i];

            // 优先寻找自定义组件
            if (item.customLabel) {
                const Label = plugin?.getRegisterComponent(item.customLabel.name);
                if (Label) {
                    const props = item.customLabel.props ?? {};
                    item.label = <Label {...props} />;
                }
            }

            if (item.customSuffix) {
                const Suffix = plugin?.getRegisterComponent(item.customSuffix.name);
                if (Suffix) {
                    const props = item.customSuffix.props ?? {};
                    item.suffix = <Suffix {...props} />;
                }
            }

            if (item.children) {
                item.children = this.resetLabel(item.children);
            }
        }
        return toolList;
    };

    setToolBar = (toolList: any[]) => {
        toolList = this.resetLabel(toolList);

        this.setState(
            {
                toolList,
            },
            () => {
                this.resetToolbar();
            }
        );
    };

    resetToolbar = () => {
        /**
         * TODO: resize 有性能问题。
         * 思路
         *
         * 1. toolbarWarp.current.offsetWidth 存储起来
         * 2. 节流
         * 3. 插件主UI拆分到其他插槽，只有按钮和简单的items放到工具栏
         *
         *
         * zh: 根据插件数组长度，最后一个插件安装完成，执行一次。后面动态安装的插件，每安装一次计算一次
         *
         * en: According to the length of the plug-in array, the last plug-in is installed and executed once. The dynamically installed plugins will be calculated once for each installation
         *
         */

        const toolbarWarp = this.toolbarWarp;
        // const toolbarList = this.state.toolbarListWidths;
        // let index = toolbarList.length;
        // for (let i = 0; i < toolbarList.length; i++) {
        //     let itemLeft = toolbarList[i];
        //     if (itemLeft > toolbarWarp.current.offsetWidth - 60) {
        //         index = i - 1;
        //         break;
        //     }
        // }
        this.setState(
            (preState) => {
                // const defaultToolList = preState.toolList.slice(0, index);
                const defaultToolList = preState.toolList;
                // const moreToolList = preState.toolList.slice(index);
                const moreToolList: IToolBarItemProps[] = [];

                return {
                    defaultToolList,
                    moreToolList,
                };
            },
            () => {
                // 获取contentref,Ul限制高度
                const wrapper = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.getContentRef().current!;
                const height = `${(wrapper as HTMLDivElement).offsetHeight}px`;
                const ul = this.toolbarRef.current.querySelectorAll('ul');
                for (let i = 0; i < ul.length; i++) {
                    ul[i].style.maxHeight = height;
                }
            }
        );
    };

    componentDidMount() {
        this._context.getObserverManager().getObserver<ToolBar>('onToolBarDidMountObservable')?.notifyObservers(this);
    }

    render(props: IProps, state: IState) {
        const { defaultToolList } = state;

        const Button = this.Render.renderFunction('Button');
        const Container = this.Render.renderFunction('Container');
        const Tooltip = this.Render.renderFunction('Tooltip');

        return (
            <Container style={{ position: 'relative' }}>
                <div className={styles.toolbarWarp} ref={this.toolbarWarp}>
                    <div className={styles.toolbar} ref={this.toolbarRef}>
                        {defaultToolList.map((item) => {
                            if (item.toolbarType) {
                                return (
                                    <Tooltip title={item.tooltip} placement={'bottom'}>
                                        <TextButton label={item.label} onClick={item.onClick}></TextButton>
                                    </Tooltip>
                                );
                            }
                            return (
                                <Tooltip title={item.tooltip} placement={'bottom'}>
                                    <Select
                                        type={item.type}
                                        display={item.display}
                                        children={item.children}
                                        customLabel={item.customLabel}
                                        customSuffix={item.customSuffix}
                                        label={item.label}
                                        onClick={item.onClick}
                                        onKeyUp={item.onKeyUp}
                                        defaultColor={item.defaultColor}
                                        hideSelectedIcon={item.hideSelectedIcon}
                                        className={item.className}
                                    ></Select>
                                </Tooltip>
                            );
                        })}
                    </div>
                    {this.state.moreToolList.length === 0 ? null : (
                        <div ref={this.moreBtn} className={styles.singleButton}>
                            <Tooltip title={this.state.moreText} placement={'bottom'}>
                                <Button type="text" onClick={this.moreTool}>
                                    <div style={{ fontSize: '14px' }}>{this.state.moreText}</div>
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                </div>

                <div className={`${styles.moreTool} ${this.state.more ? styles.moreShow : null}`} ref={this.moreToolRef}></div>
            </Container>
        );
    }
}
