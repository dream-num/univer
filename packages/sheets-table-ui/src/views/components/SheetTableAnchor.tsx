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

import type { IUniverSheetsTableUIConfig } from '../../controllers/config.schema';
import { cellToRange, ICommandService, IConfigService, Injector, IUniverInstanceService, LocaleService, Rectangle } from '@univerjs/core';
import { borderClassName, clsx, Dropdown, Input } from '@univerjs/design';
import { DeleteSingle, GridOutlineSingle, MoreDownSingle, PaintBucket, RenameSingle } from '@univerjs/icons';
import { getSheetCommandTarget, SheetRangeThemeModel, SheetsSelectionsService, WorkbookPermissionService } from '@univerjs/sheets';
import { DeleteSheetTableCommand, SetSheetTableCommand, TableManager } from '@univerjs/sheets-table';
import { ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { openRangeSelector } from '../../commands/operations/open-table-selector.operation';
import { SHEET_TABLE_THEME_PANEL, SHEET_TABLE_THEME_PANEL_ID } from '../../const';
import { SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { SheetTableAnchorController } from '../../controllers/sheet-table-anchor.controller';
import { SheetTableThemeUIController } from '../../controllers/sheet-table-theme-ui.controller';

export const SheetTableAnchor = () => {
    const [inputFocusId, setInputFocusId] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const sidebarService = useDependency(ISidebarService);
    const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
    const injector = useDependency(Injector);
    const sheetTableAnchor = useDependency(SheetTableAnchorController);
    const anchorPosition = useObservable(sheetTableAnchor.anchorPosition$);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbookPermissionService = useDependency(WorkbookPermissionService);
    const workbookPermissionInitState = useObservable(workbookPermissionService.unitPermissionInitStateChange$, false);
    const tableManager = useDependency(TableManager);
    const rangeThemeModel = useDependency(SheetRangeThemeModel);
    const sheetTableThemeUIController = useDependency(SheetTableThemeUIController);
    const tableRefresh$ = useObservable(sheetTableThemeUIController.refreshTable$);
    const localeService = useDependency(LocaleService);
    const sheetsSelectionService = useDependency(SheetsSelectionsService);
    const selections = useObservable(sheetsSelectionService.selectionChanged$, [{ range: cellToRange(0, 0), primary: null }]);

    const [, setRefresh] = useState(Math.random());
    const configService = useDependency(IConfigService);
    const tableConfig = configService.getConfig<IUniverSheetsTableUIConfig>(SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY);
    const anchorHeight = tableConfig?.anchorHeight ?? 24;
    const anchorBackgroundColor = tableConfig?.anchorBackgroundColor ?? 'rgb(53,91,183)';

    const updateOpenState = (tableId: string, isOpen: boolean) => {
        setOpenStates((prev) => ({
            ...prev,
            [tableId]: isOpen,
        }));
    };

    useEffect(() => {
        setRefresh(Math.random());
    }, [tableRefresh$]);

    if (!anchorPosition?.length) {
        return null;
    }

    const target = getSheetCommandTarget(univerInstanceService);

    if (!target) return null;

    const { unitId, subUnitId } = target;

    const handleChangeTableName = (tableId: string, name: string) => {
        const originName = tableManager.getTableById(unitId, tableId)?.getDisplayName();
        if (originName === name) {
            setInputFocusId('');
            setInputValue('');
            return;
        }
        commandService.executeCommand(SetSheetTableCommand.id, {
            tableId,
            unitId,
            name,
        });
        setInputValue('');
        setInputFocusId('');
    };

    const handleChangeRange = async (tableId: string) => {
        const table = tableManager.getTableById(unitId, tableId);
        if (!table) return;
        const range = table.getRange();
        const selection = await openRangeSelector(injector, unitId, subUnitId, range, tableId);
        if (!selection) return;
        commandService.executeCommand(SetSheetTableCommand.id, {
            tableId,
            unitId,
            updateRange: {
                newRange: selection.range,
            },
        });
    };

    if (!workbookPermissionInitState) {
        return null;
    }

    return (
        <div
            className="univer-absolute univer-z-50 univer-h-0 univer-w-0"
            style={{
            }}
        >
            {anchorPosition.map((item) => {
                const table = tableManager.getTableById(unitId, item.tableId);
                if (!table) return null;
                const rangeTheme = rangeThemeModel.getRangeThemeStyle(unitId, table.getTableStyleId());
                const headerBgColor = rangeTheme?.getHeaderRowStyle()?.bg?.rgb ?? anchorBackgroundColor;
                const headerCl = rangeTheme?.getHeaderRowStyle()?.cl?.rgb ?? 'rgb(255, 255, 255)';
                const headerTextColor = headerCl;
                const tableRange = table.getRange();

                if (!selections?.length) {
                    return null;
                }

                const lastSelection = selections[selections.length - 1];
                const lastRange = lastSelection.range;

                const overlap = Rectangle.intersects(tableRange, lastRange);
                const shouldHidden = !overlap && item.y <= 20;

                return (
                    <div
                        key={item.tableId}
                        className={clsx(`
                          univer-absolute univer-box-border univer-flex univer-cursor-pointer univer-items-center
                          univer-rounded-xl univer-pl-2 univer-pr-2 univer-shadow-xs
                        `, borderClassName)}
                        style={{
                            left: item.x,
                            top: Math.max(item.y, 0),
                            backgroundColor: headerBgColor,
                            color: headerTextColor,
                            borderWidth: '0.5px',
                            display: shouldHidden ? 'none' : 'flex',
                            height: anchorHeight ? `${anchorHeight}px` : '24px',
                        }}
                    >
                        <div className="univer-text-nowrap">
                            {inputFocusId === item.tableId
                                ? (
                                    <Input
                                        className="univer-h-[18px] univer-min-w-16 univer-rounded-none"
                                        inputClass="univer-h-[18px] univer-w-[80px]"
                                        value={inputValue}
                                        onChange={(v) => setInputValue(v)}
                                        onBlur={() => handleChangeTableName(item.tableId, inputValue)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleChangeTableName(item.tableId, inputValue);
                                            }
                                        }}
                                        autoFocus={inputFocusId === item.tableId}
                                    />
                                )
                                : (
                                    <div className="univer-h-[18px] univer-max-w-24 univer-truncate univer-text-sm">
                                        {item.tableName}
                                    </div>
                                )}
                        </div>
                        <Dropdown
                            open={openStates[item.tableId] ?? false}
                            onOpenChange={(isOpen) => {
                                updateOpenState(item.tableId, isOpen);
                            }}
                            key={item.tableId}
                            overlay={(
                                <div className="univer-pb-2 univer-pt-2">
                                    <div
                                        className={`
                                          univer-flex univer-min-w-32 univer-cursor-pointer univer-items-center
                                          univer-pb-1 univer-pl-2 univer-pr-2 univer-pt-1 univer-text-sm
                                          hover:univer-bg-gray-200
                                        `}
                                        onClick={() => {
                                            setInputFocusId(item.tableId);
                                            setInputValue(item.tableName);
                                        }}
                                    >
                                        <RenameSingle className="univer-mr-2" />
                                        {localeService.t('sheets-table.rename')}
                                    </div>
                                    <div
                                        className={`
                                          univer-mb-1 univer-mt-1 univer-h-px univer-w-full univer-bg-gray-200
                                        `}
                                    />
                                    <div
                                        onClick={() => handleChangeRange(item.tableId)}
                                        className={`
                                          univer-flex univer-min-w-32 univer-cursor-pointer univer-items-center
                                          univer-pb-1 univer-pl-2 univer-pr-2 univer-pt-1 univer-text-sm
                                          hover:univer-bg-gray-200
                                        `}
                                    >
                                        <GridOutlineSingle className="univer-mr-2" />
                                        {localeService.t('sheets-table.updateRange')}
                                    </div>
                                    <div
                                        className={`
                                          univer-flex univer-min-w-32 univer-cursor-pointer univer-items-center
                                          univer-pb-1 univer-pl-2 univer-pr-2 univer-pt-1 univer-text-sm
                                          hover:univer-bg-gray-200
                                        `}
                                        onClick={() => {
                                            updateOpenState(item.tableId, false);
                                            const table = tableManager.getTableById(unitId, item.tableId);
                                            if (!table) return;
                                            const tableConfig = table.getTableConfig();
                                            const sidebarConfig = {
                                                id: SHEET_TABLE_THEME_PANEL_ID,
                                                header: { title: localeService.t('sheets-table.tableStyle') },
                                                children: {
                                                    label: SHEET_TABLE_THEME_PANEL,
                                                    oldConfig: tableConfig,
                                                    unitId,
                                                    subUnitId,
                                                    tableId: item.tableId,
                                                },
                                                width: 330,
                                            };
                                            sidebarService.open(sidebarConfig);
                                        }}
                                    >
                                        <PaintBucket
                                            extend={{ colorChannel1: 'rgb(53,91,183)' }}
                                            className="univer-mr-2"
                                        />
                                        {localeService.t('sheets-table.setTheme')}
                                    </div>
                                    <div
                                        className={`
                                          univer-mb-1 univer-mt-1 univer-h-px univer-w-full univer-bg-gray-200
                                        `}
                                    />
                                    <div
                                        className={`
                                          univer-flex univer-min-w-32 univer-cursor-pointer univer-items-center
                                          univer-pb-1 univer-pl-2 univer-pr-2 univer-pt-1 univer-text-sm
                                          hover:univer-bg-gray-200
                                        `}
                                        onClick={() => {
                                            updateOpenState(item.tableId, false);
                                            commandService.executeCommand(DeleteSheetTableCommand.id, {
                                                tableId: item.tableId,
                                                subUnitId,
                                                unitId,
                                            });
                                        }}
                                    >
                                        <DeleteSingle className="univer-mr-2" />
                                        {localeService.t('sheets-table.removeTable')}
                                    </div>
                                </div>
                            )}
                            align="start"
                        >
                            <MoreDownSingle />
                        </Dropdown>
                    </div>
                );
            })}
        </div>
    );
};
