import { InsertSheetCommand } from '@univerjs/base-sheets';
import { ICommandService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { AddWorksheet28, ScrollBarLeft12, ScrollBarRight12 } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';
import styles from './index.module.less';
import { SheetBarMenu } from './SheetBarMenu/SheetBarMenu';
import { SheetBarTabs } from './SheetBarTabs/SheetBarTabs';
import { IScrollState } from './SheetBarTabs/utils/slide-tab-bar';

const SCROLL_WIDTH = 100;

export const SheetBar = () => {
    const [leftScrollState, setLeftScrollState] = useState(false);
    const [rightScrollState, setRightScrollState] = useState(false);

    const commandService = useDependency(ICommandService);
    const sheetbarService = useDependency(ISheetBarService);

    useEffect(() => {
        const subscription = sheetbarService.scroll$.subscribe((state: IScrollState) => {
            updateScrollButtonState(state);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const updateScrollButtonState = (state: IScrollState) => {
        const { leftEnd, rightEnd } = state;
        setLeftScrollState(leftEnd);
        setRightScrollState(rightEnd);
    };

    ref = createRef<SheetBarMenu>();

    sheetContainerRef = createRef<HTMLDivElement>();

    sheetContentRef = createRef();
    sheetBarContentRef = createRef<ITabRef>();

    // 先生成移动对象的副本,移动对象固定定位,达到边界的时候将副本移位
    time = 0;

    target: any = null;

    cloneTarget: any = null;

    startLeft: number = 0;

    startClientX: number = 0;

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
            showMenu: false,
            showManageMenu: false,
            menuStyle: {},
            activeKey: '',
        };
    }

    // setstate
    setValue = (value: any, fn?: () => void) => {
        this.setState((prevState) => ({ ...value }), fn);
    };

    const handleScrollLeft = () => {
        sheetbarService.setScrollX(-SCROLL_WIDTH);
    };

    const handleScrollRight = () => {
        sheetbarService.setScrollX(SCROLL_WIDTH);
    };

    //  // 重命名sheet
    //  reNameSheet = (id: string) => {
    //     const item = this.slideTabBar.getSlideTabItems().find((item) => item.primeval().dataset.id === id);
    //     if (item) {
    //         item.editor();
    //     }
    // };

    return (
        <div className={styles.sheetBar}>
            <div className={styles.sheetBarOptions}>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>
        );
    }

    /**
     * Update worksheet info.
     *
     * This method could be triggered when
     */
    private _updateSheetBarStatus(): void {
        const injector = this.context.injector!;
        const univerInstanceService = injector.get(IUniverInstanceService);
        const commandService = injector.get(ICommandService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheets = workbook.getSheets();

        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hide: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: sheet.getStatus() === BooleanNumber.TRUE,
            onClick: (e?: MouseEvent) => {
                const worksheetId = sheet.getSheetId();
                commandService.executeCommand(SetWorksheetShowCommand.id, {
                    workbookId: workbook.getUnitId(),
                    worksheetId,
                });
            },
        }));

        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                index: `${index}`,
                selected: sheet.getStatus() === BooleanNumber.TRUE,
                color: (sheet.getTabColor() as string) ?? undefined,
                onMouseDown: () => {
                    const worksheetId = sheet.getSheetId();
                    this.setState({
                        activeKey: worksheetId,
                    });

                    commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        workbookId: workbook.getUnitId(),
                        worksheetId,
                    });
                },
            }));
        const activeKey = sheetListItems.find((item) => item.selected)?.sheetId || '';

        // TODO: update state to the component, including active sheet index

        this.setState({
            menuList: worksheetMenuItems,
            sheetList: sheetListItems,
            activeKey,
        });
    }

    /**
     * When specific command executed, update the status of sheet bar.
     * @returns disposable
     */
    private _setupStatusUpdate(): IDisposable {
        const commandService = this.context.injector.get(ICommandService);
        return commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SetTabColorMutation.id:
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActivateMutation.id:
                    this._updateSheetBarStatus();
                    break;
                default:
                    break;
            }
        });
    }

    private _addSheet() {
        const commandService = this.context.injector.get(ICommandService);
        commandService.executeCommand(InsertSheetCommand.id, {});
    }

    private handleScrollLeft = () => {
        if (this.sheetBarContentRef.current) {
            this.sheetBarContentRef.current.scrollContent(-SCROLL_WIDTH);
        }
    };
    private handleScrollRight = () => {
        if (this.sheetBarContentRef.current) {
            this.sheetBarContentRef.current.scrollContent(SCROLL_WIDTH);
        }
    };

    override render() {
        const { sheetList, menuList, sheetUl, showMenu, showManageMenu, menuStyle, activeKey } = this.state;

        const reRenderString = sheetList
            .map((item) => `${item?.color?.toString()}${item?.label?.toString()}`)
            .join('-');

        return (
            <div className={styles.sheetBar}>
                <div className={styles.sheetBarOptions}>
                    {/* add sheet button */}
                    <Button
                        className={styles.sheetBarOptionsButton}
                        onClick={() => {
                            this._addSheet();
                        }}
                    >
                        {/* <Icon.Math.AddIcon style={{ fontSize: '20px' }} /> */}
                    </Button>
                    {/* all sheets button */}
                    <Button className={styles.sheetBarOptionsButton} onClick={() => this.ref.current?.showMenu(true)}>
                        {/* <Icon.MenuIcon style={{ fontSize: '20px' }} /> */}
                        <SheetBarMenu menu={menuList as ISheetBarMenuItem[]}></SheetBarMenu>
                    </Button>
                </div>

                {/* user s button */}
                <Tabs
                    draggable
                    className={styles.slideTabBar}
                    activeKey={activeKey}
                    reRenderString={reRenderString}
                    ref={this.sheetBarContentRef}
                >
                    {sheetList.map((item) => (
                        <TabPane
                            key={item.sheetId}
                            keys={item.sheetId}
                            label={this.getSheetBarItem(item)}
                            className={styles.sheetBarTabPane}
                        ></TabPane>
                    ))}
                </Tabs>
                {/* <div className={styles.slideTabBar}>
                    {sheetList.map((item) => (
                        <div
                            onMouseDown={item.onMouseDown}
                            onContextMenu={this.contextMenu}
                            key={item.sheetId}
                            data-id={item.sheetId}
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
                                <div
                                    className={`${styles.slideTabActiveBar}`}
                                    style={item.color ? { background: item.color } : {}}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div> */}

            {/* Scroll arrows */}
            <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                <Button type="text" size="small" disabled={leftScrollState} onClick={handleScrollLeft}>
                    <ScrollBarLeft12 />
                </Button>
                <Button type="text" size="small" disabled={rightScrollState} onClick={handleScrollRight}>
                    <ScrollBarRight12 />
                </Button>
            </div>
        );
    }
}
