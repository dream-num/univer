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
import { ColorKit, ErrorService, ICommandService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, ColorPicker, Dropdown } from '@univerjs/design';
import { DropdownSingle } from '@univerjs/icons';
import { RangeThemeStyle, SetRangeThemeMutation, SheetRangeThemeModel } from '@univerjs/sheets';
import { AddTableThemeCommand, customEmptyThemeWithBorderStyle, processStyleWithBorderStyle, RemoveTableThemeCommand, SetSheetTableCommand, TableManager } from '@univerjs/sheets-table';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { TABLE_BORDER_DEFAULT, TABLE_BORDER_NONE, TABLE_BORDER_SELECTED, TABLE_CUSTOM_NAME_PREFIX, TABLE_DEFAULT_BG_COLOR, TABLE_DEFAULT_NAME_PREFIX } from '../../const';
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

    const rangeThemeMapChanged$ = useObservable(rangeThemeModel.rangeThemeMapChange$);
    const tableRefresh$ = useObservable(sheetTableThemeUIController.refreshTable$);

    const errorService = useDependency(ErrorService);

    const [, setRefresh] = useState(Math.random());

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
    const [hoverCustomId, setHoverCustomId] = useState<string | null>(null);

    const handleThemeChange = (theme: string) => {
        commandService.executeCommand<ISetSheetTableCommandParams>(SetSheetTableCommand.id, {
            unitId,
            tableId,
            theme,
        });
    };

    const handleAddCustomTheme = () => {
        if (customRangeThemes.length >= 11) {
            errorService.emit(localeService.t('sheets-table.customTooMore'));
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
    }, [rangeThemeMapChanged$, tableRefresh$]);

    if (!table) return null;

    return (
        <div>
            <h5>{localeService.t('sheets-table.defaultStyle')}</h5>
            <div className="univer-flex univer-gap-2">
                {defaultRangeThemes.map((item) => {
                    const rangeThemeItem = rangeThemeModel.getDefaultRangeThemeStyle(item);
                    const headerRowBg = rangeThemeItem?.getHeaderRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR;
                    const firstRowBg = rangeThemeItem?.getFirstRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR;
                    const secondRowBg = rangeThemeItem?.getSecondRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR;
                    const lastRowBg = rangeThemeItem?.getLastRowStyle()?.bg?.rgb || TABLE_DEFAULT_BG_COLOR;

                    return (
                        <div
                            key={item}
                            className="univer-h-10 univer-w-8 univer-cursor-pointer univer-p-px"
                            onClick={() => handleThemeChange(item)}
                            style={{
                                border: item === themeConfig.theme ? TABLE_BORDER_SELECTED : TABLE_BORDER_DEFAULT,
                            }}
                        >
                            <div className="univer-box-border univer-h-2.5" style={{ background: headerRowBg, border: `${headerRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                            <div className="univer-box-border univer-h-2.5" style={{ background: firstRowBg, border: `${firstRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                            <div className="univer-box-border univer-h-2.5" style={{ background: secondRowBg, border: `${secondRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                            <div className="univer-box-border univer-h-2.5" style={{ background: lastRowBg, border: `${lastRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                        </div>
                    );
                })}
            </div>

            <h5>{localeService.t('sheets-table.customStyle')}</h5>
            <div className={clsx('univer-w-full univer-rounded-sm', borderClassName)}>
                <div className="univer-flex univer-flex-wrap univer-gap-2 univer-p-2">
                    <div
                        className={clsx(`
                          univer-h-10 univer-w-8 univer-cursor-pointer univer-p-px univer-text-center univer-leading-10
                        `, borderClassName)}
                        onClick={handleAddCustomTheme}
                    >
                        +
                    </div>
                    {customRangeThemes.map((item) => {
                        const rangeThemeItem = rangeThemeModel.getCustomRangeThemeStyle(unitId, item);
                        const headerRowBg = rangeThemeItem?.getHeaderRowStyle()?.bg?.rgb;
                        const firstRowBg = rangeThemeItem?.getFirstRowStyle()?.bg?.rgb;
                        const secondRowBg = rangeThemeItem?.getSecondRowStyle()?.bg?.rgb;
                        const lastRowBg = rangeThemeItem?.getLastRowStyle()?.bg?.rgb;

                        return (
                            <div
                                key={item}
                                className="univer-relative univer-h-10 univer-w-8 univer-cursor-pointer univer-p-px"
                                onClick={() => handleThemeChange(item)}
                                style={{
                                    border: item === themeConfig.theme ? TABLE_BORDER_SELECTED : TABLE_BORDER_DEFAULT,
                                }}
                                onMouseEnter={() => setHoverCustomId(item)}
                                onMouseLeave={() => setHoverCustomId(null)}
                            >
                                <div className="univer-box-border univer-h-2.5" style={{ background: headerRowBg ?? TABLE_BORDER_NONE, border: `${headerRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                                <div className="univer-box-border univer-h-2.5" style={{ background: firstRowBg ?? TABLE_BORDER_NONE, border: `${firstRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                                <div className="univer-box-border univer-h-2.5" style={{ background: secondRowBg ?? TABLE_BORDER_NONE, border: `${secondRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />
                                <div className="univer-box-border univer-h-2.5" style={{ background: lastRowBg ?? TABLE_BORDER_NONE, border: `${lastRowBg ? TABLE_BORDER_NONE : TABLE_BORDER_DEFAULT}` }} />

                                <div
                                    className={`
                                      univer-absolute univer-right-[-3px] univer-top-[-3px] univer-h-3 univer-w-3
                                      univer-rounded-md univer-bg-gray-200 univer-text-center univer-text-xs
                                      univer-leading-[10px]
                                    `}
                                    style={{ display: hoverCustomId === item ? 'block' : 'none' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCustomTheme(item);
                                    }}
                                >
                                    x
                                </div>
                            </div>
                        );
                    })}
                </div>

                {customSelected && (
                    <>
                        <div className="univer-h-px univer-w-full univer-bg-gray-200" />
                        <div className="univer-flex univer-flex-col univer-gap-2 univer-p-2">
                            <div className="univer-flex univer-h-9 univer-gap-2">
                                <div
                                    className={clsx(`
                                      univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center
                                      univer-leading-9
                                    `, borderClassName)}
                                    style={{
                                        background: headerBg,
                                        color: new ColorKit(headerBg).isDark() ? '#fff' : '#000',
                                    }}
                                >
                                    {localeService.t('sheets-table.header')}
                                </div>
                                <Dropdown
                                    overlay={(
                                        <div className="univer-p-2">
                                            <ColorPicker
                                                value={headerBg}
                                                onChange={(val) => {
                                                    const headerRowStyle = processStyleWithBorderStyle('headerRowStyle', {
                                                        bg: {
                                                            rgb: val,
                                                        },
                                                        cl: {
                                                            rgb: new ColorKit(val).isDark() ? '#fff' : '#000',
                                                        },
                                                    });
                                                    setCustomTheme(table.getTableStyleId(), { headerRowStyle });
                                                }}
                                            />
                                        </div>
                                    )}
                                >
                                    <div
                                        className={clsx(`
                                          univer-flex univer-cursor-pointer univer-items-center univer-gap-2
                                          univer-rounded-sm univer-bg-white univer-p-1
                                        `, borderClassName)}
                                    >
                                        <div
                                            className={clsx('univer-h-4 univer-w-4 univer-rounded-lg univer-bg-gray-400', borderClassName)}
                                            style={{
                                                background: headerBg,
                                                color: new ColorKit(headerBg).isDark() ? '#fff' : '#000',
                                            }}
                                        />
                                        <DropdownSingle className="univer-h-2 univer-w-2" />
                                    </div>
                                </Dropdown>
                            </div>
                            <div className="univer-flex univer-h-9 univer-gap-2">
                                <div
                                    className={clsx(`
                                      univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center
                                      univer-leading-9
                                    `, borderClassName)}
                                    style={{
                                        background: firstRowBg,
                                        color: new ColorKit(firstRowBg).isDark() ? '#fff' : '#000',
                                    }}
                                >
                                    {localeService.t('sheets-table.firstLine')}
                                </div>
                                <Dropdown
                                    overlay={(
                                        <div className="univer-p-2">
                                            <ColorPicker
                                                value={firstRowBg}
                                                onChange={(val) => {
                                                    setCustomTheme(table.getTableStyleId(), {
                                                        firstRowStyle: {
                                                            bg: {
                                                                rgb: val,
                                                            },
                                                            cl: {
                                                                rgb: new ColorKit(val).isDark() ? '#fff' : '#000',
                                                            },
                                                        },
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                >
                                    <div
                                        className={clsx(`
                                          univer-flex univer-cursor-pointer univer-items-center univer-gap-2
                                          univer-rounded-sm univer-bg-white univer-p-1
                                        `, borderClassName)}
                                    >
                                        <div
                                            className={clsx('univer-h-4 univer-w-4 univer-rounded-lg univer-bg-gray-400', borderClassName)}
                                            style={{ background: firstRowBg }}
                                        />
                                        <DropdownSingle className="univer-h-2 univer-w-2" />
                                    </div>
                                </Dropdown>
                            </div>
                            <div className="univer-flex univer-h-9 univer-gap-2">
                                <div
                                    className={clsx(`
                                      univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center
                                      univer-leading-9
                                    `, borderClassName)}
                                    style={{
                                        background: secondRowBg,
                                        color: new ColorKit(secondRowBg).isDark() ? '#fff' : '#000',
                                    }}
                                >
                                    {localeService.t('sheets-table.secondLine')}
                                </div>
                                <Dropdown
                                    overlay={(
                                        <div className="univer-p-2">
                                            <ColorPicker
                                                value={secondRowBg}
                                                onChange={(val) => setCustomTheme(table.getTableStyleId(), {
                                                    secondRowStyle: {
                                                        bg: {
                                                            rgb: val,
                                                        },
                                                        cl: {
                                                            rgb: new ColorKit(val).isDark() ? '#fff' : '#000',
                                                        },
                                                    },
                                                })}
                                            />
                                        </div>
                                    )}
                                >
                                    <div
                                        className={clsx(`
                                          univer-flex univer-cursor-pointer univer-items-center univer-gap-2
                                          univer-rounded-sm univer-bg-white univer-p-1
                                        `)}
                                    >
                                        <div
                                            className={clsx('univer-h-4 univer-w-4 univer-rounded-lg univer-bg-gray-400', borderClassName)}
                                            style={{ background: secondRowBg }}
                                        />
                                        <DropdownSingle className="univer-h-2 univer-w-2" />
                                    </div>
                                </Dropdown>
                            </div>
                            <div className="univer-flex univer-h-9 univer-gap-2">
                                <div
                                    className={clsx(`
                                      univer-box-border univer-h-full univer-w-52 univer-rounded-sm univer-text-center
                                      univer-leading-9
                                    `, borderClassName)}
                                    style={{
                                        background: lastRowBg,
                                        color: new ColorKit(lastRowBg).isDark() ? '#fff' : '#000',
                                    }}
                                >
                                    {localeService.t('sheets-table.footer')}
                                </div>
                                <Dropdown
                                    overlay={(
                                        <div className="univer-p-2">
                                            <ColorPicker
                                                value={lastRowBg}
                                                onChange={(val) => {
                                                    const lastRowStyle = processStyleWithBorderStyle('lastRowStyle', {
                                                        bg: {
                                                            rgb: val,
                                                        },
                                                        cl: {
                                                            rgb: new ColorKit(val).isDark() ? '#fff' : '#000',
                                                        },
                                                    });
                                                    setCustomTheme(table.getTableStyleId(), { lastRowStyle });
                                                }}
                                            />
                                        </div>
                                    )}
                                >
                                    <div
                                        className={clsx(`
                                          univer-flex univer-cursor-pointer univer-items-center univer-gap-2
                                          univer-rounded-sm univer-bg-white univer-p-1
                                        `, borderClassName)}
                                    >
                                        <div
                                            className={clsx('univer-h-4 univer-w-4 univer-rounded-lg univer-bg-gray-400', borderClassName)}
                                            style={{ background: lastRowBg }}
                                        />
                                        <DropdownSingle className="univer-h-2 univer-w-2" />
                                    </div>
                                </Dropdown>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
