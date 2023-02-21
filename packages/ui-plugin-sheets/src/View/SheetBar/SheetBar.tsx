import { BaseMenuItem, BaseSheetBarProps, Button, Component, createRef, Icon, Menu, RefObject } from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import { SheetBarMenu } from './SheetBarMenu';
import styles from './index.module.less';
import { SlideTabBar } from '../../Basics/SlideTabBar/SlideTabBar';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '../..';

type SheetState = {
    sheetList: BaseSheetBarProps[];
    menuList: BaseSheetBarProps[];
    sheetUl: BaseMenuItem[];
};

export class SheetBar extends Component<BaseSheetBarProps, SheetState> {
    ref = createRef();

    ulRef = createRef();

    sheetContainerRef = createRef();

    slideTabRoot = createRef();

    sheetContentRef = createRef();

    sheetBarContentRef = createRef();

    slideTabBar: SlideTabBar;

    // 先生成移动对象的副本,移动对象固定定位,达到边界的时候将副本移位
    time = 0;

    target: any = null;

    cloneTarget: any = null;

    startLeft: number;

    startClientX: number;

    private _localeObserver: Nullable<Observer<Workbook>>;

    private _renderKey: number = 1;

    initialize(props: BaseSheetBarProps) {
        this.state = {
            sheetList: [],
            sheetUl: [],
            menuList: [],
        };
    }

    resetLabel(list: any) {
        const componentManager = this.getContext().getPluginManager().getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)?.getComponentManager();

        for (let i = 0; i < list.length; i++) {
            const item = list[i];

            // 优先寻找自定义组件
            if (item.customLabel) {
                const Label = componentManager?.get(item.customLabel.name);
                if (Label) {
                    const props = item.customLabel.props ?? {};
                    item.label = <Label {...props} />;
                }
            }

            if (item.children) {
                item.children = this.resetLabel(item.children);
            }
        }
        return list;
    }

    // setstate
    setValue = (value: any, fn?: () => void) => {
        let { sheetList, menuList, sheetUl } = value;
        if (sheetList) {
            sheetList = this.resetLabel(sheetList);
        }
        if (menuList) {
            menuList = this.resetLabel(menuList);
        }
        if (sheetUl) {
            sheetUl = this.resetLabel(sheetUl);
        }
        this.setState((prevState) => ({ ...value }), fn);
    };

    // 点击按钮左右滑动
    scrollLeft = (e: MouseEvent) => {
        this.slideTabBar.getScrollbar().scrollX(this.slideTabBar.getScrollbar().getScrollX() - 50);
    };

    scrollRight = (e: MouseEvent) => {
        this.slideTabBar.getScrollbar().scrollX(this.slideTabBar.getScrollbar().getScrollX() + 50);
    };

    overGrid = () => {};

    // 右击显示菜单
    contextMenu = (e: MouseEvent) => {
        e.preventDefault();
        this.showUlList(e);
    };

    // 显示下拉
    showSelect = (e: MouseEvent, ref: RefObject<Menu>) => {
        e.stopImmediatePropagation();
        const current = ref.current;
        if (current) current.showMenu(true);
        // 点击外部隐藏子组件
        window.addEventListener('click', this.hideSelect);
    };

    // 隐藏下拉
    hideSelect = (e: MouseEvent) => {
        const ulCurrent = this.ulRef.current;
        if (ulCurrent) ulCurrent.showMenu(false);
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
                const ul = this.ulRef.current.base;
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
    };

    changeEditable = (e: MouseEvent) => {
        const target = e.target as HTMLDivElement;
        let listener: (event: Event) => void;
        target.contentEditable = 'true';
        target.focus();
        target.addEventListener(
            'blur',
            (listener = (event) => {
                this.props.changeSheetName?.(e);
                target.contentEditable = 'false';
                target.removeEventListener('blur', listener);
            })
        );
    };

    componentDidUpdate() {
        if (this.slideTabBar) {
            this.slideTabBar.destroy();
        }
        this.slideTabBar = new SlideTabBar({
            slideTabBarClassName: 'univer-slide-tab-bar',
            slideTabBarItemActiveClassName: 'univer-slide-tab-active',
            slideTabBarItemClassName: 'univer-slide-tab-item',
            slideTabBarItemAutoSort: true,
            slideTabRoot: this.slideTabRoot.current,
            onChangeName: (event: Event) => {
                this.props.changeSheetName?.(event);
            },
            onSlideEnd: (event: Event) => {
                this.props.dragEnd?.(this.slideTabBar.getSlideTabItems().map((item) => item.primeval()));
            },
        });
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    render(props: BaseSheetBarProps, state: SheetState) {
        const { sheetList, menuList, sheetUl } = state;
        const { addSheet, selectSheet } = this.props;

        if (!sheetList.length) return;

        return (
            <div className={styles.sheetBar} ref={this.slideTabRoot}>
                {/* user options button */}
                <div className={styles.sheetBarOptions}>
                    <Button className={styles.sheetBarOptionsButton} onClick={addSheet} type="text">
                        <Icon.Math.AddIcon style={{ fontSize: '20px' }} />
                    </Button>
                    <Button className={styles.sheetBarOptionsButton} onClick={(e: MouseEvent) => this.ref.current.showMenu(true)} type="text">
                        <Icon.MenuIcon style={{ fontSize: '20px' }} />
                        <SheetBarMenu onClick={selectSheet} menu={menuList} ref={this.ref}></SheetBarMenu>
                    </Button>
                </div>

                {/* user slide button */}
                <div className={styles.slideTabBar} ref={this.sheetContainerRef}>
                    {sheetList.map((item) => (
                        <div
                            onMouseDown={item.onDown}
                            onClick={item.onClick}
                            onContextMenu={this.contextMenu}
                            data-id={item.sheetId}
                            key={this._renderKey++}
                            className={`${styles.slideTabItem} ${item.selected ? styles.slideTabActive : ''}`}
                        >
                            <div className={`${styles.slideTabContent}`}>
                                <div className={`${styles.slideTabDivider}`}></div>
                                <div className={`${styles.slideTabTitle}`}>
                                    <span style={{ padding: '2px 5px 2px 5px' }}>{item.label}</span>
                                </div>
                                <div className={`${styles.slideTabIcon}`} data-slide-skip="true" style={{ lineHeight: 1 }} data-id={item.sheetId} onClick={this.contextMenu}>
                                    <Icon.NextIcon />
                                </div>
                            </div>
                            <div className={`${styles.slideTabFooter}`}>
                                <div className={`${styles.slideTabActiveBar}`} style={item.color ? { background: item.color } : {}}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* mouse right button context menu */}
                <Menu className={styles.sheetUl} menu={sheetUl} ref={this.ulRef} />

                {/* prev next scroll button */}
                <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                    <Button type="text" className={styles.sheetBarOptionsButton} onClick={this.scrollLeft}>
                        <Icon.NextIcon rotate={90} style={{ padding: '5px' }} />
                    </Button>
                    <Button type="text" className={styles.sheetBarOptionsButton} onClick={this.scrollRight}>
                        <Icon.NextIcon rotate={-90} style={{ padding: '5px' }} />
                    </Button>
                </div>
            </div>
        );
    }
}
