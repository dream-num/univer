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
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { IBaseSheetBarProps } from './SheetBarItem';
import type { IScrollState } from './utils/slide-tab-bar';
import {
    ICommandService,
    IConfirmService,
    IPermissionService,
    LocaleService,
    nameCharacterCheck,
    Quantity,
} from '@univerjs/core';
import { LockIcon } from '@univerjs/icons';
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
import { UI_PLUGIN_CONFIG_KEY, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { merge } from 'rxjs';
import { useActiveWorkbook } from '../../../components/hook';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarItem } from './SheetBarItem';
import { SheetBarTabsContextMenu } from './SheetBarTabsContextMenu';
import { SlideTabBar } from './utils/slide-tab-bar';

const SCROLL_SHADOW_NONE = '';
const SCROLL_SHADOW_LEFT = 'inset 10px 0px 10px -10px rgba(0, 0, 0, 0.2)';
const SCROLL_SHADOW_RIGHT = 'inset -10px 0px 10px -10px rgba(0, 0, 0, 0.2)';
const SCROLL_SHADOW_BOTH = 'inset 10px 0px 10px -10px rgba(0, 0, 0, 0.2), inset -10px 0px 10px -10px rgba(0, 0, 0, 0.2)';

interface IContextMenuAnchorRect {
    left: number;
    top: number;
    bottom: number;
}

function getScrollShadow(state: IScrollState) {
    const { leftEnd, rightEnd } = state;

    if (leftEnd && rightEnd) {
        return SCROLL_SHADOW_NONE;
    }

    if (leftEnd) {
        return SCROLL_SHADOW_RIGHT;
    }

    if (rightEnd) {
        return SCROLL_SHADOW_LEFT;
    }

    return SCROLL_SHADOW_BOTH;
}

function shouldRefreshSheetTabs(commandInfo: ICommandInfo) {
    switch (commandInfo.id) {
        case SetTabColorMutation.id:
        case SetWorksheetHideMutation.id:
        case RemoveSheetMutation.id:
        case SetWorksheetNameMutation.id:
        case InsertSheetMutation.id:
        case SetWorksheetOrderMutation.id:
        case SetWorksheetActiveOperation.id:
            return true;
        default:
            return false;
    }
}

export function SheetBarTabs() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeSheetId, setActiveSheetId] = useState('');
    const [scrollShadow, setScrollShadow] = useState('');
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuAnchorRect, setContextMenuAnchorRect] = useState<IContextMenuAnchorRect | null>(null);

    const slideTabBarRef = useRef<SlideTabBar | null>(null);
    const slideTabBarContainerRef = useRef<HTMLDivElement>(null);

    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const localeService = useDependency(LocaleService);
    const confirmService = useDependency(IConfirmService);
    const editorBridgeService = useDependency(IEditorBridgeService, Quantity.OPTIONAL);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const permissionService = useDependency(IPermissionService);

    const workbook = useActiveWorkbook()!;
    const resetOrder = useObservable(worksheetProtectionRuleModel.resetOrder$);
    const config = useConfigValue<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
    const showContextMenu = config?.contextMenu ?? true;

    const getActiveTabRect = useCallback((): IContextMenuAnchorRect | null => {
        const activeTabRect = slideTabBarRef.current?.getActiveItem()?.getSlideTabItem().getBoundingClientRect();
        if (!activeTabRect) {
            return null;
        }

        return {
            left: activeTabRect.left,
            top: activeTabRect.top,
            bottom: activeTabRect.bottom,
        };
    }, []);

    const focusTabEditor = useCallback(() => {
        // There is an asynchronous operation in endSelection, which will trigger blur immediately after focus,
        // so it must be wrapped with setTimeout.
        setTimeout(() => {
            const activeSlideTab = slideTabBarRef.current?.getActiveItem();
            if (!activeSlideTab) {
                return;
            }

            activeSlideTab.focus();
            activeSlideTab.selectAll();
        }, 0);
    }, []);

    const openSheetNameErrorDialog = useCallback((id: string, description: string) => {
        confirmService.open({
            id,
            title: { title: localeService.t('sheetConfig.sheetNameErrorTitle') },
            children: { title: description },
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
    }, [confirmService, focusTabEditor, localeService]);

    const nameEmptyCheck = useCallback((name: string) => {
        if (name.trim() !== '') {
            return false;
        }

        openSheetNameErrorDialog('sheetNameEmptyAlert', localeService.t('sheetConfig.sheetNameCannotIsEmptyError'));
        return true;
    }, [localeService, openSheetNameErrorDialog]);

    const sheetNameSpecCharCheck = useCallback((name: string) => {
        if (nameCharacterCheck(name)) {
            return false;
        }

        openSheetNameErrorDialog('sheetNameSpecCharAlert', localeService.t('sheetConfig.sheetNameSpecCharError'));
        return true;
    }, [localeService, openSheetNameErrorDialog]);

    const nameRepeatCheck = useCallback((name: string) => {
        const currentSheetName = workbook.getActiveSheet()?.getName();
        if (currentSheetName === name) {
            return false;
        }

        const checked = workbook.checkSheetName(name);
        if (!checked) {
            return false;
        }

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

        return true;
    }, [confirmService, focusTabEditor, localeService, workbook]);

    const canRenameActiveSheet = useCallback(() => {
        const unitId = workbook.getUnitId();
        const activeSheet = workbook.getActiveSheet();
        if (!activeSheet) {
            return false;
        }

        const subUnitId = activeSheet.getSheetId();
        const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
        const hasSelectionRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;

        if (worksheetRule || hasSelectionRule) {
            return permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;
        }

        return permissionService.getPermissionPoint(new WorkbookRenameSheetPermission(unitId).id)?.value ?? false;
    }, [permissionService, rangeProtectionRuleModel, workbook, worksheetProtectionRuleModel]);

    const updateSheetItems = useCallback(() => {
        const activeSheet = workbook.getActiveSheet();
        const currentSubUnitId = activeSheet?.getSheetId() ?? '';

        const sheetListItems = workbook
            .getSheets()
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => {
                const worksheetRule = worksheetProtectionRuleModel.getRule(workbook.getUnitId(), sheet.getSheetId());
                const hasSelectionRule = rangeProtectionRuleModel.getSubunitRuleList(workbook.getUnitId(), sheet.getSheetId()).length > 0;
                const hasProtection = Boolean(worksheetRule?.permissionId || hasSelectionRule);

                return {
                    sheetId: sheet.getSheetId(),
                    label: hasProtection
                        ? (
                            <>
                                <LockIcon className="univer-shrink-0" />
                                <span className="univer-truncate univer-outline-none">{sheet.getName()}</span>
                            </>
                        )
                        : <span className="univer-truncate univer-outline-none">{sheet.getName()}</span>,
                    index,
                    selected: activeSheet === sheet,
                    color: sheet.getTabColor() ?? undefined,
                } satisfies IBaseSheetBarProps;
            });

        setSheetList(sheetListItems);
        setActiveSheetId(currentSubUnitId);
    }, [rangeProtectionRuleModel, workbook, worksheetProtectionRuleModel]);

    const setTabEditor = useCallback(() => {
        slideTabBarRef.current?.getActiveItem()?.setEditor();
    }, []);

    const syncScrollState = useCallback((state: IScrollState) => {
        setScrollShadow(getScrollShadow(state));
    }, []);

    const syncScrollButtonState = useCallback((slideTabBar: SlideTabBar) => {
        const scrollX = slideTabBar.calculateActiveTabItemScrollX();
        if (scrollX) {
            const scrollbar = slideTabBar.getScrollbar();
            scrollbar.scrollX(scrollbar.getScrollX() + scrollX);
        }

        sheetBarService.setScroll({
            leftEnd: slideTabBar.isLeftEnd(),
            rightEnd: slideTabBar.isRightEnd(),
        });
    }, [sheetBarService]);

    const observeResize = useCallback((slideTabBar: SlideTabBar) => {
        const slideTabBarContainer = slideTabBarContainerRef.current?.querySelector('[data-u-comp=slide-tab-bar]');
        if (!slideTabBarContainer) {
            return undefined;
        }

        const observer = new ResizeObserver(() => {
            syncScrollButtonState(slideTabBar);
        });

        observer.observe(slideTabBarContainer);
        return () => observer.disconnect();
    }, [syncScrollButtonState]);

    const openContextMenu = useCallback((anchorRect: IContextMenuAnchorRect) => {
        if (!showContextMenu) {
            return;
        }

        if (editorBridgeService?.isForceKeepVisible()) {
            return;
        }

        setContextMenuAnchorRect(anchorRect);
        setContextMenuVisible(true);
    }, [editorBridgeService, showContextMenu]);

    const onContextMenuVisibleChange = useCallback((visible: boolean) => {
        if (!visible) {
            setContextMenuVisible(false);
            return;
        }

        const activeTabRect = getActiveTabRect();
        if (!activeTabRect) {
            return;
        }

        openContextMenu(activeTabRect);
    }, [getActiveTabRect, openContextMenu]);

    const onContextMenuCommandSelect = useCallback((commandId: string, value?: string | number) => {
        commandService.executeCommand(commandId, {
            value,
            subUnitId: activeSheetId,
        });
        setContextMenuVisible(false);
    }, [activeSheetId, commandService]);

    useEffect(() => {
        if (!contextMenuVisible) {
            return;
        }

        const handleResize = () => {
            const activeTabRect = getActiveTabRect();
            if (!activeTabRect) {
                return;
            }

            setContextMenuAnchorRect(activeTabRect);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [contextMenuVisible, getActiveTabRect]);

    const onTabListContextMenu = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        const triggerItem = (event.target as HTMLElement).closest<HTMLElement>('[data-u-comp=slide-tab-item]');
        const targetSheetId = triggerItem?.dataset.id;

        if (!targetSheetId || !triggerItem) {
            return;
        }

        const triggerRect = triggerItem.getBoundingClientRect();
        const anchorRect = {
            left: triggerRect.left,
            top: triggerRect.top,
            bottom: triggerRect.bottom,
        };

        if (targetSheetId === activeSheetId) {
            openContextMenu(anchorRect);
            return;
        }

        commandService
            .executeCommand(SetWorksheetActiveOperation.id, {
                unitId: workbook.getUnitId(),
                subUnitId: targetSheetId,
            })
            .finally(() => {
                openContextMenu(anchorRect);
            });
    }, [activeSheetId, commandService, openContextMenu, workbook]);

    const onTabListKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('[contenteditable=true]')) {
            return;
        }

        const currentTab = target.closest<HTMLElement>('[data-u-comp=slide-tab-item]');
        const currentSheetId = currentTab?.dataset.id;
        if (!currentSheetId) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: workbook.getUnitId(),
                subUnitId: currentSheetId,
            });
            return;
        }

        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }

        const tabItems = Array.from(
            slideTabBarContainerRef.current?.querySelectorAll<HTMLElement>('[data-u-comp=slide-tab-item]') ?? []
        );
        const currentIndex = tabItems.findIndex((tabItem) => tabItem.dataset.id === currentSheetId);
        if (currentIndex < 0) {
            return;
        }

        event.preventDefault();

        const nextIndex = event.key === 'ArrowRight'
            ? Math.min(tabItems.length - 1, currentIndex + 1)
            : Math.max(0, currentIndex - 1);
        const nextTab = tabItems[nextIndex];
        const nextSheetId = nextTab?.dataset.id;
        if (!nextTab || !nextSheetId) {
            return;
        }

        nextTab.focus();
        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: nextSheetId,
        });
    }, [commandService, workbook]);

    const initializeSlideTabBar = useCallback(() => {
        const slideTabBar = new SlideTabBar({
            slideTabBarSelector: '[data-u-comp=slide-tab-bar]',
            slideTabBarItemSelector: '[data-u-comp=slide-tab-item]',
            slideTabBarItemAutoSort: true,
            slideTabBarContainer: slideTabBarContainerRef.current,
            currentIndex: 0,
            onChangeName: (subUnitId: string, worksheetName: string) => {
                if (workbook.getSheetBySheetId(subUnitId)?.getName() === worksheetName) {
                    updateSheetItems();
                    return;
                }

                commandService.executeCommand(SetWorksheetNameCommand.id, {
                    subUnitId,
                    name: worksheetName,
                });
            },
            onSlideEnd: async (event: Event, order: number) => {
                await commandService.executeCommand(SetWorksheetOrderCommand.id, { order });
            },
            onChangeTab: (_event: MouseEvent, subUnitId: string) => {
                // Do not use SetWorksheetActivateCommand, otherwise activation timing may be incorrect.
                void commandService
                    .executeCommand(SetWorksheetActiveOperation.id, {
                        subUnitId,
                        unitId: workbook.getUnitId(),
                    });
            },
            onScroll: (state: IScrollState) => {
                sheetBarService.setScroll(state);
            },
            onNameCheckAlert: (name: string) => {
                return nameEmptyCheck(name) || sheetNameSpecCharCheck(name) || nameRepeatCheck(name);
            },
            onNameChangeCheck: canRenameActiveSheet,
        });

        slideTabBarRef.current = slideTabBar;

        return {
            slideTabBar,
            disconnectResizeObserver: observeResize(slideTabBar),
        };
    }, [
        canRenameActiveSheet,
        commandService,
        getActiveTabRect,
        nameEmptyCheck,
        nameRepeatCheck,
        observeResize,
        openContextMenu,
        sheetBarService,
        sheetNameSpecCharCheck,
        updateSheetItems,
        workbook,
    ]);

    useEffect(() => {
        updateSheetItems();

        const { slideTabBar, disconnectResizeObserver } = initializeSlideTabBar();
        const commandDisposable = commandService.onCommandExecuted((commandInfo) => {
            if (shouldRefreshSheetTabs(commandInfo)) {
                updateSheetItems();
            }
        });

        const scrollSubscription = sheetBarService.scroll$.subscribe(syncScrollState);
        const scrollXSubscription = sheetBarService.scrollX$.subscribe((x: number) => {
            slideTabBarRef.current?.flipPage(x);
        });
        const renameSubscription = sheetBarService.renameId$.subscribe(() => {
            setTabEditor();
        });

        return () => {
            commandDisposable.dispose();
            slideTabBar.destroy();
            slideTabBarRef.current = null;
            scrollSubscription.unsubscribe();
            scrollXSubscription.unsubscribe();
            renameSubscription.unsubscribe();
            disconnectResizeObserver?.();
        };
    }, [commandService, initializeSlideTabBar, resetOrder, setTabEditor, sheetBarService, syncScrollState, updateSheetItems, workbook]);

    useEffect(() => {
        if (!sheetList.length) {
            return;
        }

        const currentIndex = sheetList.findIndex((item) => item.sheetId === activeSheetId);
        slideTabBarRef.current?.update(currentIndex >= 0 ? currentIndex : 0);
    }, [activeSheetId, sheetList]);

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
    }, [rangeProtectionRuleModel, updateSheetItems, worksheetProtectionRuleModel]);

    useEffect(() => {
        if (!showContextMenu && contextMenuVisible) {
            setContextMenuVisible(false);
        }
    }, [contextMenuVisible, showContextMenu]);

    return (
        <SheetBarTabsContextMenu
            showContextMenu={showContextMenu}
            visible={contextMenuVisible}
            anchorRect={contextMenuAnchorRect}
            onVisibleChange={onContextMenuVisibleChange}
            onCommandSelect={onContextMenuCommandSelect}
        >
            <div
                className="univer-max-w-[calc(100%-112px)] univer-overflow-hidden"
                ref={slideTabBarContainerRef}
                onDragStart={(event) => event.preventDefault()}
                onContextMenu={onTabListContextMenu}
            >
                <div
                    data-u-comp="slide-tab-bar"
                    role="tablist"
                    aria-label="Sheet tabs"
                    onKeyDown={onTabListKeyDown}
                    className={`
                      univer-flex univer-select-none univer-flex-row univer-items-center univer-overflow-hidden
                      univer-px-1.5 univer-py-1
                    `}
                    style={{ boxShadow: scrollShadow }}
                >
                    {sheetList.map((item) => (
                        <SheetBarItem
                            key={item.sheetId}
                            {...item}
                            selected={activeSheetId === item.sheetId}
                        />
                    ))}
                </div>
            </div>
        </SheetBarTabsContextMenu>
    );
}
