/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICommandInfo } from '@univerjs/core';
import type { IUniverUIConfig } from '@univerjs/ui';
import type { IBaseSheetBarProps } from './SheetBarItem';
import type { IScrollState } from './utils/slide-tab-bar';
import { ICommandService, IPermissionService, LocaleService, nameCharacterCheck, Quantity } from '@univerjs/core';
import { DropdownLegacy } from '@univerjs/design';
import { LockSingle } from '@univerjs/icons';

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
    WorkbookManageCollaboratorPermission,
    WorkbookRenameSheetPermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { ContextMenuPosition, IConfirmService, UI_PLUGIN_CONFIG_KEY, UIMenu, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { merge } from 'rxjs';
import { useActiveWorkbook } from '../../../components/hook';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarItem } from './SheetBarItem';
import { SlideTabBar } from './utils/slide-tab-bar';

export function SheetBarTabs() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [boxShadow, setBoxShadow] = useState('');
    const [visible, setVisible] = useState(false);
    const [offset, setOffset] = useState([0, 0]);
    const slideTabBarRef = useRef<{ slideTabBar: SlideTabBar | null }>({ slideTabBar: null });
    const slideTabBarContainerRef = useRef<HTMLDivElement>(null);

    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const localeService = useDependency(LocaleService);
    const confirmService = useDependency(IConfirmService);
    const editorBridgeService = useDependency(IEditorBridgeService, Quantity.OPTIONAL);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const resetOrder = useObservable(worksheetProtectionRuleModel.resetOrder$);

    const workbook = useActiveWorkbook()!;
    const permissionService = useDependency(IPermissionService);

    const updateSheetItems = useCallback(() => {
        const currentSubUnitId = workbook.getActiveSheet()?.getSheetId() || '';
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
                            <span className="univer-outline-none">{sheet.getName()}</span>
                        </>
                    )
                    : <span className="univer-outline-none">{sheet.getName()}</span>;

                return {
                    sheetId: sheet.getSheetId(),
                    label: name,
                    index,
                    selected: activeSheet === sheet,
                    color: sheet.getTabColor() ?? undefined,
                };
            });

        setSheetList(sheetListItems);
        setActiveKey(currentSubUnitId);
    }, [rangeProtectionRuleModel, workbook, worksheetProtectionRuleModel]);

    useEffect(() => {
        updateSheetItems();
        const { slideTabBar, disconnectResizeObserver } = setupSlideTabBarInit();
        const disposable = setupStatusUpdate();
        const subscribeList = [
            setupSubscribeScroll(),
            setupSubscribeScrollX(),
            setupSubscribeRenameId(),
            // When adding a sheet, it no longer slides, which has been uniformly handled in setupSlideTabBarUpdate
        ];

        return () => {
            disposable.dispose();
            slideTabBar.destroy();
            subscribeList.forEach((subscribe) => subscribe.unsubscribe());
            disconnectResizeObserver && disconnectResizeObserver();
        };
    }, [resetOrder, workbook]);

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
            updateSheetItems();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [worksheetProtectionRuleModel, updateSheetItems]);

    const setupSlideTabBarInit = () => {
        const slideTabBar = new SlideTabBar({
            slideTabBarSelector: '[data-u-comp=slide-tab-bar]',
            slideTabBarItemSelector: '[data-u-comp=slide-tab-item]',
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
                return nameEmptyCheck(text) || sheetNameSpecCharCheck(text) || nameRepeatCheck(text);
            },
            onNameChangeCheck: () => {
                const unitId = workbook.getUnitId();
                const worksheet = workbook?.getActiveSheet();
                if (!worksheet) {
                    throw new Error('No active sheet found');
                }

                const subUnitId = worksheet.getSheetId();
                const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                const selectionRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
                if (worksheetRule || selectionRule) {
                    return permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;
                } else {
                    return permissionService.getPermissionPoint(new WorkbookRenameSheetPermission(unitId).id)?.value ?? false;
                }
            },
        });

        slideTabBarRef.current.slideTabBar = slideTabBar;

        // FIXME@Dushusir: First time asynchronous rendering will cause flickering problems
        const disconnectResizeObserver = resizeInit(slideTabBar);

        return { slideTabBar, disconnectResizeObserver };
    };

    const config = useConfigValue<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
    const showContextMenu = config?.contextMenu ?? true;

    // TODO@Dushusir: the following callback functions should be wrapped by `useCallback`.

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

    const sheetNameSpecCharCheck = (name: string) => {
        if (!nameCharacterCheck(name)) {
            const id = 'sheetNameSpecCharAlert';
            confirmService.open({
                id,
                title: { title: localeService.t('sheetConfig.sheetNameErrorTitle') },
                children: { title: localeService.t('sheetConfig.sheetNameSpecCharError') },
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
        const worksheet = workbook.getActiveSheet();
        const currenSheetName = worksheet?.getName();
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
        // FIXME@Dushusir: too strongly coupled
        // selectionRenderService.endSelection();

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
                    updateSheetItems();
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
        // If the active sheet needs to display the statistics column, it will trigger a resize, which will cover the activeTabItem. You need to slide a little distance to display the active tab.
        const scrollX = slideTabBar.calculateActiveTabItemScrollX();
        if (scrollX) {
            const scrollBar = slideTabBar.getScrollbar();
            scrollBar.scrollX(scrollBar.getScrollX() + scrollX);
        }

        sheetBarService.setScroll({
            leftEnd: slideTabBar.isLeftEnd(),
            rightEnd: slideTabBar.isRightEnd(),
        });
    };

    const resizeInit = (slideTabBar: SlideTabBar) => {
        // Target element
        const slideTabBarContainer = slideTabBarContainerRef.current?.querySelector('[data-u-comp=slide-tab-bar]');
        if (!slideTabBarContainer) return;

        // Create a ResizeObserver
        const observer = new ResizeObserver(() => {
            buttonScroll(slideTabBar);
        });

        // Start the observer
        observer.observe(slideTabBarContainer);

        // Return the cleanup function that disconnects the observer
        return () => observer.disconnect();
    };

    const onVisibleChange = (visible: boolean) => {
        if (!showContextMenu) return;

        if (editorBridgeService?.isForceKeepVisible()) {
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
        <DropdownLegacy
            className="univer-select-none"
            visible={visible}
            align={{ offset }}
            trigger={['contextMenu']}
            overlay={(
                <UIMenu
                    menuType={ContextMenuPosition.FOOTER_TABS}
                    onOptionSelect={(params) => {
                        const { label: id, value, commandId } = params;
                        commandService.executeCommand(commandId ?? id as string, { value, subUnitId: activeKey });
                        setVisible(false);
                    }}
                />
            )}
            onVisibleChange={onVisibleChange}
        >
            <div
                className="univer-max-w-[calc(100%-112px)] univer-overflow-hidden"
                ref={slideTabBarContainerRef}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div
                    data-u-comp="slide-tab-bar"
                    className={`
                      univer-flex univer-select-none univer-flex-row univer-items-center univer-overflow-hidden
                      univer-px-1.5 univer-py-1
                    `}
                    style={{ boxShadow }}
                >
                    {sheetList.map((item) => (
                        <SheetBarItem {...item} key={item.sheetId} selected={activeKey === item.sheetId} />
                    ))}
                </div>
            </div>
        </DropdownLegacy>
    );
}
