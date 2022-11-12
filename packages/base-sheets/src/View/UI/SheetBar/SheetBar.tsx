import { BaseComponentRender, BaseComponentSheet, BaseSheetBarProps, BaseUlProps, Component, createRef, RefObject } from '@univer/base-component';
import { Nullable, Observer, PLUGIN_NAMES, Workbook } from '@univer/core';
import { Ul } from '@univer/style-universheet';
import { SlideTabBar } from '../../../Basics/SlideTabBar/SlideTabBar';
import styles from './index.module.less';

type SheetState = {
    sheetList: BaseSheetBarProps[];
    menuList: BaseSheetBarProps[];
    sheetUl: BaseUlProps[];
    addSheet: Nullable<() => void>;
    selectSheet: Nullable<() => void>;
    contextMenu: Nullable<(e: Event) => void>;
    changeSheetName: Nullable<(e: Event) => void>;
    dragEnd: Nullable<Function>;
};

export class SheetBar extends Component<BaseSheetBarProps, SheetState> {
    ref = createRef();

    ulRef = createRef();

    sheetContainerRef = createRef();

    sheetContentRef = createRef();

    sheetBarContentRef = createRef();

    slideTabBar: SlideTabBar;

    Render: BaseComponentRender;

    private _localeObserver: Nullable<Observer<Workbook>>;

    private _renderKey: number = 1;

    initialize(props: BaseSheetBarProps) {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            sheetList: [],
            sheetUl: [],
            menuList: [],
            addSheet: null,
            contextMenu: null,
            selectSheet: null,
            changeSheetName: null,
            dragEnd: null,
        };
    }

    jointJsx(list: BaseSheetBarProps[] | BaseUlProps[]) {
        list.forEach((item: any) => {
            if (item.icon && typeof item.icon === 'string' && /Icon$/.test(item.icon)) {
                const Icon = this.Render.renderFunction(item.icon);
                item.icon = <Icon />;
            }
            if (item.selectType && item.selectType === 'jsx') {
                const JSX: any = this.Render.renderFunction(item.label);
                // ColorPicker
                item.label = (
                    <JSX
                        style={{ visibility: 'visible', marginTop: '-60px', marginLeft: '-50px' }}
                        onClick={(color: string) => {
                            item.onClick(color);
                        }}
                    />
                );
            }
            if (item.children && item.children.length > 0) {
                this.jointJsx(item.children);
            }
        });
    }

    // setstate
    setValue = (value: any, fn?: () => void) => {
        const { sheetList, menuList, sheetUl } = value;
        if (sheetList) {
            this.jointJsx(sheetList);
        }
        if (menuList) {
            this.jointJsx(menuList);
        }
        if (sheetUl) {
            this.jointJsx(sheetUl);
        }
        this.setState((prevState) => ({ ...value }), fn);
    };

    // 点击按钮左右滑动
    scrollLeft = (e: MouseEvent) => {
        // let scroll = this.sheetContentRef.current;
        // if (parseFloat(scroll.style.left) + 50 >= 0) {
        //     scroll.style.left = '0px';
        //     return;
        // }
        // scroll.style.left = `${parseFloat(scroll.style.left) + 50}px`;
        this.slideTabBar.getScrollbar().scrollX(this.slideTabBar.getScrollbar().getScrollX() - 50);
    };

    scrollRight = (e: MouseEvent) => {
        // let scroll = this.sheetContentRef.current;
        // let width = scroll.scrollWidth;
        // let container = this.sheetContainerRef.current;
        // if (width <= container.offsetWidth) {
        //     return;
        // }
        // const scrollLeft = parseFloat(scroll.style.left);
        // if (width - Math.abs(scrollLeft) <= container.offsetWidth) {
        //     return;
        // }
        // if (width - Math.abs(scrollLeft) - container.offsetWidth <= 50) {
        //     scroll.style.left = `${scrollLeft - (width - Math.abs(scrollLeft) - container.offsetWidth)}px`;
        // } else {
        //     scroll.style.left = `${scrollLeft - 50}px`;
        // }
        this.slideTabBar.getScrollbar().scrollX(this.slideTabBar.getScrollbar().getScrollX() + 50);
    };

    overGrid = () => {
        // // 超过范围向左移动
        // const scroll = this.sheetContentRef.current;
        // const width = scroll.scrollWidth;
        // const container = this.sheetBarContentRef.current;
        // if (width <= container.offsetWidth / 2) {
        //     return;
        // }
        // scroll.style.left = `${container.offsetWidth / 2 - width}px`;
    };

    // 右击显示菜单
    contextMenu = (e: MouseEvent) => {
        e.preventDefault();
        this.showUlList(e);
    };

    // 显示下拉
    showSelect = (e: MouseEvent, ref: RefObject<Ul>) => {
        e.stopImmediatePropagation();
        const current = ref.current;
        if (current) current.showSelect();
        // 点击外部隐藏子组件
        window.addEventListener('click', this.hideSelect);
    };

    // 隐藏下拉
    hideSelect = (e: MouseEvent) => {
        const current = this.ref.current;
        const ulCurrent = this.ulRef.current;
        if (current) current.hideSelect();
        if (ulCurrent) ulCurrent.hideSelect();
        window.removeEventListener('click', this.hideSelect);
    };

    // 点击不同sheet页显示ullist
    showUlList = (e: MouseEvent) => {
        new Promise<void>((resolve) => {
            const target = e.currentTarget as HTMLDivElement;
            const id = target.dataset.id as string;
            this.showSelect(e, this.ulRef);
            resolve();
        }).then(() => {
            const currentTarget = (e.currentTarget as HTMLElement).closest(`.${styles.slideTabItem}`);
            if (currentTarget) {
                const currentRect = currentTarget.getBoundingClientRect();
                const left = `${currentRect.left}px`;
                const bottom = `${currentRect.height}px`;
                const ul = this.ulRef.current.ulRef.current;
                ul.style.left = left;
                ul.style.bottom = bottom;
                ul.style.top = 'auto';
                ul.style.right = 'auto';
            }
        });
    };

    // 重命名sheet
    reNameSheet = (id: string) => {
        const item = this.slideTabBar.getSlideTabItems().find((item) => item.primeval().dataset.id === id);
        if (item) {
            item.editor();
        }
        // const sheetContentDiv = this.sheetContentRef.current.querySelectorAll('div');
        // Array.from(sheetContentDiv).forEach((node: any) => {
        //     if (node.dataset.id === id) {
        //         const span = node.querySelector('span');
        //         const dblclick = new MouseEvent('dblclick');
        //         span?.dispatchEvent(dblclick);
        //     }
        // });
    };

    changeEditable = (e: MouseEvent) => {
        const target = e.target as HTMLDivElement;
        let listener: (event: Event) => void;
        target.contentEditable = 'true';
        target.focus();
        target.addEventListener(
            'blur',
            (listener = (event) => {
                if (this.state.changeSheetName) {
                    this.state.changeSheetName(e);
                }
                target.contentEditable = 'false';
                target.removeEventListener('blur', listener);
            })
        );
    };

    /**
     * destory
     */
    componentWillUnmount() {
       // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    componentDidUpdate() {
        if (this.slideTabBar) {
            this.slideTabBar.destroy();
        }
        this.slideTabBar = new SlideTabBar({
            slideTabBarClassName: 'univer-slide-tab-bar',
            slideTabBarItemActiveClassName: 'univer-slide-tab-active',
            slideTabBarItemClassName: 'univer-slide-tab-item',
            slideTabBarItemAutoSort: true,
            onChangeName: (event: Event) => {
                if (this.state.changeSheetName) {
                    this.state.changeSheetName(event);
                }
            },
            onSlideEnd: (event: Event) => {
                if (this.state.dragEnd) {
                    this.state.dragEnd(this.slideTabBar.getSlideTabItems().map((item) => item.primeval()));
                }
            },
        });
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<SheetBar>('onSheetBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET)?.notifyObservers(this);
    }

    // 先生成移动对象的副本,移动对象固定定位,达到边界的时候将副本移位
    time = 0;

    target: any = null;

    cloneTarget: any = null;

    startLeft: number;

    startClientX: number;

    render(props: BaseSheetBarProps, state: SheetState) {
        const { sheetList, menuList, sheetUl, addSheet, contextMenu, selectSheet } = state;

        if (!addSheet || !selectSheet || !contextMenu) return;

        const Button = this.Render.renderFunction('Button');
        const Ul = this.Render.renderFunction('Ul');
        const AddIcon = this.Render.renderFunction('AddIcon');
        const MenuIcon = this.Render.renderFunction('MenuIcon');
        const NextIcon = this.Render.renderFunction('NextIcon');

        return (
            <div className={styles.sheetBar}>
                {/* user options button */}
                <div className={styles.sheetBarOptions}>
                    <Button className={styles.sheetBarOptionsButton} onClick={addSheet} type="text">
                        <AddIcon style={{ fontSize: '20px' }} />
                    </Button>
                    <Button className={styles.sheetBarOptionsButton} onClick={(e: MouseEvent) => this.showSelect(e, this.ref)} type="text">
                        <MenuIcon style={{ fontSize: '20px' }} />
                        <Ul onClick={selectSheet} children={menuList} ref={this.ref} style={{ bottom: '2.2rem', left: '0' }}></Ul>
                    </Button>
                </div>

                {/* user slide button */}
                <div className={styles.slideTabBar} ref={this.sheetContainerRef}>
                    {sheetList.map((item) => (
                        <div
                            onMouseDown={item.onDown}
                            onClick={item.onClick}
                            onContextMenu={contextMenu}
                            data-id={item.sheetId}
                            key={this._renderKey++}
                            className={`${styles.slideTabItem} ${item.selected ? styles.slideTabActive : ''}`}
                        >
                            <div className={`${styles.slideTabContent}`}>
                                <div className={`${styles.slideTabDivider}`}></div>
                                <div className={`${styles.slideTabTitle}`}>
                                    <span style={{ padding: '2px 5px 2px 5px' }}>{item.label}</span>
                                </div>
                                <div className={`${styles.slideTabIcon}`} data-slide-skip="true" style={{ lineHeight: 1 }} data-id={item.sheetId} onClick={contextMenu}>
                                    {item.icon}
                                </div>
                            </div>
                            <div className={`${styles.slideTabFooter}`}>
                                <div className={`${styles.slideTabActiveBar}`} style={item.color ? { background: item.color } : {}}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* mouse right button context menu */}
                <Ul children={sheetUl} ref={this.ulRef}></Ul>

                {/* prev next scroll button */}
                <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                    <Button type="text" className={styles.sheetBarOptionsButton} onClick={this.scrollLeft}>
                        <NextIcon rotate={90} style={{ padding: '5px' }} />
                    </Button>
                    <Button type="text" className={styles.sheetBarOptionsButton} onClick={this.scrollRight}>
                        <NextIcon rotate={-90} style={{ padding: '5px' }} />
                    </Button>
                </div>
            </div>
        );
    }
}
