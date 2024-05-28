/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo, Workbook } from '@univerjs/core';
import { ICommandService, IPermissionService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import {
    InsertSheetMutation,
    RangeProtectionRuleModel,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SetWorksheetOrderCommand,
    SetWorksheetOrderMutation,
    WorkbookEditablePermission,
    WorkbookManageCollaboratorPermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { IConfirmService, Menu, useObservable } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LockSingle } from '@univerjs/icons';
import { merge } from 'rxjs';
import { SheetMenuPosition } from '../../../controllers/menu/menu';
import { ISelectionRenderService } from '../../../services/selection/selection-render.service';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import styles from './index.module.less';
import type { IBaseSheetBarProps } from './SheetBarItem';
import { SheetBarItem } from './SheetBarItem';
import type { IScrollState } from './utils/slide-tab-bar';
import { SlideTabBar } from './utils/slide-tab-bar';

export interface ISheetBarTabsProps { }

export function SheetBarTabs() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [boxShadow, setBoxShadow] = useState('');
    const [visible, setVisible] = useState(false);
    const [offset, setOffset] = useState([0, 0]);
    const slideTabBarRef = useRef<{ slideTabBar: SlideTabBar | null }>({ slideTabBar: null });
    const slideTabBarContainerRef = useRef<HTMLDivElement>(null);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const localeService = useDependency(LocaleService);
    const confirmService = useDependency(IConfirmService);
    const selectionRenderService = useDependency(ISelectionRenderService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const resetOrder = useObservable(worksheetProtectionRuleModel.resetOrder$);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const permissionService = useDependency(IPermissionService);

    const statusInit = useCallback(() => {
        const currentSubUnitId = workbook.getActiveSheet().getSheetId();
        setActiveKey(currentSubUnitId);

        const sheets = workbook.getSheets();
        const activeSheet = workbook.getActiveSheet();
        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => {
                const worksheetRule = worksheetProtectionRuleModel.getRule(workbook.getUnitId(), sheet.getSheetId());
                const hasSelectionRule = rangeProtectionRuleModel.getSubunitRuleList(workbook.getUnitId(), sheet.getSheetId()).length > 0;
                const hasProtect = worksheetRule?.permissionId || hasSelectionRule;
                const name = hasProtect
                    ? (
                        <>
                            <LockSingle />
                            <span>{sheet.getName()}</span>
                        </>
                    )
                    : <span>{sheet.getName()}</span>;
                return {
                    sheetId: sheet.getSheetId(),
                    label: name,
                    index,
                    selected: activeSheet === sheet,
                    color: sheet.getTabColor() ?? undefined,
                };
            });
        setSheetList(sheetListItems);
    }, [workbook, worksheetProtectionRuleModel]);

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
    }, [resetOrder]);

    useEffect(() => {
        if (sheetList.length > 0) {
            setupSlideTabBarUpdate();
        }
    }, [sheetList]);

    useEffect(() => {
        const subscription = merge(
            worksheetProtectionRuleModel.ruleChange$,
            rangeProtectionRuleModel.ruleChange$
        ).subscribe(() => {
            statusInit();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [worksheetProtectionRuleModel, statusInit]);

    const setupSlideTabBarInit = () => {
        const slideTabBar = new SlideTabBar({
            slideTabBarClassName: styles.slideTabBar,
            slideTabBarItemActiveClassName: styles.slideTabActive,
            slideTabBarItemClassName: styles.slideTabItem,
            slideTabBarSpanEditClassName: styles.slideTabDivEdit,
            slideTabBarItemAutoSort: true,
            slideTabBarContainer: slideTabBarContainerRef.current,
            currentIndex: 0,
            onChangeName: (subUnitId: string, worksheetName: string) => {
                commandService.executeCommand(SetWorksheetNameCommand.id, {
                    subUnitId,
                    name: worksheetName,
                });
            },
            onSlideEnd: async (event: Event, order: number) => {
                const res = await commandService.executeCommand(SetWorksheetOrderCommand.id, { order });
            },
            onChangeTab: (event: MouseEvent, subUnitId: string) => {
                // Do not use SetWorksheetActivateCommand, otherwise the sheet will not be switched before the menu pops up, resulting in incorrect menu position.
                commandService
                    .executeCommand(SetWorksheetActiveOperation.id, {
                        subUnitId,
                        unitId: workbook.getUnitId(),
                    })
                    .then(() => {
                        // right click to show menu
                        if (event.button === 2) {
                            onVisibleChange(true);
                        }
                    });
            },
            onScroll: (state: IScrollState) => {
                sheetBarService.setScroll(state);
            },
            onNameCheckAlert: (text: string) => {
                return nameEmptyCheck(text) || nameRepeatCheck(text);
            },
            onNameChangeCheck: () => {
                const unitId = workbook.getUnitId();
                const worksheet = workbook?.getActiveSheet();
                const subUnitId = worksheet.getSheetId();
                const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                const selectionRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
                if (worksheetRule || selectionRule) {
                    return permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;
                } else {
                    return permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value ?? false;
                }
            },
        });

        slideTabBarRef.current.slideTabBar = slideTabBar;

        // FIXME@Dushusir: First time asynchronous rendering will cause flickering problems
        resizeInit(slideTabBar);

        return slideTabBar;
    };

    const nameEmptyCheck = (name: string) => {
        if (name.trim() === '') {
            const id = 'sheetNameEmptyAlert';
            confirmService.open({
                id,
                title: { title: localeService.t('sheetConfig.sheetNameErrorTitle') },
                children: { title: localeService.t('sheetConfig.sheetNameCannotIsEmptyError') },
                cancelText: localeService.t('button.cancel'),
                confirmText: localeService.t('button.confirm'),
                onClose() {
                    focusTabEditor();
                    confirmService.close(id);
                },
                onConfirm() {
                    focusTabEditor();
                    confirmService.close(id);
                },
            });

            return true;
        }
        return false;
    };

    const nameRepeatCheck = (name: string) => {
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const currenSheetName = worksheet.getName();
        // TODO@Dushusir: no need trigger save
        if (currenSheetName === name) return false;

        const checked = workbook.checkSheetName(name);

        if (checked) {
            const id = 'sheetNameRepeatAlert';
            confirmService.open({
                id,
                title: { title: localeService.t('sheetConfig.sheetNameErrorTitle') },
                children: { title: localeService.t('sheetConfig.sheetNameAlreadyExistsError') },
                cancelText: localeService.t('button.cancel'),
                confirmText: localeService.t('button.confirm'),
                onClose() {
                    confirmService.close(id);
                    focusTabEditor();
                },
                onConfirm() {
                    confirmService.close(id);
                    focusTabEditor();
                },
            });
        }

        return checked;
    };

    const focusTabEditor = () => {
        selectionRenderService.endSelection();

        // There is an asynchronous operation in endSelection, which will trigger blur immediately after focus, so it must be wrapped with setTimeout.
        setTimeout(() => {
            const activeSlideTab = slideTabBarRef.current.slideTabBar?.getActiveItem();
            if (activeSlideTab) {
                activeSlideTab.focus();
                activeSlideTab.selectAll();
            }
        }, 0);
    };

    const setTabEditor = () => {
        slideTabBarRef.current.slideTabBar?.getActiveItem()?.setEditor();
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
                case SetWorksheetActiveOperation.id:
                    statusInit();
                    break;
                default:
                    break;
            }
        });

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
            setTabEditor();
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

        // Create a ResizeObserver
        const observer = new ResizeObserver(() => {
            buttonScroll(slideTabBar);
        });

        // Start the observer
        observer.observe(slideTabBarContainer);
    };

    const onVisibleChange = (visible: boolean) => {
        if (editorBridgeService.isForceKeepVisible()) {
            return;
        }
        if (visible) {
            const { left: containerLeft } = slideTabBarContainerRef.current?.getBoundingClientRect() ?? {};
            // current active tab position
            const { left: activeTabLeft } =
                slideTabBarRef.current.slideTabBar?.getActiveItem()?.getSlideTabItem().getBoundingClientRect() ?? {};

            if (containerLeft !== undefined && activeTabLeft !== undefined) {
                setOffset([activeTabLeft - containerLeft, 0]);
            }
        }
        setVisible(visible);
    };

    return (
        <Dropdown
            className={styles.slideTabItemDropdown}
            visible={visible}
            align={{ offset }}
            trigger={['contextMenu']}
            overlay={(
                <Menu
                    menuType={SheetMenuPosition.SHEET_BAR}
                    onOptionSelect={(params) => {
                        const { label: commandId, value } = params;
                        commandService.executeCommand(commandId as string, { value, subUnitId: activeKey });
                        setVisible(false);
                    }}
                />
            )}
            onVisibleChange={onVisibleChange}
        >
            <div className={styles.slideTabBarContainer} ref={slideTabBarContainerRef}>
                <div className={styles.slideTabBar} style={{ boxShadow }}>
                    {sheetList.map((item) => (
                        <SheetBarItem {...item} key={item.sheetId} selected={activeKey === item.sheetId} />
                    ))}
                </div>
            </div>
        </Dropdown>
    );
}
