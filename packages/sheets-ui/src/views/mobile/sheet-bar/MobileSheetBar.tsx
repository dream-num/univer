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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import type { MouseEvent } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { IBaseSheetBarProps } from '../../sheet-bar/sheet-bar-tabs/SheetBarItem';
import { ICommandService, LocaleService, nameCharacterCheck } from '@univerjs/core';
import { borderBottomClassName, borderLeftClassName, borderRightClassName, clsx, Dialog, Input, resetButtonClassName, scrollbarClassName } from '@univerjs/design';
import { IncreaseIcon, MoreDownIcon } from '@univerjs/icons';
import {
    InsertSheetCommand,
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { useActiveWorkbook } from '../../hook';

export function MobileSheetBar() {
    const workbook = useActiveWorkbook();
    if (!workbook) {
        return null;
    }

    return <MobileSheetBarImpl workbook={workbook} />;
}

function MobileSheetBarImpl(props: { workbook: Workbook }) {
    const { workbook } = props;

    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [renameSheetId, setRenameSheetId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameError, setRenameError] = useState('');
    const [unhideVisible, setUnhideVisible] = useState(false);
    const tabMapRef = useRef<Map<string, HTMLElement | null>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    const commandService = useDependency(ICommandService);
    const contextMenuService = useDependency(IContextMenuService);
    const localeService = useDependency(LocaleService);
    const sheetBarService = useDependency(ISheetBarService);

    const updateSheetItems = useCallback(() => {
        const currentSubUnitId = workbook.getActiveSheet()!.getSheetId();
        const sheets = workbook.getSheets();
        const activeSheet = workbook.getActiveSheet();
        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => {
                return {
                    sheetId: sheet.getSheetId(),
                    label: sheet.getName(),
                    index,
                    selected: activeSheet === sheet,
                    color: sheet.getTabColor() ?? undefined,
                };
            });

        setSheetList(sheetListItems);
        setActiveKey(currentSubUnitId);

        if (tabMapRef.current.has(currentSubUnitId)) {
            const element = tabMapRef.current.get(currentSubUnitId);
            if (element && containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const elementWidth = element.clientWidth;
                const elementLeft = element.offsetLeft;
                const scrollLeft = elementLeft - (containerWidth - elementWidth) / 2;
                containerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
            }
        }

        tabMapRef.current.clear();
    }, [workbook]);

    useEffect(() => updateSheetItems(), [updateSheetItems]);

    useEffect(() => {
        const subscription = sheetBarService.renameId$.subscribe((sheetId) => {
            const sheet = workbook.getSheetBySheetId(sheetId);
            if (!sheet) return;

            setRenameSheetId(sheetId);
            setRenameValue(sheet.getName());
            setRenameError('');
        });

        return () => subscription.unsubscribe();
    }, [sheetBarService, workbook]);

    useEffect(() => {
        const disposable = sheetBarService.registerSheetBarMenuHandler({
            handleSheetBarMenu: () => setUnhideVisible(true),
        });
        return () => disposable.dispose();
    }, [sheetBarService]);

    const handleClick = useCallback((sheetId: string) => {
        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: sheetId,
        });
    }, [commandService, workbook]);

    const openSheetMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        contextMenuService.triggerContextMenu(event, ContextMenuPosition.FOOTER_TABS, {
            unitId: workbook.getUnitId(),
            subUnitId: workbook.getActiveSheet()?.getSheetId(),
        });
    }, [contextMenuService, workbook]);

    const addSheet = useCallback(() => {
        commandService.executeCommand(InsertSheetCommand.id, { unitId: workbook.getUnitId() });
    }, [commandService, workbook]);

    const confirmRename = useCallback(() => {
        if (!renameSheetId) return;

        const name = renameValue.trim();
        if (!name) {
            setRenameError(localeService.t<LocaleKey>('sheets-ui.sheetConfig.sheetNameCannotIsEmptyError'));
            return;
        }
        if (!nameCharacterCheck(name)) {
            setRenameError(localeService.t<LocaleKey>('sheets-ui.sheetConfig.sheetNameSpecCharError'));
            return;
        }
        if (workbook.getSheets().some((sheet) => sheet.getSheetId() !== renameSheetId && sheet.getName() === name)) {
            setRenameError(localeService.t<LocaleKey>('sheets-ui.sheetConfig.sheetNameAlreadyExistsError'));
            return;
        }

        commandService.executeCommand(SetWorksheetNameCommand.id, {
            unitId: workbook.getUnitId(),
            subUnitId: renameSheetId,
            name,
        });
        setRenameSheetId(null);
    }, [commandService, localeService, renameSheetId, renameValue, workbook]);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
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

        return () => disposable.dispose();
    }, [commandService, updateSheetItems]);

    return (
        <>
            <div
                className="
                  univer-flex univer-h-10 univer-w-full univer-bg-gray-50
                  dark:!univer-bg-gray-900
                "
            >
                <div
                    ref={containerRef}
                    className={clsx(
                        `
                          univer-h-10 univer-min-w-0 univer-flex-1 univer-overflow-x-auto univer-overflow-y-hidden
                          univer-border-b univer-border-gray-200
                          dark:!univer-border-gray-700
                        `,
                        scrollbarClassName
                    )}
                    role="tablist"
                    aria-label={localeService.t<LocaleKey>('sheets-ui.sheetConfig.sheetTabs')}
                >
                    <div className="univer-flex univer-h-full univer-flex-nowrap univer-items-center">
                        {sheetList.map((sheet) => (
                            <div
                                ref={(element) => {
                                    tabMapRef.current.set(sheet.sheetId!, element);
                                }}
                                className={clsx(`
                                  univer-relative univer-box-border univer-flex univer-h-full univer-max-w-36
                                  univer-shrink-0 univer-cursor-pointer univer-select-none univer-items-center
                                  univer-justify-center univer-truncate univer-px-1 univer-py-0.5 univer-text-sm
                                  univer-font-medium univer-leading-6 univer-transition-all
                                `, borderRightClassName, {
                                    'univer-bg-gray-0 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-400': sheet.sheetId === activeKey,
                                    'univer-text-gray-600 hover:univer-bg-gray-50 active:univer-bg-gray-100 dark:!univer-text-gray-300 dark:hover:!univer-bg-gray-700': sheet.sheetId !== activeKey,
                                })}
                                key={sheet.sheetId}
                                role="tab"
                                aria-selected={sheet.sheetId === activeKey}
                                aria-controls={`sheet-${sheet.sheetId}`}
                                tabIndex={sheet.sheetId === activeKey ? 0 : -1}
                                onClick={() => handleClick(sheet.sheetId!)}
                            >
                                {/* Sheet Label */}
                                <span className="univer-truncate">{sheet.label}</span>
                                {sheet.sheetId === activeKey && (
                                    <button
                                        type="button"
                                        aria-label={localeService.t<LocaleKey>('sheets-ui.mobile.sheetMenu')}
                                        className={clsx(resetButtonClassName, `
                                          univer-ml-0.5 univer-flex univer-size-7 univer-shrink-0 univer-items-center
                                          univer-justify-center univer-rounded-md univer-text-xs univer-text-primary-600
                                          active:univer-bg-gray-100
                                          dark:!univer-text-primary-400
                                          dark:active:!univer-bg-gray-600
                                        `)}
                                        onClick={openSheetMenu}
                                    >
                                        <MoreDownIcon />
                                    </button>
                                )}

                                {/* Active Indicator */}
                                {sheet.sheetId === activeKey && (
                                    <div
                                        className={clsx(`
                                          univer-absolute univer-left-0 univer-right-0 univer-top-0 univer-h-1
                                          univer-bg-primary-600 univer-transition-all
                                          dark:!univer-bg-primary-400
                                        `
                                        )}
                                        style={sheet.color
                                            ? { backgroundColor: sheet.color }
                                            : undefined}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('sheets-ui.mobile.addSheet')}
                    className={clsx(resetButtonClassName, borderLeftClassName, `
                      univer-flex univer-h-10 univer-w-12 univer-shrink-0 univer-items-center univer-justify-center
                      univer-bg-gray-100 univer-text-lg univer-text-gray-800
                      active:univer-bg-gray-200
                      dark:!univer-bg-gray-800 dark:!univer-text-gray-100
                      dark:active:!univer-bg-gray-700
                    `)}
                    onClick={addSheet}
                >
                    <IncreaseIcon />
                </button>
            </div>
            <Dialog
                open={Boolean(renameSheetId)}
                title={localeService.t<LocaleKey>('sheets-ui.sheetConfig.rename')}
                showCancel
                showOk
                onCancel={() => setRenameSheetId(null)}
                onOk={confirmRename}
                onOpenChange={(open) => {
                    if (!open) setRenameSheetId(null);
                }}
            >
                <div className="univer-grid univer-gap-2">
                    <Input
                        autoFocus
                        size="large"
                        value={renameValue}
                        onChange={(value) => {
                            setRenameValue(value);
                            setRenameError('');
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') confirmRename();
                        }}
                    />
                    {renameError && (
                        <div
                            className="
                              univer-text-sm univer-text-red-600
                              dark:!univer-text-red-400
                            "
                        >
                            {renameError}
                        </div>
                    )}
                </div>
            </Dialog>
            <Dialog
                open={unhideVisible}
                title={localeService.t<LocaleKey>('sheets-ui.sheetConfig.unhide')}
                footer={null}
                onOpenChange={setUnhideVisible}
            >
                <div
                    className="
                      univer-grid univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                      dark:!univer-bg-gray-800
                    "
                >
                    {workbook.getHiddenWorksheets().map((sheetId) => (
                        <button
                            key={sheetId}
                            type="button"
                            className={clsx(resetButtonClassName, borderBottomClassName, `
                              univer-flex univer-min-h-12 univer-w-full univer-items-center univer-px-4 univer-py-2
                              univer-text-left univer-text-base univer-font-medium univer-text-gray-900
                              active:univer-bg-gray-100
                              dark:!univer-text-gray-100
                              dark:active:!univer-bg-gray-700
                            `)}
                            onClick={() => {
                                commandService.executeCommand(SetWorksheetShowCommand.id, {
                                    unitId: workbook.getUnitId(),
                                    subUnitId: sheetId,
                                });
                                setUnhideVisible(false);
                            }}
                        >
                            {workbook.getSheetBySheetId(sheetId)?.getName()}
                        </button>
                    ))}
                </div>
            </Dialog>
        </>
    );
}
