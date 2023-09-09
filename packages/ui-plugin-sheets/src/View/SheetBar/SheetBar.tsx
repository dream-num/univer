import { SetWorksheetActivateCommand } from '@univerjs/base-sheets';
import { AppContext, BaseMenuItem, BaseSheetBarProps, Button, CustomLabel, Icon, IDisplayMenuItem, IMenuItem, Menu, MenuPosition } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';
import { Component, createRef, RefObject } from 'react';

import styles from './index.module.less';
import { ISheetBarMenuItem, SheetBarMenu } from './SheetBarMenu';
import { SlideTabBar } from './SlideTabBar/SlideTabBar';

type SheetState = {
    sheetList: BaseSheetBarProps[];
    menuList: BaseSheetBarProps[];
    sheetUl: BaseMenuItem[];
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
};

export class SheetBar extends Component<BaseSheetBarProps, SheetState> {
    static override contextType = AppContext;

    ref = createRef<SheetBarMenu>();

    ulRef = createRef<Menu>();

    sheetContainerRef = createRef<HTMLDivElement>();

    slideTabRoot = createRef<HTMLDivElement>();

    sheetContentRef = createRef();

    sheetBarContentRef = createRef();

    slideTabBar: SlideTabBar;

    // 先生成移动对象的副本,移动对象固定定位,达到边界的时候将副本移位
    time = 0;

    target: any = null;

    cloneTarget: any = null;

    startLeft: number;

    startClientX: number;

    private _renderKey: number = 1;

    constructor(props: BaseSheetBarProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: BaseSheetBarProps) {
        this.state = {
            sheetList: [],
            sheetUl: [],
            menuList: [],
            menuItems: [],
        };
    }

    // setstate
    setValue = (value: any, fn?: () => void) => {
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

    // Right click to display menu
    contextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLDivElement;
        const worksheetId = target.dataset.id as string;

        // after show ul,activate DOM
        this.showUlList(e, () => {
            this.setSlideTabActive(worksheetId);
        });

        // activate command
        const commandService: ICommandService = this.context.injector.get(ICommandService);
        commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
    };

    // Click the button to display the menu, if it is not in the current sheet, only switch the sheet after clicking
    onContextMenuClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        const target = e.currentTarget as HTMLDivElement;
        const worksheetId = target.dataset.id as string;

        const currentSheetId = this.getCurrentSheetId();

        if (worksheetId === currentSheetId) {
            this.showUlList(e);
        } else {
            this.setSlideTabActive(worksheetId);
            // activate command
            const commandService: ICommandService = this.context.injector.get(ICommandService);
            commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
        }
    };

    // 显示下拉
    showSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, ref: RefObject<Menu>) => {
        e.stopPropagation();
        e.preventDefault();
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
    showUlList = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb?: () => void) => {
        new Promise<void>((resolve) => {
            const target = e.currentTarget as HTMLDivElement;
            const id = target.dataset.id as string;
            this.showSelect(e, this.ulRef);
            resolve();
        }).then(() => {
            const currentTarget = (e.target as HTMLElement).closest(`.${styles.slideTabItem}`);
            if (currentTarget) {
                const currentRect = currentTarget.getBoundingClientRect();
                const left = `${currentRect.left}px`;
                const bottom = `${currentRect.height}px`;
                const ul = this.ulRef.current?.getMenuRef().current;
                if (!ul) return;
                ul.style.left = left;
                ul.style.bottom = bottom;
                ul.style.top = 'auto';
                ul.style.right = 'auto';

                cb && cb();
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

    // no need
    // changeEditable = (e: MouseEvent) => {
    //     const target = e.target as HTMLDivElement;
    //     let listener: (event: Event) => void;
    //     target.contentEditable = 'true';
    //     target.focus();
    //     target.addEventListener(
    //         'blur',
    //         (listener = (event) => {
    //             this.props.changeSheetName?.(e);
    //             target.contentEditable = 'false';
    //             target.removeEventListener('blur', listener);
    //         })
    //     );
    // };

    override componentDidUpdate() {
        if (this.slideTabBar) {
            this.slideTabBar.destroy();
        }
        this.slideTabBar = new SlideTabBar({
            slideTabBarClassName: 'univer-slide-tab-bar',
            slideTabBarItemActiveClassName: 'univer-slide-tab-active',
            slideTabBarItemClassName: 'univer-slide-tab-item',
            slideTabBarItemAutoSort: true,
            slideTabRoot: this.slideTabRoot.current as HTMLElement,
            activeClassNameAutoController: true,
            onChangeName: (sheetId: string, name: string) => {
                this.props.changeSheetName?.(sheetId, name);
            },
            onSlideEnd: (event: Event) => {
                this.props.dragEnd?.(this.slideTabBar.getSlideTabItems().map((item) => item.primeval()));
            },
            onItemClick: (slideItemIndex: number) => {
                this.props.selectSheet?.(slideItemIndex);
            },
        });
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    // Convenient for controller to control sheetBarMenu
    showMenuList(show: boolean) {
        this.ref.current?.showMenu(show);
    }

    setSlideTabActive(sheetId: string, cb?: () => void) {
        this.setState((prevState, props) => {
            const prevSheetList = prevState.sheetList;
            const currentSheetList = prevSheetList.map((sheet) => {
                if (sheet.sheetId === sheetId) {
                    sheet.selected = true;
                } else {
                    sheet.selected = false;
                }
                return sheet;
            });
            return {
                ...prevState,
                sheetList: currentSheetList,
            };
        }, cb);
    }

    getCurrentSheetId() {
        const sheetList = this.state.sheetList;
        const currentSheet = sheetList.find((sheet) => sheet.selected);
        return currentSheet?.sheetId;
    }

    override render() {
        const { sheetList, menuList, sheetUl } = this.state;

        const { addSheet, selectSheet } = this.props;

        if (!sheetList.length) return;

        return (
            <div className={styles.sheetBar} ref={this.slideTabRoot}>
                {/* user options button */}
                <div className={styles.sheetBarOptions}>
                    <Button className={styles.sheetBarOptionsButton} onClick={addSheet} type="text">
                        <Icon.Math.AddIcon style={{ fontSize: '20px' }} />
                    </Button>
                    <Button className={styles.sheetBarOptionsButton} onClick={(e: MouseEvent) => this.ref.current?.showMenu(true)} type="text">
                        <Icon.MenuIcon style={{ fontSize: '20px' }} />
                        <SheetBarMenu menu={menuList as ISheetBarMenuItem[]} ref={this.ref}></SheetBarMenu>
                    </Button>
                </div>

                {/* user slide button */}
                <div className={styles.slideTabBar} ref={this.sheetContainerRef}>
                    {sheetList.map((item) => (
                        <div
                            onMouseDown={item.onMouseDown}
                            onContextMenu={this.contextMenu}
                            data-id={item.sheetId}
                            key={this._renderKey++}
                            className={`${styles.slideTabItem} ${item.selected ? styles.slideTabActive : ''}`}
                        >
                            <div className={`${styles.slideTabContent}`}>
                                <div className={`${styles.slideTabDivider}`}></div>
                                <div className={`${styles.slideTabTitle}`}>
                                    <span className={`${styles.slideTabSpan}`} style={{ padding: '2px 5px 2px 5px' }}>
                                        <CustomLabel label={item.label} />
                                    </span>
                                </div>
                                <div
                                    className={`${styles.slideTabIcon}`}
                                    data-slide-skip="true"
                                    style={{ lineHeight: 1 }}
                                    data-id={item.sheetId}
                                    onClick={(e) => this.onContextMenuClick(e)}
                                >
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
                <Menu className={styles.sheetUl} menu={sheetUl} menuId={MenuPosition.SHEET_BAR} ref={this.ulRef} />

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
