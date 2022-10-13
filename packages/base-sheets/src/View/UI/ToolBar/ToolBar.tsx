import {
    BaseComponentRender,
    BaseComponentSheet,
    BaseToolBarProps,
    Component,
    createRef,
    IToolBarItemProps,
    ISlotElement,
    RefObject,
    Description,
    DescriptionEnum,
    BaseSelectProps,
} from '@univer/base-component';
import { Nullable, Observer, PLUGIN_NAMES, Workbook } from '@univer/core';
import { SpreadsheetPlugin } from '../../../SpreadsheetPlugin';

import styles from './index.module.less';
import { SingleButton } from './SingleButton';

interface IState {
    toolList: IToolBarItemProps[];
    moreToolList: IToolBarItemProps[];
    defaultToolList: IToolBarItemProps[];
    changeLabel: string[];
    more: boolean;
    index: number;
    toolbarListWidths: number[];
    moreText: string;
}

/**
 * button type
 *
 * 1. single : single button
 * 2. select : click button, alert select options
 * 3. doubleButton : left single button, right select
 * 4. doubleButtonPopup : left single button, right popup
 */
export class ToolBar extends Component<BaseToolBarProps, IState> {
    toolbarWarp = createRef();

    toolbar = createRef();

    moreBtn = createRef();

    FormatModal = createRef();

    moreToolRef = createRef();

    Render: BaseComponentRender;

    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize(props: BaseToolBarProps) {
        // super(props);

        const { toolList, func } = props;

        // const { func } = this.props;
        func?.addButton(this.addButton.bind(this));

        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            // Button contains main button and drop down arrow, translation file contains main and right
            changeLabel: ['horizontalAlignMode', 'verticalAlignMode', 'textWrapMode', 'textRotateMode', 'fillColor', 'textColor', 'border', 'mergeCell'],
            more: false,
            toolList,
            defaultToolList: [],
            moreToolList: [],
            index: 0,
            toolbarListWidths: [],
            moreText: '',
        };

        this.initEvent();
    }

    initEvent() {
        // this.getContext()
        //     .getObserverManager()
        //     .getObserver('onSheetRenderDidMountObservable', 'workbook')
        //     ?.add((e) => {
        //         const mainComponent = this.getContext().getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        //         mainComponent.getMainComponent().onPointerUpObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //             const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
        //             console.log('----mainCom----', evt);
        //         });
        //     });
    }

    handleClickMoreFormats(...args: any[]) {
        // console.dir(args);
    }

    handleClick = (children: IToolBarItemProps, toolbarIndex: number, childrenIndex: number) => {
        let prevState = this.state.toolList;
        const changeLabel = this.state.changeLabel;
        if (changeLabel.includes(prevState[toolbarIndex].locale!)) prevState[toolbarIndex].label! = children.icon!;
        prevState[toolbarIndex].children?.forEach((item, i) => {
            item.selected = i === childrenIndex;
        });
        this.setState({ toolList: prevState });
    };

    click = (toolbarIndex: number) => {
        console.log(`this is ${this.state.toolList[toolbarIndex].locale}`);
    };

    // showFormatModal
    showFormatModal = (e: MouseEvent, name: string) => {
        this.FormatModal.current.showModal(name, true);
    };

    /**
     * set toollist by config setting and Locale message, some buttons will be hidden
     */
    setLocale(cb: () => void) {
        const locale = this.context.locale;

        const more = locale.get('toolbar.more');

        this.setState((prevState) => {
            const currentToolList = prevState.toolList.map((item) => {
                // set current Locale string for tooltip
                item.tooltip = locale.get(`toolbar.${item.locale}`);

                if (this.state.changeLabel.includes(item.locale!)) {
                    item.tooltip = locale.get(`toolbar.${item.locale}.main`);
                    item.tooltipRight = locale.get(`toolbar.${item.locale}.right`);
                }
                // set current Locale string for select
                if (item.type === 'select') {
                    if (!item.children?.length) return item;
                    this.setLocalIconAndLabel(item);

                    // null or undefined
                    if (!item.label) {
                        item.label = typeof item.label === 'object' ? item.label : item.children[0].label;
                    }
                    // string, or JSX instanceof JSX.Element, HTML string
                }

                // other props

                return item;
            });

            return {
                toolList: currentToolList,
                defaultToolList: currentToolList,
                moreText: more,
            };
        }, cb);
    }

    setLocalIconAndLabel(item: IToolBarItemProps) {
        const locale = this.context.locale;
        if (item.children) {
            item.children.forEach((ele) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
                if (ele.iconName) {
                    ele.icon = locale.get(`${ele.iconName}`);
                }

                this.setLocalIconAndLabel(ele);
            });
        }
    }

    /**
     * add plugin button
     */
    addButton(item: IToolBarItemProps): Promise<void> {
        /**
         * en: There will be multiple toolbar buttons added, so you need to use prevState to add buttons from the previous state, otherwise it will cause overwriting
         *
         * zh: 会有多个工具栏按钮添加进来，所以需要使用prevState来从上一个状态新增按钮，否则会造成覆盖
         *
         * TODO: 节流，多个Button一次性渲染
         */
        return new Promise((resolve) => {
            this.setState(
                (prevState) => ({
                    toolList: [...prevState.toolList, item],
                    defaultToolList: [...prevState.toolList, item],
                }),
                () => {
                    resolve();
                    // this.setToolbarListWidth
                }
            );
        });
    }

    setToolBar(toolList: IToolBarItemProps[]) {
        this.setState(
            {
                toolList,
            },
            () => {
                this.setLocale(() => {
                    // this.setToolbarListWidth();
                    // this.resetToolbar();
                });
            }
        );
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
        // const bodyWidth = document.body.clientWidth - (152 * 2 + 70);
        const toolbarList = this.state.toolbarListWidths;
        let index = toolbarList.length;
        for (let i = 0; i < toolbarList.length; i++) {
            let itemLeft = toolbarList[i];
            // console.log(toolbarList);

            // console.log(itemLeft, toolbarWarp.current.offsetWidth - 60);

            if (itemLeft > toolbarWarp.current.offsetWidth - 60) {
                index = i - 1;
                break;
            }
        }
        this.setState((preState) => {
            const defaultToolList = preState.toolList.slice(0, index);
            // 获取contentref
            const wrapper = this._context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.getContentRef().current!;
            // const wrapper = $$('.univer-content-inner-right-container');
            const height = `${(wrapper as HTMLDivElement).offsetHeight}px`;
            // 下拉框最大高度设置为content高度
            defaultToolList.forEach((item) => {
                if (item.type === 'select') {
                    if (item.style) {
                        item.style = { ...item.style, maxHeight: height };
                    } else {
                        item.style = { maxHeight: height };
                    }
                }
            });

            const moreToolList = preState.toolList.slice(index);
            return {
                defaultToolList,
                moreToolList,
            };
        });
    };

    /**
     * init
     */
    componentWillMount() {
        // // init Locale message
        // this.setLocale();
        // // when change Locale, update Locale message
        // // do not use componentWillUpdate,it will listen all state changes
        // this._localeObserver = this._context
        //     .getObserverManager()
        //     .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
        //     ?.add(() => {
        //         this.setLocale();
        //     });
        // // resize listener
        // window.addEventListener('resize', debounce(this.resetToolbar, 300));
        // this.setState((prevState) => ({
        //     defaultToolList: prevState.toolList,
        //     index: prevState.toolList.length,
        // }));
    }

    componentDidMount() {
        // this.setToolbarListWidth();
        // this.resetToolbar();

        this._context.getObserverManager().getObserver<ToolBar>('onToolBarDidMountObservable')?.notifyObservers(this);
    }

    /**
     * when change Locale, update Locale message
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
        // window.removeEventListener('resize', debounce(this.resetToolbar, 300));
    }

    toolbarListRender(tool: IToolBarItemProps[]) {
        let ele = tool.map((item: IToolBarItemProps, index: number) => {
            if (!item.show) return null;

            this.itemRender(item);

            if (item.type === ISlotElement.SINGLE) {
                return (
                    <SingleButton
                        tooltip={item.tooltip}
                        key={item.locale}
                        name={item.locale}
                        label={item.label}
                        icon={item.icon}
                        onClick={item.onClick}
                        active={item.selected}
                        triggerUpdate={item.triggerUpdate}
                    ></SingleButton>
                );
            }

            if (item.type === ISlotElement.SELECT) {
                const Select = this.Render.renderFunction('Select');
                return (
                    <Select
                        tooltip={item.tooltip}
                        tooltipRight={item.tooltipRight}
                        key={item.locale}
                        children={item.children as BaseSelectProps[]}
                        label={item.label}
                        icon={item.icon}
                        needChange={item.needChange}
                        selectType={item.selectType}
                        border={item.border}
                        style={item.style}
                        slot={item.slot || {}}
                        onKeyUp={item.onKeyUp}
                        onClick={item.onClick}
                        triggerUpdate={item.triggerUpdate}
                    />
                );
            }

            if (item.type === ISlotElement.JSX) {
                return item.label;
            }

            return null;
        });
        return ele;
    }

    itemRender(item: IToolBarItemProps) {
        const includeNumber = /\d/;

        // handle icon string to Icon JSX.Element
        if (typeof item.icon === 'string' && !includeNumber.test(item.icon) && Number.isNaN(Number(item.icon)) && DescriptionEnum[DescriptionEnum[item.icon]]) {
            const IconEle = this.Render.renderFunction(item.icon as keyof Description);
            item.icon = <IconEle />;
        }

        if (item.label === 'BorderLineColorPicker') {
            const ColorPicker = this.Render.renderFunction('ColorPicker');
            item.label = (
                <ColorPicker
                    style={{ visibility: 'visible', position: 'relative', boxShadow: 'none' }}
                    color="#000"
                    onClick={(color) => {
                        // Update selected color
                        item.value = color;
                    }}
                    onCancel={() => {}}
                />
            );
        }
        // handle label string to Label JSX.Element
        else if (typeof item.label === 'string' && !includeNumber.test(item.label) && Number.isNaN(Number(item.label)) && DescriptionEnum[DescriptionEnum[item.label]]) {
            const LabelEle = this.Render.renderFunction(item.label as keyof Description);
            item.label = <LabelEle />;
        }

        // handle border line border size
        if (item.locale === 'borderLine.borderSize') {
            item.onClick = (ele, itemInfo) => {
                item.value = itemInfo.item.value;
            };
        }

        // Secondary menu
        if (item.children) {
            item.children.forEach((childItem: IToolBarItemProps) => {
                this.itemRender(childItem);
            });
        }
    }

    render(props: BaseToolBarProps, state: IState) {
        const { style, forwardRefs } = props;
        const { defaultToolList } = state;

        // Reference forwardRef to current toolbar ref
        this.toolbar = forwardRefs as RefObject<HTMLElement>;
        const Button = this.Render.renderFunction('Button');
        const Container = this.Render.renderFunction('Container');
        const Tooltip = this.Render.renderFunction('Tooltip');
        const FormatModal = this.Render.renderFunction('FormatModal');

        return (
            <Container style={{ position: 'relative' }}>
                <div className={styles.toolbarWarp} ref={this.toolbarWarp}>
                    <div className={styles.toolbar} ref={this.toolbar}>
                        {this.toolbarListRender(this.state.defaultToolList)}
                        {/* {defaultToolList.length > 0 &&
                            defaultToolList.map((item: IToolBarItemProps, index: number) => {
                                if (!item.show) return null;

                                this.itemRender(item);

                                if (item.type === 'single') {
                                    return (
                                        <SingleButton
                                            tooltip={item.tooltip}
                                            key={item.locale}
                                            name={item.locale}
                                            label={item.label}
                                            icon={item.icon}
                                            onClick={() => {
                                                // TODO set active status style
                                                item.selected = !item.selected;
                                                item.onClick && item.onClick(item.selected);
                                            }}
                                            active={item.selected}
                                        ></SingleButton>
                                    );
                                }

                                if (item.type === 'select') {
                                    const Select = this.Render.renderFunction('Select');
                                    return (
                                        <Select
                                            tooltip={item.tooltip}
                                            tooltipRight={item.tooltipRight}
                                            key={item.locale}
                                            children={item.children as BaseSelectProps[]}
                                            label={item.label}
                                            icon={item.icon}
                                            needChange={item.needChange}
                                            selectType={item.selectType}
                                            border={item.border}
                                            style={item.style}
                                            slot={item.slot || {}}
                                            onKeyUp={item.onKeyUp}
                                            onClick={item.onClick}
                                        />
                                    );
                                }

                                if (item.type === ISlotElement.JSX) {
                                    return item.label;
                                }

                                return null;
                            })} */}
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

                <div className={`${styles.moreTool} ${this.state.more ? styles.moreShow : null}`} ref={this.moreToolRef}>
                    {/* {this.toolbarListRender(this.state.moreToolList)} */}
                </div>
                <FormatModal ref={this.FormatModal}></FormatModal>
            </Container>
        );
    }
}
