import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SetWorksheetOrderCommand,
    SetWorksheetOrderMutation,
} from '@univerjs/base-sheets';
import { BooleanNumber, ICommandInfo, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { ISheetBarService } from '../../../services/sheetbar/sheetbar.service';
import sheetBarStyles from '../index.module.less';
import styles from './index.module.less';
import { IBaseSheetBarProps, SheetBarItem } from './SheetBarItem';
import { IScrollState, SlideTabBar } from './utils/slide-tab-bar';

export interface ISheetBarTabsProps {}

export function SheetBarTabs() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState<string>('');
    const [subscribe, setSubscribe] = useState(false);
    const [boxShadow, setBoxShadow] = useState('');

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetbarService = useDependency(ISheetBarService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    useEffect(() => {
        statusInit();
        const disposable = setupStatusUpdate();
        const subscription = setupSubscribeScroll();

        return () => {
            disposable.dispose();
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (sheetList.length > 0) {
            setupSlideTabBarUpdate();
        }
    }, [sheetList]);

    const setupSlideTabBarUpdate = () => {
        let slideTabBar: SlideTabBar | null = null;
        const currentIndex = sheetList.findIndex((item) => item.selected);

        // TODO@Dushusir: Can you initialize it once without using the `subscribe` label?
        if (!subscribe) {
            // TODO@Dushusir: There may not be initialization each time
            slideTabBar = new SlideTabBar({
                slideTabBarClassName: styles.slideTabBar,
                slideTabBarItemActiveClassName: styles.slideTabActive,
                slideTabBarItemClassName: styles.slideTabItem,
                slideTabBarSpanEditClassName: styles.slideTabSpanEdit,
                slideTabBarItemAutoSort: true,
                slideTabRootClassName: sheetBarStyles.sheetBar,
                currentIndex,
                onChangeName: (worksheetId: string, worksheetName: string) => {
                    commandService.executeCommand(SetWorksheetNameCommand.id, {
                        worksheetId,
                        name: worksheetName,
                    });
                },
                onSlideEnd: (event: Event, order: number) => {
                    commandService.executeCommand(SetWorksheetOrderCommand.id, { order });
                },
                onChangeTab: (event: Event, worksheetId: string) => {
                    commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
                },
                onScroll: (state: IScrollState) => {
                    sheetbarService.setScroll(state);
                },
            });

            sheetbarService.scrollX$.subscribe((x: number) => {
                // update scrollX
                slideTabBar && slideTabBar.setScroll(x);
            });

            sheetbarService.renameId$.subscribe((renameId: string) => {
                const index = sheetList.findIndex((item) => item.sheetId === renameId);
                slideTabBar && slideTabBar.getSlideTabItems()[index].editor();
            });

            sheetbarService.addSheet$.subscribe(() => {
                slideTabBar && slideTabBar.getScrollbar().scrollRight();
            });
            // TODO@Dushusir: Asynchronous rendering will cause flickering problems
            scrollButtonInit(slideTabBar);
            resizeInit(slideTabBar);
            setSubscribe(true);
        }

        // why null?
        slideTabBar && slideTabBar.update(currentIndex);
    };

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
            switch (commandInfo.id) {
                case SetTabColorMutation.id:
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActivateMutation.id:
                    statusInit();
                    break;
                default:
                    break;
            }
        });

    const statusInit = () => {
        const currentWorksheetId = workbook.getActiveSheet().getSheetId();
        setActiveKey(currentWorksheetId);

        const sheets = workbook.getSheets();
        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                index,
                selected: sheet.getStatus() === BooleanNumber.TRUE,
                color: sheet.getTabColor() ?? undefined,
            }));
        setSheetList(sheetListItems);
    };

    const setupSubscribeScroll = () =>
        sheetbarService.scroll$.subscribe((state: IScrollState) => {
            updateScrollButtonState(state);
        });

    const updateScrollButtonState = (state: IScrollState) => {
        const { leftEnd, rightEnd } = state;
        // box-shadow: inset 10px 0px 10px -10px rgba(0, 0, 0, 0.2), inset -10px 0px 10px -10px rgba(0, 0, 0, 0.2);
        let boxShadow = '';
        if (leftEnd && rightEnd) {
            boxShadow = '';
        } else if (leftEnd && !rightEnd) {
            boxShadow = 'inset -10px 0px 10px -10px rgba(0, 0, 0, 0.2)';
        } else if (!leftEnd && rightEnd) {
            boxShadow = 'inset 10px 0px 10px -10px rgba(0, 0, 0, 0.2)';
        } else if (!leftEnd && !rightEnd) {
            boxShadow = 'inset 10px 0px 10px -10px rgba(0, 0, 0, 0.2), inset -10px 0px 10px -10px rgba(0, 0, 0, 0.2)';
        }

        setBoxShadow(boxShadow);
    };

    const scrollButtonInit = (slideTabBar: SlideTabBar) => {
        sheetbarService.setScroll({
            leftEnd: slideTabBar.isLeftEnd(),
            rightEnd: slideTabBar.isRightEnd(),
        });
    };

    const resizeInit = (slideTabBar: SlideTabBar) => {
        // Target element
        const slideTabBarContainer = document.querySelector(`.${styles.slideTabBar}`);
        if (!slideTabBarContainer) return;

        // Create a Resizeobserver example
        const observer = new ResizeObserver(() => {
            scrollButtonInit(slideTabBar);
        });

        // Start the observer
        observer.observe(slideTabBarContainer);
    };

    return (
        <div className={styles.slideTabBarContainer}>
            <div className={styles.slideTabBar} style={{ boxShadow }}>
                {sheetList.map((item) => (
                    <SheetBarItem {...item} key={item.sheetId} selected={activeKey === item.sheetId} />
                ))}
            </div>
        </div>
    );
}
