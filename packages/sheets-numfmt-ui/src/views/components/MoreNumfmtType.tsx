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

import type { FormatType } from '@univerjs/sheets';
import { ICommandService, LocaleService, Range } from '@univerjs/core';
import { Separator } from '@univerjs/design';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { getPatternPreview, getPatternType, SetNumfmtCommand, SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { ILayoutService, useDependency } from '@univerjs/ui';
import { OpenNumfmtPanelOperator } from '../../commands/operations/open.numfmt.panel.operation';
import { MENU_OPTIONS } from '../../controllers/menu';

export const MORE_NUMFMT_TYPE_KEY = 'sheet.numfmt.moreNumfmtType';
export const OPTIONS_KEY = 'sheet.numfmt.moreNumfmtType.options';

export const MoreNumfmtType = (props: { value?: string }) => {
    const { value } = props;
    const localeService = useDependency(LocaleService);
    const text = value ?? localeService.t('sheet.numfmt.general');

    return <span className="univer-text-sm">{text}</span>;
};

export const Options = () => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const layoutService = useDependency(ILayoutService);
    const sheetsNumfmtCellContentController = useDependency(SheetsNumfmtCellContentController);

    const selectionManagerService = useDependency(SheetsSelectionsService);
    const setNumfmt = (pattern: string | null) => {
        const selection = selectionManagerService.getCurrentLastSelection();
        if (!selection) {
            return;
        }

        const range = selection.range;
        const values: Array<{ row: number; col: number; pattern?: string; type?: FormatType }> = [];
        Range.foreach(range, (row, col) => {
            if (pattern) {
                values.push({ row, col, pattern, type: getPatternType(pattern) });
            } else {
                values.push({ row, col });
            }
        });
        commandService.executeCommand(SetNumfmtCommand.id, { values });

        layoutService.focus();
    };
    const handleOnclick = (index: number) => {
        if (index === 0) {
            setNumfmt(null);
        } else if (index === MENU_OPTIONS.length - 1) {
            // CATUION: This is a command, not a menu item
            commandService.executeCommand(OpenNumfmtPanelOperator.id);
            layoutService.focus();
        } else {
            const item = MENU_OPTIONS[index] as { pattern: string };
            item.pattern && setNumfmt(item.pattern);
        }
    };

    const defaultValue = 1220;

    return (
        <div className="univer-grid univer-gap-1 univer-p-1.5">
            {MENU_OPTIONS.map((item, index) => {
                if (item === '|') {
                    return <Separator key={index} />;
                }
                return (
                    <div
                        key={index}
                        className={`
                          univer-flex univer-h-7 univer-items-center univer-justify-between univer-gap-6 univer-rounded
                          univer-px-2 univer-text-sm
                          dark:hover:univer-bg-gray-700
                          hover:univer-bg-gray-100
                        `}
                        onClick={() => {
                            handleOnclick(index);
                        }}
                    >
                        <span>{localeService.t(item.label)}</span>

                        <span className="univer-text-xs univer-text-gray-500">
                            {item.pattern ? getPatternPreview(item.pattern || '', defaultValue, sheetsNumfmtCellContentController.local).result.trim() : ''}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
