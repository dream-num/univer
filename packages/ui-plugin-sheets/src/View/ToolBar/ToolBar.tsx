import { AppContext, AppContextValues, BaseComponentProps, Button, Component, Container, createRef, debounce, PreactContext, Select, TextButton, Tooltip } from '@univerjs/base-ui';
import { SheetUIPlugin } from '../..';
import { SHEET_UI_PLUGIN_NAME } from '../../Basics';
import { IToolbarItemProps } from '../../Controller';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    style?: JSX.CSSProperties;
    toolList: IToolbarItemProps[];
}

interface IState {
    toolList: IToolbarItemProps[];
    moreToolList: IToolbarItemProps[];
    defaultToolList: IToolbarItemProps[];
    showMore: boolean;
    toolbarListWidths: number[];
    moreText: Record<string, string>;
}

export class Toolbar extends Component<IProps, IState> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    toolbarRef = createRef();

    moreBtnRef = createRef();

    moreToolRef = createRef();

    SelectRef = createRef();

    clientWidth = 0;

    initialize() {
        this.state = {
            // Button contains main button and drop down arrow, translation file contains main and right
            showMore: false,
            toolList: [],
            defaultToolList: [],
            moreToolList: [],
            toolbarListWidths: [],
            moreText: {},
        };
    }

    /**
     * show more tool buttons
     *
     * TODO : 点击其他地方需要隐藏more buttons
     */
    showMore = () => {
        let showMore = this.state.showMore;
        this.setState({ showMore: !showMore });

        if (!showMore) {
            document.addEventListener('click', this.hide, true);
        }
    };

    hide = (e: Event) => {
        if (this.moreToolRef.current.contains(e.target)) return;
        e.stopImmediatePropagation();
        this.setState({ showMore: false });
        document.removeEventListener('click', this.hide, true);
    };

    /**
     * Gets the distance of each button from the parent element
     */
    debounceSetToolbarListWidth = debounce(() => {
        this.setToolbarListWidth();
    }, 50);

    setToolbarListWidth = () => {
        if (!this.clientWidth) {
            this.clientWidth = document.documentElement.clientWidth;
        }
        const list = this.toolbarRef.current.querySelectorAll(`.${styles.toolbarWarp} > div`);
        const moreButtonWidth = this.moreBtnRef.current.clientWidth;
        let width = 60 + moreButtonWidth;
        let index = null;

        const clientWidth = document.documentElement.clientWidth;
        if (clientWidth <= this.clientWidth) {
            // 向左resize
            this.clientWidth = clientWidth;
            for (let i = 0; i < list.length; i++) {
                width += list[i].clientWidth + 6;

                if (width > clientWidth) {
                    index = i;
                    break;
                }
            }
            if (index !== null) {
                this.setState(
                    {
                        defaultToolList: this.state.toolList.slice(0, index),
                        moreToolList: index ? this.state.toolList.slice(index) : [],
                    },
                    () => {
                        this.resetUl();
                        this.forceUpdate();
                    }
                );
            }
        } else {
            // 向右resize
            this.clientWidth = clientWidth;
            if (this.state.moreToolList.length) {
                let toolWidth = 30 + moreButtonWidth;
                for (let i = 0; i < list.length; i++) {
                    toolWidth += list[i].clientWidth + 6;
                }

                const moreList = this.moreToolRef.current.querySelectorAll(`.${styles.moreTool} > div`);
                let moreIndex = null;
                let last = false; //最后一个元素

                for (let i = 0; i < moreList.length; i++) {
                    toolWidth += moreList[i].clientWidth + 6;

                    if (toolWidth > clientWidth) {
                        moreIndex = i;
                        break;
                    } else if (i === moreList.length - 1) {
                        moreIndex = i;
                        last = true;
                    }
                }

                if (moreIndex !== null) {
                    this.setState(
                        {
                            defaultToolList: this.state.defaultToolList.concat(this.state.moreToolList.slice(0, last ? moreIndex + 1 : moreIndex)),
                            moreToolList: last ? [] : this.state.moreToolList.slice(moreIndex),
                        },
                        () => {
                            this.resetUl();
                            this.forceUpdate();
                        }
                    );
                }
            }
        }
    };

    resetLabel = (toolList: any[]) => {
        const componentManager = this.getContext().getPluginManager().getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)?.getComponentManager();

        for (let i = 0; i < toolList.length; i++) {
            const item = toolList[i];

            // 优先寻找自定义组件
            if (item.customLabel) {
                const Label = componentManager?.get(item.customLabel.name);
                if (Label) {
                    const props = item.customLabel.props ?? {};
                    item.label = <Label {...props} />;
                }
            }

            if (item.customSuffix) {
                const Suffix = componentManager?.get(item.customSuffix.name);
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

    setToolbar = (toolList: any[]) => {
        toolList = this.resetLabel(toolList);

        this.setState(
            {
                toolList,
                defaultToolList: toolList,
            },
            () => {
                this.setToolbarListWidth();
            }
        );
    };

    resetUl = () => {
        const wrapper = this.getContext()
            .getPluginManager()
            .getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            ?.getAppUIController()
            .getSheetContainerController()
            .getContentRef().current!;
        const height = `${(wrapper as HTMLDivElement).offsetHeight}px`;
        const ul = this.toolbarRef.current.querySelectorAll('ul');
        for (let i = 0; i < ul.length; i++) {
            ul[i].style.maxHeight = height;
        }
    };

    componentDidMount() {
        this.props.getComponent?.(this);
        window.addEventListener('resize', this.debounceSetToolbarListWidth);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debounceSetToolbarListWidth);
    }

    // 渲染dom
    getToolbarList(list: IToolbarItemProps[]) {
        return list.map((item) => {
            if (item.toolbarType) {
                if (item.show) {
                    return (
                        <Tooltip title={this.getLocale(item.tooltip)} placement={'bottom'}>
                            <TextButton active={item.active} label={item.label} onClick={item.onClick}></TextButton>
                        </Tooltip>
                    );
                }
            } else {
                if (item.show) {
                    return (
                        <Select
                            tooltip={this.getLocale(item.tooltip)}
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
                    );
                }
            }
            return null;
        });
    }

    render() {
        const { defaultToolList, moreToolList, moreText, showMore } = this.state;

        return (
            <Container style={{ position: 'relative' }}>
                <div className={`${styles.toolbarWarp} ${styles.toolbar}`} ref={this.toolbarRef}>
                    {this.getToolbarList(defaultToolList)}

                    <div ref={this.moreBtnRef} className={styles.moreButton} style={{ visibility: moreToolList.length ? 'visible' : 'hidden' }}>
                        <Tooltip title={this.getLocale('toolbar.toolMoreTip')} placement={'bottom'}>
                            <Button type="text" onClick={this.showMore}>
                                <div style={{ fontSize: '14px' }}>{this.getLocale('toolbar.toolMore')}</div>
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {moreToolList.length ? (
                    <div style={{ visibility: showMore ? 'visible' : 'hidden' }} className={`${styles.moreTool} ${styles.toolbar}`} ref={this.moreToolRef}>
                        {this.getToolbarList(moreToolList)}
                    </div>
                ) : (
                    ''
                )}
            </Container>
        );
    }
}
