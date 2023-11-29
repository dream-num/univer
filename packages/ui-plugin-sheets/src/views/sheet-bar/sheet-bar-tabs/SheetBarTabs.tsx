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
import { IConfirmService } from '@univerjs/base-ui';
import type { ICommandInfo } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import styles from './index.module.less';
import type { IBaseSheetBarProps } from './SheetBarItem';
import { SheetBarItem } from './SheetBarItem';
import type { IScrollState } from './utils/slide-tab-bar';
import { SlideTabBar } from './utils/slide-tab-bar';

export interface ISheetBarTabsProps {}

export function SheetBarTabs() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [boxShadow, setBoxShadow] = useState('');
    const slideTabBarRef = useRef<{ slideTabBar: SlideTabBar | null }>({ slideTabBar: null });
    const slideTabBarContainerRef = useRef<HTMLDivElement>(null);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const localeService = useDependency(LocaleService);
    const confirmService = useDependency(IConfirmService);

    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    useEffect(() => {
        statusInit();
        const slideTabBar = setupSlideTabBarInit();
        const disposable = setupStatusUpdate();
        const subscribeList = [
            setupSubscribeScroll(),
            setupSubscribeScrollX(),
            setupSubscribeRenameId(),
            setupSubscribeAddSheet(),
        ];

        return () => {
            disposable.dispose();
            slideTabBar.destroy();
            subscribeList.forEach((subscribe) => subscribe.unsubscribe());
        };
    }, []);

    useEffect(() => {
        if (sheetList.length > 0) {
            setupSlideTabBarUpdate();
        }
    }, [sheetList]);

    const setupSlideTabBarInit = () => {
        const slideTabBar = new SlideTabBar({
            slideTabBarClassName: styles.slideTabBar,
            slideTabBarItemActiveClassName: styles.slideTabActive,
            slideTabBarItemClassName: styles.slideTabItem,
            slideTabBarSpanEditClassName: styles.slideTabSpanEdit,
            slideTabBarItemAutoSort: true,
            slideTabBarContainer: slideTabBarContainerRef.current,
            currentIndex: 0,
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
                sheetBarService.setScroll(state);
            },
            onEmptyAlert: () => {
                const id = 'slideTabBarAlert';
                confirmService.open({
                    id,
                    children: { title: localeService.t('sheetConfig.sheetNameCannotIsEmptyError') },
                    // TODO@Dushusir: i18n
                    title: { title: 'There was a problem' },
                    onClose() {
                        confirmService.close(id);
                    },
                    onConfirm() {
                        confirmService.close(id);
                    },
                });
            },
        });

        slideTabBarRef.current.slideTabBar = slideTabBar;

        // FIXME@Dushusir: First time asynchronous rendering will cause flickering problems
        resizeInit(slideTabBar);

        return slideTabBar;
    };

    const setupSlideTabBarUpdate = () => {
        const currentIndex = sheetList.findIndex((item) => item.selected);
        slideTabBarRef.current.slideTabBar?.update(currentIndex);
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
        sheetBarService.scroll$.subscribe((state: IScrollState) => {
            updateScrollButtonState(state);
        });

    const setupSubscribeScrollX = () =>
        sheetBarService.scrollX$.subscribe((x: number) => {
            slideTabBarRef.current.slideTabBar?.flipPage(x);
        });

    const setupSubscribeRenameId = () =>
        sheetBarService.renameId$.subscribe(() => {
            slideTabBarRef.current.slideTabBar?.getActiveItem()?.editor();
        });

    const setupSubscribeAddSheet = () =>
        sheetBarService.addSheet$.subscribe(() => {
            slideTabBarRef.current.slideTabBar?.getScrollbar().scrollRight();
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

    const buttonScroll = (slideTabBar: SlideTabBar) => {
        sheetBarService.setScroll({
            leftEnd: slideTabBar.isLeftEnd(),
            rightEnd: slideTabBar.isRightEnd(),
        });
    };

    const resizeInit = (slideTabBar: SlideTabBar) => {
        // Target element
        const slideTabBarContainer = slideTabBarContainerRef.current?.querySelector(`.${styles.slideTabBar}`);
        if (!slideTabBarContainer) return;

        // Create a Resizeobserver
        const observer = new ResizeObserver(() => {
            buttonScroll(slideTabBar);
        });

        // Start the observer
        observer.observe(slideTabBarContainer);
    };

    return (
        <div className={styles.slideTabBarContainer} ref={slideTabBarContainerRef}>
            <div className={styles.slideTabBar} style={{ boxShadow }}>
                {sheetList.map((item) => (
                    <SheetBarItem {...item} key={item.sheetId} selected={activeKey === item.sheetId} />
                ))}
            </div>
        </div>
    );
}
