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
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetbarService = useDependency(ISheetBarService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    let slideTabBar: SlideTabBar;

    useEffect(() => {
        statusInit();

        const disposable = setupStatusUpdate();

        return () => {
            disposable.dispose();
        };
    }, []);

    useEffect(() => {
        if (sheetList.length > 0) {
            setupSlideTabBarUpdate();
        }
    }, [sheetList]);

    const setupSlideTabBarUpdate = () => {
        const currentIndex = sheetList.findIndex((item) => item.selected);

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

        // TODO@Dushusir: Can you initialize it once without using the `subscribe` label?
        if (!subscribe) {
            sheetbarService.scrollX$.subscribe((x: number) => {
                // update scrollX
                slideTabBar.setScroll(x);
            });

            sheetbarService.renameId$.subscribe((renameId: string) => {
                const index = sheetList.findIndex((item) => item.sheetId === renameId);
                slideTabBar.getSlideTabItems()[index].editor();
            });

            sheetbarService.addSheet$.subscribe((addSheet: number) => {
                slideTabBar.getScrollbar().scrollRight();
            });

            setSubscribe(true);
        }
    };

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo<object>) => {
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

    return (
        <div className={styles.slideTabBarContainer}>
            <div className={styles.slideTabBar}>
                {sheetList.map((item) => (
                    <SheetBarItem {...item} key={item.sheetId} selected={activeKey === item.sheetId} />
                ))}
            </div>
        </div>
    );
}
