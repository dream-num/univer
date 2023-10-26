import {
    IInsertSheetMutationParams,
    InsertSheetMutation,
    IRemoveSheetMutationParams,
    ISetTabColorMutationParams,
    ISetWorksheetActivateMutationParams,
    ISetWorksheetHideMutationParams,
    ISetWorksheetNameMutationParams,
    ISetWorksheetOrderMutationParams,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderCommand,
    SetWorksheetOrderMutation,
} from '@univerjs/base-sheets';
import { BooleanNumber, ICommandInfo, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import sheetBarStyles from '../index.module.less';
import styles from './index.module.less';
import { IBaseSheetBarProps, SheetBarItem } from './SheetBarItem';
import { SlideTabBar } from './utils/slide-tab-bar';

export interface IProps {}

export function SheetBarTabs(props: IProps) {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState<string>('');
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    let slideTabBar: SlideTabBar;

    useEffect(() => {
        statusInit();

        const disposable = setupStatusUpdate();

        return () => {
            // Clean up disposable when the component unmounts
            disposable.dispose();
        };
    }, []);

    useEffect(() => {
        // 在 count 发生变化时执行回调函数
        console.log('sheetList changed:', JSON.stringify(sheetList));

        if (slideTabBar) {
            slideTabBar.destroy();
        }

        if (sheetList.length > 0) {
            slideTabBar = new SlideTabBar({
                slideTabBarClassName: styles.slideTabBar,
                slideTabBarItemActiveClassName: styles.slideTabActive,
                slideTabBarItemClassName: styles.slideTabItem,
                slideTabBarItemAutoSort: true,
                slideTabRootClassName: sheetBarStyles.sheetBar,
                // pressDelay: 300,
                onChangeName: (event: Event) => {
                    // this.props.changeSheetName?.(event);
                    console.info('onChangeName==', event);
                },
                onSlideEnd: (event: Event, order: number) => {
                    console.info('onSlideEnd==', event, order);
                    // this.props.dragEnd?.(slideTabBar.getSlideTabItems().map((item) => item.primeval()));
                    commandService.executeCommand(SetWorksheetOrderCommand.id, { order });
                },
            });
        }
    }, [sheetList]);

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo<object>) => {
            switch (commandInfo.id) {
                // case SetTabColorMutation.id:
                //     setTabColor(commandInfo as ICommandInfo<ISetTabColorMutationParams>);
                //     break;
                // case SetWorksheetHideMutation.id:
                //     setWorksheetHide(commandInfo as ICommandInfo<ISetWorksheetHideMutationParams>);
                //     break;
                // case RemoveSheetMutation.id:
                //     removeSheet(commandInfo as ICommandInfo<IRemoveSheetMutationParams>);
                //     break;
                // case SetWorksheetNameMutation.id:
                //     setWorksheetName(commandInfo as ICommandInfo<ISetWorksheetNameMutationParams>);
                //     break;
                // case InsertSheetMutation.id:
                //     insertSheet(commandInfo as ICommandInfo<IInsertSheetMutationParams>);
                //     break;
                // case SetWorksheetOrderMutation.id:
                //     setWorksheetOrder(commandInfo as ICommandInfo<ISetWorksheetOrderMutationParams>);
                //     break;
                // case SetWorksheetActivateMutation.id:
                //     setWorksheetActivate(commandInfo as ICommandInfo<ISetWorksheetActivateMutationParams>);
                //     break;
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
                index: `${index}`,
                selected: sheet.getStatus() === BooleanNumber.TRUE,
                color: sheet.getTabColor() ?? undefined,
            }));
        setSheetList(sheetListItems);
    };

    const setTabColor = (commandInfo: ICommandInfo<ISetTabColorMutationParams>) => {};

    const setWorksheetHide = (commandInfo: ICommandInfo<ISetWorksheetHideMutationParams>) => {};

    const removeSheet = (commandInfo: ICommandInfo<IRemoveSheetMutationParams>) => {
        const { params } = commandInfo;
        if (!params) return;
        // const { worksheetId } = params;
        console.log('removeSheet', params);
    };

    const setWorksheetName = (commandInfo: ICommandInfo<ISetWorksheetNameMutationParams>) => {};

    const insertSheet = (commandInfo: ICommandInfo<IInsertSheetMutationParams>) => {};

    const setWorksheetOrder = (commandInfo: ICommandInfo<ISetWorksheetOrderMutationParams>) => {};

    const setWorksheetActivate = (commandInfo: ICommandInfo<ISetWorksheetActivateMutationParams>) => {
        const { params } = commandInfo;
        if (!params) return;
        const { worksheetId } = params;
        setActiveKey(worksheetId);
    };

    const onMouseDown = (worksheetId: string) => {
        if (activeKey !== worksheetId) {
            // setActiveKey(worksheetId);
            commandService.executeCommand(SetWorksheetActivateCommand.id, {
                workbookId: workbook.getUnitId(),
                worksheetId,
            });
        }
    };

    return (
        <div className={styles.slideTabBarContainer}>
            <div className={styles.slideTabBar}>
                {sheetList.map((item) => (
                    <SheetBarItem
                        {...item}
                        key={item.sheetId}
                        onMouseDown={() => onMouseDown(item.sheetId ?? '')}
                        selected={activeKey === item.sheetId}
                    />
                ))}
            </div>
        </div>
        // <Tabs
        //     draggable
        //     className={styles.slideTabBar}
        //     activeKey={activeKey}
        //     // Add reRenderString and ref props here
        // >
        //     {sheetList.map((item) => (
        //         <TabPane
        //             key={item.sheetId}
        //             keys={item.sheetId}
        //             label={
        //                 <SheetBarItem
        //                     {...item}
        //                     onMouseDown={() => onMouseDown(item.sheetId ?? '')}
        //                     selected={activeKey === item.sheetId}
        //                 />
        //             }
        //             className={styles.sheetBarTabPane}
        //         ></TabPane>
        //     ))}
        // </Tabs>
    );
}
