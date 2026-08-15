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

import type { IRangeThemeStyleItem, ISetRangeThemeMutationParams } from '@univerjs/sheets';
import type { IAddTableThemeCommandParams, ISetSheetTableCommandParams, ITableSetConfig } from '@univerjs/sheets-table';
import type { LocaleKey } from '../../locale/types';
import { ColorKit, ErrorService, ICommandService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, ColorPicker, Dropdown } from '@univerjs/design';
import { CloseIcon, DownIcon, IncreaseIcon } from '@univerjs/icons';
import { RangeThemeStyle, SetRangeThemeMutation, SheetRangeThemeModel } from '@univerjs/sheets';
import {
    AddTableThemeCommand,
    customEmptyThemeWithBorderStyle,
    processStyleWithBorderStyle,
    RemoveTableThemeCommand,
    SetSheetTableCommand,
    TableManager,
} from '@univerjs/sheets-table';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import {
    TABLE_BORDER_DEFAULT,
    TABLE_BORDER_NONE,
    TABLE_CUSTOM_NAME_PREFIX,
    TABLE_DEFAULT_BG_COLOR,
    TABLE_DEFAULT_NAME_PREFIX,
} from '../../const';
import { SheetTableThemeUIController } from '../../controllers/sheet-table-theme-ui.controller';

export interface ISheetTableThemePanelProps {
    unitId: string;
    subUnitId: string;
    tableId: string;
    oldConfig: ITableSetConfig;
}

interface ITableThemeStyle {
    headerRowStyle?: IRangeThemeStyleItem;
    firstRowStyle?: IRangeThemeStyleItem;
    secondRowStyle?: IRangeThemeStyleItem;
    lastRowStyle?: IRangeThemeStyleItem;
}

export const SheetTableThemePanel = (props: ISheetTableThemePanelProps) => {
    const { unitId, subUnitId, tableId } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const tableManager = useDependency(TableManager);
    const table = tableManager.getTableById(unitId, tableId);
    const rangeThemeModel = useDependency(SheetRangeThemeModel);
    const sheetTableThemeUIController = useDependency(SheetTableThemeUIController);

    const rangeThemeMapChanged = useObservable(rangeThemeModel.rangeThemeMapChange$);
    const tableRefresh = useObservable(sheetTableThemeUIController.refreshTable$);

    const errorService = useDependency(ErrorService);

    const [, setRefresh] = useState(Math.random);

    const themeConfig = useObservable(tableManager.tableThemeChanged$, {
        theme: table?.getTableStyleId(),
        oldTheme: table?.getTableStyleId(),
        unitId,
        subUnitId,
        tableId,
    });

    const defaultRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item?.startsWith(TABLE_DEFAULT_NAME_PREFIX));
    const customRangeThemes = rangeThemeModel.getALLRegisteredTheme(unitId).filter((item) => item?.startsWith(TABLE_CUSTOM_NAME_PREFIX));
    const selectedTheme = table?.getTableStyleId();
    const customSelected = customRangeThemes.find((item) => item === selectedTheme);
    const customStyleName = customSelected || customRangeThemes[0];
    const customStyle = rangeThemeModel.getCustomRangeThemeStyle(unitId, customStyleName);
    const headerBg = customStyle?.getHeaderRowStyle()?.bg?.rgb ?? TABLE_DEFAULT_BG_COLOR;
    const firstRowBg = customStyle?.getFirstRowStyle()?.bg?.rgb ?? TABLE_DEFAULT_BG_COLOR;
    const secondRowBg = customStyle?.getSecondRowStyle()?.bg?.rgb ?? TABLE_DEFAULT_BG_COLOR;
    const lastRowBg = customStyle?.getLastRowStyle()?.bg?.rgb ?? TABLE_DEFAULT_BG_COLOR;
    const direction = useObservable(localeService.direction$, localeService.getDirection());

    const handleThemeChange = (theme: string) => {
        commandService.executeCommand<ISetSheetTableCommandParams>(SetSheetTableCommand.id, {
            unitId,
            tableId,
            theme,
        });
    };

    const handleAddCustomTheme = () => {
        if (customRangeThemes.length >= 11) {
            errorService.emit(localeService.t<LocaleKey>('sheets-table-ui.customTooMore'));
            return;
        }
        const lastCustomTheme = customRangeThemes[customRangeThemes.length - 1];
        let newThemeName = `${TABLE_CUSTOM_NAME_PREFIX}1`;
        if (lastCustomTheme) {
            const index = Number(lastCustomTheme.split('-')[2]);
            newThemeName = `${TABLE_CUSTOM_NAME_PREFIX}${index + 1}`;
        }
        const newTheme = new RangeThemeStyle(newThemeName, { ...customEmptyThemeWithBorderStyle });
        commandService.executeCommand<IAddTableThemeCommandParams>(AddTableThemeCommand.id, {
            unitId,
            tableId,
            themeStyle: newTheme,
        });
    };

    const setCustomTheme = (themeName: string, tableThemeStyle: ITableThemeStyle) => {
        commandService.executeCommand<ISetRangeThemeMutationParams>(SetRangeThemeMutation.id, {
            unitId,
            subUnitId,
            styleName: themeName,
            style: tableThemeStyle,
        });
    };

    const removeCustomTheme = (themeName: string) => {
        commandService.executeCommand(RemoveTableThemeCommand.id, {
            unitId,
            tableId,
            themeName,
        });
    };

    useEffect(() => {
        setRefresh(Math.random());
    }, [rangeThemeMapChanged, tableRefresh]);

    if (!table) return null;

    const headerBgIsDark = new ColorKit(headerBg).isDark();
    const firstRowBgIsDark = new ColorKit(firstRowBg).isDark();
    const secondRowBgIsDark = new ColorKit(secondRowBg).isDark();
    const lastRowBgIsDark = new ColorKit(lastRowBg).isDark();

    const customThemeRows = [
        {
            key: 'header',
            label: localeService.t<LocaleKey>('sheets-table-ui.header'),
            background: headerBg,
            isDark: headerBgIsDark,
            onChange: (value: string) => {
                const headerRowStyle = processStyleWithBorderStyle('headerRowStyle', {
                    bg: { rgb: value },
                    cl: { rgb: new ColorKit(value).isDark() ? '#fff' : '#000' },
                });
                setCustomTheme(table.getTableStyleId(), { headerRowStyle });
            },
        },
        {
            key: 'first-row',
            label: localeService.t<LocaleKey>('sheets-table-ui.firstLine'),
            background: firstRowBg,
            isDark: firstRowBgIsDark,
            onChange: (value: string) => {
                setCustomTheme(table.getTableStyleId(), {
                    firstRowStyle: {
                        bg: { rgb: value },
                        cl: { rgb: new ColorKit(value).isDark() ? '#fff' : '#000' },
                    },
                });
            },
        },
        {
            key: 'second-row',
            label: localeService.t<LocaleKey>('sheets-table-ui.secondLine'),
            background: secondRowBg,
            isDark: secondRowBgIsDark,
            onChange: (value: string) => {
                setCustomTheme(table.getTableStyleId(), {
                    secondRowStyle: {
                        bg: { rgb: value },
                        cl: { rgb: new ColorKit(value).isDark() ? '#fff' : '#000' },
                    },
                });
            },
        },
        {
            key: 'last-row',
            label: localeService.t<LocaleKey>('sheets-table-ui.footer'),
            background: lastRowBg,
            isDark: lastRowBgIsDark,
            onChange: (value: string) => {
                const lastRowStyle = processStyleWithBorderStyle('lastRowStyle', {
                    bg: { rgb: value },
                    cl: { rgb: new ColorKit(value).isDark() ? '#fff' : '#000' },
                });
                setCustomTheme(table.getTableStyleId(), { lastRowStyle });
            },
        },
    ];

    return (
        <div dir={direction} className="univer-flex univer-flex-col univer-gap-5 univer-pb-4">
            <section className="univer-flex univer-flex-col univer-gap-2">
                <h5
                    className="
                      univer-m-0 univer-text-xs univer-font-medium univer-text-gray-500
                      dark:!univer-text-gray-300
                    "
                >
                    {localeService.t<LocaleKey>('sheets-table-ui.defaultStyle')}
                </h5>
                <div className="univer-grid univer-grid-cols-6 univer-gap-2">
                    {defaultRangeThemes.map((item) => {
                        const rangeThemeItem = rangeThemeModel.getDefaultRangeThemeStyle(item);
                        const rowBackgrounds = [
                            rangeThemeItem?.getHeaderRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR,
                            rangeThemeItem?.getFirstRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR,
                            rangeThemeItem?.getSecondRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR,
                            rangeThemeItem?.getLastRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR,
                        ];
                        const selected = item === themeConfig.theme;

                        return (
                            <button
                                key={item}
                                type="button"
                                title={item}
                                aria-label={item}
                                aria-pressed={selected}
                                className={clsx(`
                                  univer-flex univer-h-12 univer-w-full univer-cursor-pointer univer-flex-col
                                  univer-overflow-hidden univer-rounded-lg univer-bg-gray-0 univer-p-1 univer-shadow-sm
                                  univer-transition-all
                                  hover:univer-border-gray-400 hover:univer-shadow-md
                                  focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-200
                                  dark:!univer-bg-gray-800
                                `, borderClassName, {
                                    '!univer-border-primary-500 univer-ring-2 univer-ring-primary-100': selected,
                                })}
                                onClick={() => handleThemeChange(item)}
                            >
                                {rowBackgrounds.map((background, index) => (
                                    <span
                                        key={index}
                                        className="univer-min-h-0 univer-w-full univer-flex-1"
                                        style={{
                                            background,
                                            border: background ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT,
                                        }}
                                    />
                                ))}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="univer-flex univer-flex-col univer-gap-2">
                <h5
                    className="
                      univer-m-0 univer-text-xs univer-font-medium univer-text-gray-500
                      dark:!univer-text-gray-300
                    "
                >
                    {localeService.t<LocaleKey>('sheets-table-ui.customStyle')}
                </h5>
                <div
                    className="
                      univer-grid univer-grid-cols-5 univer-gap-2 univer-rounded-lg univer-bg-gray-50 univer-p-2
                      dark:!univer-bg-gray-800
                    "
                >
                    <button
                        type="button"
                        data-u-comp="sheet-table-theme-add"
                        aria-label={localeService.t<LocaleKey>('sheets-table-ui.setTheme')}
                        className="
                          univer-flex univer-h-12 univer-w-full univer-cursor-pointer univer-items-center
                          univer-justify-center univer-rounded-lg univer-border univer-border-dashed
                          univer-border-gray-300 univer-bg-gray-0 univer-p-0 univer-text-gray-500
                          univer-transition-colors
                          hover:univer-border-primary-500 hover:univer-text-primary-600
                          focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-200
                          dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-gray-300
                        "
                        onClick={handleAddCustomTheme}
                    >
                        <IncreaseIcon className="univer-size-4" />
                    </button>
                    {customRangeThemes.map((item) => {
                        const rangeThemeItem = rangeThemeModel.getCustomRangeThemeStyle(unitId, item);
                        const rowBackgrounds = [
                            rangeThemeItem?.getHeaderRowStyle()?.bg?.rgb,
                            rangeThemeItem?.getFirstRowStyle()?.bg?.rgb,
                            rangeThemeItem?.getSecondRowStyle()?.bg?.rgb,
                            rangeThemeItem?.getLastRowStyle()?.bg?.rgb,
                        ];
                        const selected = item === themeConfig.theme;

                        return (
                            <div key={item} className="univer-group univer-relative univer-h-12 univer-min-w-0">
                                <button
                                    type="button"
                                    title={item}
                                    aria-label={item}
                                    aria-pressed={selected}
                                    className={clsx(`
                                      univer-flex univer-size-full univer-cursor-pointer univer-flex-col
                                      univer-overflow-hidden univer-rounded-lg univer-bg-gray-0 univer-p-1
                                      univer-shadow-sm univer-transition-all
                                      hover:univer-border-gray-400 hover:univer-shadow-md
                                      focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-200
                                      dark:!univer-bg-gray-900
                                    `, borderClassName, {
                                        '!univer-border-primary-500 univer-ring-2 univer-ring-primary-100': selected,
                                    })}
                                    onClick={() => handleThemeChange(item)}
                                >
                                    {rowBackgrounds.map((background, index) => (
                                        <span
                                            key={index}
                                            className="univer-min-h-0 univer-w-full univer-flex-1"
                                            style={{
                                                background: background ?? TABLE_BORDER_NONE,
                                                border: background ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT,
                                            }}
                                        />
                                    ))}
                                </button>
                                <button
                                    type="button"
                                    data-u-comp="sheet-table-theme-remove"
                                    aria-label={`${localeService.t<LocaleKey>('sheets-table-ui.customStyle')} ${item}`}
                                    className={clsx(`
                                      univer-absolute univer-right-[-6px] univer-top-[-6px] univer-z-10 univer-flex
                                      univer-size-5 univer-cursor-pointer univer-items-center univer-justify-center
                                      univer-rounded-full univer-border univer-border-solid univer-border-gray-200
                                      univer-bg-gray-0 univer-p-0 univer-text-gray-500 univer-shadow-sm
                                      univer-transition-all
                                      hover:univer-border-red-200 hover:univer-bg-red-50 hover:univer-text-red-600
                                      focus:univer-opacity-100 focus:univer-outline-none focus:univer-ring-2
                                      focus:univer-ring-primary-200
                                      rtl:univer-left-[-6px] rtl:univer-right-auto
                                      dark:!univer-border-gray-600 dark:!univer-bg-gray-900
                                    `, {
                                        'univer-opacity-100': selected,
                                        'univer-opacity-0 group-focus-within:univer-opacity-100 group-hover:univer-opacity-100': !selected,
                                    })}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        removeCustomTheme(item);
                                    }}
                                >
                                    <CloseIcon className="univer-size-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {customSelected && (
                    <div
                        className="
                          univer-flex univer-flex-col univer-gap-2 univer-rounded-lg univer-bg-gray-50 univer-p-3
                          dark:!univer-bg-gray-800
                        "
                    >
                        {customThemeRows.map((row) => (
                            <div key={row.key} className="univer-flex univer-h-10 univer-min-w-0 univer-gap-2">
                                <div
                                    className={clsx(`
                                      univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-rounded-md
                                      univer-px-3 univer-text-sm univer-font-medium
                                      rtl:univer-text-right
                                    `, borderClassName, {
                                        'univer-text-gray-0': row.isDark,
                                        'univer-text-gray-900': !row.isDark,
                                    })}
                                    style={{ background: row.background }}
                                >
                                    <span className="univer-truncate">{row.label}</span>
                                </div>
                                <Dropdown
                                    overlay={(
                                        <div dir={direction} className="univer-p-2">
                                            <ColorPicker
                                                value={new ColorKit(row.background).toHexString()}
                                                onChange={row.onChange}
                                            />
                                        </div>
                                    )}
                                >
                                    <button
                                        type="button"
                                        aria-label={`${row.label} ${localeService.t<LocaleKey>('sheets-table-ui.setTheme')}`}
                                        className={clsx(`
                                          univer-flex univer-h-10 univer-cursor-pointer univer-items-center univer-gap-2
                                          univer-rounded-md univer-bg-gray-0 univer-px-2 univer-text-gray-600
                                          univer-transition-colors
                                          hover:univer-bg-gray-100
                                          focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-200
                                          dark:!univer-bg-gray-900 dark:!univer-text-gray-300
                                        `, borderClassName)}
                                    >
                                        <span
                                            className={clsx('univer-size-4 univer-rounded-full', borderClassName)}
                                            style={{ background: row.background }}
                                        />
                                        <DownIcon className="univer-size-3" />
                                    </button>
                                </Dropdown>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
